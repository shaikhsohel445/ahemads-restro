import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type {
  RestoreBackupDto,
  SessionUser,
  SetBackupConfigDto,
} from '@nodedr-restaurant/types';
import { AuditService } from '../audit/audit.service';
import { workerEnv } from '../cloudflare/bindings';
import type { NotifyPayload } from '../notifications/notifications.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { dumpGzip, gunzipText, restoreDump } from './d1-dump';

const CONFIG_ID = 'singleton';
// Shown in Settings > Backup where the S3 endpoint/bucket used to be.
const R2_ENDPOINT_LABEL = 'Cloudflare R2';
const R2_BUCKET_LABEL = 'BACKUPS (Worker binding)';

interface EffectiveConfig {
  intervalDays: number;
  retainCount: number;
  source: 'database' | 'environment';
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Full-instance backup of the D1 database to the Worker's `BACKUPS` R2
 * bucket.
 *
 * Same behaviour and API as the self-hosted module it replaces (manual and
 * scheduled backups, upload-then-verify by re-downloading and comparing the
 * SHA-256, retention that never leaves zero verified backups, downloads,
 * Owner-only restore guarded by `confirm: "RESTORE"`, audit + owner
 * notifications at every step). What changed is the transport:
 *   - `pg_dump`/`pg_restore` -> a logical gzip'd NDJSON export of every D1
 *     table (see d1-dump.ts); no child processes exist on Workers.
 *   - any S3-compatible bucket configured in Settings -> the R2 bucket bound
 *     to the Worker. There are no credentials to enter or leak; Settings only
 *     keeps the schedule (interval / how many to keep).
 *   - the uploads volume tarball -> nothing: menu photos, logos and document
 *     attachments already live in R2 (durable, and not touched by a restore).
 *
 * D1 Time Travel (point-in-time restore of the last 30 days, run with
 * `wrangler d1 time-travel restore`) is the primary disaster-recovery path;
 * these backups are the portable, downloadable copy.
 *
 * Instance-wide by design, exactly as before: the dump covers every
 * restaurant on this deployment.
 */
@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private get bucket() {
    return workerEnv().BACKUPS;
  }

  private async getConfig(): Promise<EffectiveConfig> {
    const row = await this.prisma.backupConfig.findUnique({
      where: { id: CONFIG_ID },
    });
    if (row) {
      return {
        intervalDays: row.intervalDays,
        retainCount: row.retainCount,
        source: 'database',
      };
    }
    return {
      intervalDays: Number(process.env.BACKUP_INTERVAL_DAYS ?? 3),
      retainCount: Number(process.env.BACKUP_RETAIN_COUNT ?? 2),
      source: 'environment',
    };
  }

  // Belt-and-suspenders gate for restore specifically. Every other
  // @Auth()-gated action in this codebase checks a *permission key*, never
  // a role name (see roles.service.ts's own comment on why Role.name is
  // free-form since Phase 2) — but restore is categorically different from
  // everything else `backup.manage` also gates (trigger/list/download):
  // PermissionsSyncService auto-grants EVERY permission, including
  // `backup.manage`, to both the OWNER and ADMINISTRATOR role of every
  // restaurant on this instance (see permissions-sync.service.ts's
  // `ALWAYS_FULL_ACCESS_ROLES`). Because backups/restores are instance-wide
  // — not scoped to the caller's own restaurant — relying on the
  // permission guard alone would let any restaurant's Administrator (or a
  // future custom role explicitly granted `backup.manage` for legitimate
  // trigger/download access) drop and recreate the ENTIRE shared Postgres
  // instance, silently overwriting every OTHER restaurant's data too. That
  // blast radius is unique to this one endpoint, so it gets the one
  // deliberately hardcoded role-name check in this whole feature —
  // matching both zulivio's own `requireMasterOwner()` precedent and this
  // codebase's own precedent for infra-level role checks
  // (`ALWAYS_FULL_ACCESS_ROLES` itself compares `role.name` directly).
  private requireOwner(user: SessionUser) {
    if (user.roleName !== 'OWNER') {
      throw new ForbiddenException('Only the Owner can restore a backup');
    }
  }

  async status() {
    const [config, lastVerified, lastAny] = await Promise.all([
      this.getConfig(),
      this.prisma.backup.findFirst({
        where: { status: 'VERIFIED' },
        orderBy: { verifiedAt: 'desc' },
      }),
      this.prisma.backup.findFirst({ orderBy: { createdAt: 'desc' } }),
    ]);

    const nextScheduledAt = lastVerified?.verifiedAt
      ? new Date(
          lastVerified.verifiedAt.getTime() +
            config.intervalDays * 24 * 60 * 60 * 1000,
        )
      : null;

    return {
      // The R2 bucket is a deployment binding, so backups are always set up.
      configured: true,
      source: config.source,
      endpoint: R2_ENDPOINT_LABEL,
      bucket: R2_BUCKET_LABEL,
      region: 'auto',
      accessKeyIdMasked: null,
      intervalDays: config.intervalDays,
      retainCount: config.retainCount,
      lastBackup: lastAny,
      nextScheduledAt,
    };
  }

  list() {
    return this.prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Saves the schedule. S3 endpoint/key fields sent by older clients are
   * ignored: the destination is the bound R2 bucket. A probe object is still
   * written, read back and deleted so a missing or misconfigured binding
   * surfaces now, not at the next scheduled run.
   */
  async setConfig(user: SessionUser, dto: SetBackupConfigDto) {
    const intervalDays = dto.intervalDays ?? 3;
    const retainCount = dto.retainCount ?? 2;
    const probeKey = `connectivity-check/${Date.now()}.txt`;
    try {
      await this.bucket.put(probeKey, 'ok');
      const back = await this.bucket.get(probeKey);
      if ((await back?.text()) !== 'ok') throw new Error('probe read back wrong');
      await this.bucket.delete(probeKey);
    } catch (err) {
      throw new BadRequestException(
        `The BACKUPS R2 bucket is not reachable: ${(err as Error).message}`,
      );
    }

    const data = {
      endpoint: R2_ENDPOINT_LABEL,
      bucket: R2_BUCKET_LABEL,
      accessKeyId: '',
      secretAccessKey: '',
      region: 'auto',
      intervalDays,
      retainCount,
      updatedById: user.id,
    };
    await this.prisma.backupConfig.upsert({
      where: { id: CONFIG_ID },
      create: { id: CONFIG_ID, ...data },
      update: data,
    });

    await this.audit.record({
      userId: user.id,
      action: 'backup.config_updated',
      entity: 'BackupConfig',
      metadata: { destination: 'r2', intervalDays, retainCount },
    });

    return this.status();
  }

  async clearConfig(user: SessionUser) {
    await this.prisma.backupConfig.deleteMany({ where: { id: CONFIG_ID } });
    await this.audit.record({
      userId: user.id,
      action: 'backup.config_cleared',
      entity: 'BackupConfig',
    });
    return this.status();
  }

  async triggerManual(user: SessionUser) {
    return this.runBackup(await this.getConfig(), user.id);
  }

  /**
   * Checked hourly rather than scheduled directly on a multi-day cron.
   * Actual cadence is driven by comparing "now" against the last VERIFIED
   * backup's verifiedAt, not by this check's own frequency.
   */
  // Runs hourly (Cron Trigger "0 * * * *", see src/cloudflare/scheduled.ts).
  async checkSchedule() {
    const config = await this.getConfig();
    const last = await this.prisma.backup.findFirst({
      where: { status: 'VERIFIED' },
      orderBy: { verifiedAt: 'desc' },
    });
    const due =
      !last?.verifiedAt ||
      Date.now() - last.verifiedAt.getTime() >=
        config.intervalDays * 24 * 60 * 60 * 1000;
    if (!due) return;

    this.logger.log(
      `Backup interval elapsed (${config.intervalDays}d) — starting scheduled backup`,
    );
    try {
      await this.runBackup(config, null);
    } catch (err) {
      this.logger.error(`Scheduled backup failed: ${(err as Error).message}`);
    }
  }

  private async runBackup(
    config: EffectiveConfig,
    triggeredById: string | null,
  ) {
    const record = await this.prisma.backup.create({
      data: { triggeredById, status: 'PENDING' },
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (triggeredById) {
      await this.audit.record({
        userId: triggeredById,
        action: 'backup.triggered',
        entity: 'Backup',
        entityId: record.id,
      });
    }

    try {
      const dump = await dumpGzip(workerEnv().DB);
      const sha256 = sha256Hex(dump);
      const dbKey = `${timestamp}/db.ndjson.gz`;
      await this.bucket.put(dbKey, dump, {
        httpMetadata: { contentType: 'application/gzip' },
        customMetadata: { sha256, backupId: record.id },
      });

      const downloaded = await this.bucket.get(dbKey);
      const roundTrip = downloaded
        ? new Uint8Array(await downloaded.arrayBuffer())
        : new Uint8Array();
      if (sha256Hex(roundTrip) !== sha256) {
        throw new Error(
          'Verification failed: downloaded db backup does not match the uploaded content',
        );
      }

      const completed = await this.prisma.backup.update({
        where: { id: record.id },
        data: {
          status: 'VERIFIED',
          s3KeyDb: dbKey,
          s3KeyUploads: null,
          sizeBytes: dump.byteLength,
          sha256,
          verifiedAt: new Date(),
        },
      });

      await this.enforceRetention(config);
      await this.notifyOwners({
        type: 'backup.completed',
        title: 'Backup completed',
        body: `A new backup finished and was verified (${(dump.byteLength / (1024 * 1024)).toFixed(1)} MB).`,
        entity: 'Backup',
        entityId: record.id,
      });
      return completed;
    } catch (err) {
      const failureReason = (err as Error).message;
      await this.prisma.backup.update({
        where: { id: record.id },
        data: { status: 'FAILED', failureReason },
      });
      await this.notifyOwners({
        type: 'backup.failed',
        title: 'Backup failed',
        body: failureReason,
        entity: 'Backup',
        entityId: record.id,
      });
      throw err;
    }
  }

  /**
   * Keeps the most recent `retainCount` VERIFIED backups and deletes older
   * ones, oldest-first, so a verified backup exists at every point in time.
   */
  private async enforceRetention(config: EffectiveConfig) {
    const verified = await this.prisma.backup.findMany({
      where: { status: 'VERIFIED' },
      orderBy: { verifiedAt: 'desc' },
    });
    const stale = verified.slice(config.retainCount);
    for (const old of stale) {
      try {
        if (old.s3KeyDb) await this.bucket.delete(old.s3KeyDb);
        if (old.s3KeyUploads) await this.bucket.delete(old.s3KeyUploads);
        await this.prisma.backup.delete({ where: { id: old.id } });
      } catch (err) {
        this.logger.error(
          `Failed to delete stale backup ${old.id}: ${(err as Error).message}`,
        );
      }
    }
  }

  /** The stored dump of a VERIFIED backup, for download. Audited. */
  async prepareDownload(user: SessionUser, id: string) {
    const record = await this.prisma.backup.findFirst({ where: { id } });
    if (!record || record.status !== 'VERIFIED' || !record.s3KeyDb) {
      throw new BadRequestException(
        'Backup not found or not in a downloadable (VERIFIED) state',
      );
    }
    const object = await this.bucket.get(record.s3KeyDb);
    if (!object) throw new BadRequestException('Backup file is missing from R2');

    await this.audit.record({
      userId: user.id,
      action: 'backup.downloaded',
      entity: 'Backup',
      entityId: record.id,
    });
    return { record, data: new Uint8Array(await object.arrayBuffer()) };
  }

  /**
   * A fresh dump for the caller to keep on their own computer; nothing is
   * stored and no Backup row is written. Audited as `backup.exported`.
   */
  async prepareLocalExport(user: SessionUser) {
    await this.audit.record({
      userId: user.id,
      action: 'backup.exported',
      entity: 'Backup',
      entityId: 'local',
    });
    return dumpGzip(workerEnv().DB);
  }

  /**
   * Destructive: replaces every table's contents with the backup's. Gated to
   * the Owner role (the controller's `@Auth('backup.manage')` guard plus
   * `requireOwner()`), the literal `confirm: "RESTORE"`, and VERIFIED
   * backups only. Audited and notified before starting and after finishing.
   */
  async restore(user: SessionUser, id: string, dto: RestoreBackupDto) {
    this.requireOwner(user);
    if (dto.confirm !== 'RESTORE') {
      throw new BadRequestException(
        'This is destructive. Pass confirm: "RESTORE" to proceed.',
      );
    }

    const record = await this.prisma.backup.findFirst({
      where: { id, status: 'VERIFIED' },
    });
    if (!record?.s3KeyDb) {
      throw new BadRequestException(
        'Backup not found or not in a restorable (VERIFIED) state',
      );
    }

    const startedAt = new Date().toISOString();
    await this.audit.record({
      userId: user.id,
      action: 'backup.restore_started',
      entity: 'Backup',
      entityId: record.id,
      metadata: { backupId: record.id, startedAt },
    });
    await this.notifyOwners({
      type: 'backup.restore_started',
      title: 'Restore started',
      body: `${user.name} started restoring the database from a backup taken ${record.createdAt.toISOString()}. The app may be briefly unavailable.`,
      entity: 'Backup',
      entityId: record.id,
    });

    try {
      const object = await this.bucket.get(record.s3KeyDb);
      if (!object) throw new Error('Backup file is missing from R2');
      const bytes = new Uint8Array(await object.arrayBuffer());
      if (record.sha256 && sha256Hex(bytes) !== record.sha256)
        throw new Error('Backup file failed its SHA-256 check');
      const result = await restoreDump(workerEnv().DB, await gunzipText(bytes));

      const completedAt = new Date().toISOString();
      await this.audit.record({
        userId: user.id,
        action: 'backup.restored',
        entity: 'Backup',
        entityId: record.id,
        metadata: { backupId: record.id, startedAt, completedAt, ...result },
      });
      await this.notifyOwners({
        type: 'backup.restored',
        title: 'Restore completed',
        body: `The database was restored from the backup taken ${record.createdAt.toISOString()}.`,
        entity: 'Backup',
        entityId: record.id,
      });

      return { ok: true, restoredFrom: record.id };
    } catch (err) {
      const failureReason = (err as Error).message;
      await this.audit.record({
        userId: user.id,
        action: 'backup.restore_failed',
        entity: 'Backup',
        entityId: record.id,
        metadata: { backupId: record.id, startedAt, error: failureReason },
      });
      await this.notifyOwners({
        type: 'backup.restore_failed',
        title: 'Restore failed',
        body: failureReason,
        entity: 'Backup',
        entityId: record.id,
      });
      throw err;
    }
  }

  private async notifyOwners(payload: NotifyPayload) {
    const owners = await this.prisma.user.findMany({
      where: { role: { name: 'OWNER' }, isActive: true },
      select: {
        id: true,
        branches: {
          select: { branchId: true },
          orderBy: { branch: { createdAt: 'asc' } },
          take: 1,
        },
      },
    });

    for (const owner of owners) {
      const branchId = owner.branches[0]?.branchId;
      if (!branchId) continue;
      await this.notifications.notifyUser(owner.id, branchId, payload);
    }
  }
}
