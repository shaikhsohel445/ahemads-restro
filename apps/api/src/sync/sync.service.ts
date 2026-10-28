import { Injectable, NotImplementedException } from '@nestjs/common';

export interface SyncChange {
  seq?: string;
  tbl: string;
  pk: Record<string, unknown>;
  pkKey: string;
  op: 'U' | 'D';
  row: Record<string, unknown> | null;
  ts: string;
}

export interface ApplyResult {
  applied: number;
  skipped: number;
  conflicts: { tbl: string; pk: string; error: string }[];
}

export const SYNC_UNAVAILABLE =
  'Server sync is not available on the Cloudflare deployment. It synchronised ' +
  'self-hosted (PostgreSQL) installs with a hub through PostgreSQL triggers; ' +
  'on Cloudflare every terminal already talks to the one shared D1 database, ' +
  'so there is nothing to sync. See docs/cloudflare/MIGRATION-REPORT.md.';

/**
 * Two-way sync between an embedded (Windows/desktop, PostgreSQL) install and
 * a central server — NOT migrated.
 *
 * The self-hosted implementation captured changes with PL/pgSQL triggers
 * (`sync_install_triggers()`, `sync_seed()`), introspected `pg_class` /
 * `pg_attribute`, and exchanged raw PostgreSQL row images keyed by
 * `_prisma_migrations` schema versions. None of that exists on D1, and the
 * row images of a PostgreSQL client could not be applied to the D1 schema
 * without a separate translation layer. On Cloudflare the deployment itself
 * is the always-online central system that sync used to approximate.
 *
 * The endpoints are kept so existing screens get a clear, stable answer:
 * status reports "disabled", and every action returns 501 with the reason.
 * The original implementation is preserved for reference at
 * prisma/pg-migrations-reference/sync.service.pg-reference.ts.txt.
 */
@Injectable()
export class SyncService {
  state() {
    return Promise.resolve({
      enabled: false,
      role: 'unavailable',
      deviceId: '',
      serverUrl: null as string | null,
      apiKey: null as string | null,
      seeded: false,
      lastPullSeq: 0n,
      lastPushSeq: 0n,
      lastSyncAt: null as Date | null,
      lastError: null as string | null,
      conflicts: [] as unknown[],
    });
  }

  publicStatus() {
    return Promise.resolve({
      enabled: false,
      role: 'unavailable',
      serverUrl: null,
      hasKey: false,
      lastSyncAt: null,
      lastError: SYNC_UNAVAILABLE,
      pendingChanges: 0,
      conflicts: [],
      unavailable: true,
    });
  }

  schemaVersion(): Promise<string> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }

  pull(_since: bigint, _device: string): Promise<never> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }

  push(_device: string, _changes: SyncChange[]): Promise<ApplyResult> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }

  testConnection(_serverUrl: string, _apiKey: string): Promise<never> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }

  enable(
    _serverUrl: string,
    _apiKey: string,
    _mode: 'adopt' | 'merge',
  ): Promise<never> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }

  disable(): Promise<void> {
    return Promise.resolve();
  }

  runOnce(): Promise<never> {
    return Promise.reject(new NotImplementedException(SYNC_UNAVAILABLE));
  }
}
