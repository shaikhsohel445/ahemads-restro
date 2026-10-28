import type { INestApplicationContext, Type } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { BackupService } from '../backup/backup.service';
import { ScheduledOrdersService } from '../modules/orders/scheduled-orders.service';
import { ReportSchedulesService } from '../modules/reports/report-schedules.service';
import { VerifactuService } from '../modules/verifactu/verifactu.service';
import { WebhooksService } from '../modules/webhooks/webhooks.service';

// The @nestjs/schedule jobs of the self-hosted build, now driven by Cloudflare
// Cron Triggers (wrangler.jsonc `triggers.crons`, always UTC). Each job keeps
// its own idempotency (claimed rows, "due" checks), so a retried or
// overlapping trigger is harmless, as it was with in-process timers.
interface Job {
  name: string;
  service: Type<unknown>;
  run: (service: never) => Promise<unknown>;
}

const job = <T>(
  name: string,
  service: Type<T>,
  run: (s: T) => Promise<unknown>,
): Job => ({ name, service, run: run });

export const CRON_JOBS: Record<string, Job[]> = {
  // Was EVERY_MINUTE (scheduled orders, Verifactu) and EVERY_10_SECONDS
  // (webhook retries; new deliveries are now also sent immediately).
  '* * * * *': [
    job('scheduled-orders', ScheduledOrdersService, (s) => s.tick()),
    job('verifactu-submit', VerifactuService, (s) => s.tick()),
    job('webhook-retries', WebhooksService, (s) => s.tick()),
  ],
  '*/10 * * * *': [
    job('report-emails', ReportSchedulesService, (s) => s.tick()),
  ],
  '0 * * * *': [
    job('backup-schedule', BackupService, (s) => s.checkSchedule()),
  ],
  // 00:00 UTC = 03:00 Asia/Riyadh (was EVERY_DAY_AT_3AM, server-local time).
  '0 0 * * *': [job('webhook-cleanup', WebhooksService, (s) => s.cleanup())],
};

export async function runCron(app: INestApplicationContext, cron: string) {
  const logger = new Logger('Cron');
  const jobs = CRON_JOBS[cron] ?? [];
  if (!jobs.length) logger.warn(`No jobs registered for cron "${cron}"`);
  const results = await Promise.allSettled(
    jobs.map((j) => j.run(app.get(j.service, { strict: false }))),
  );
  results.forEach((r, i) => {
    if (r.status === 'rejected')
      logger.error(`${jobs[i].name} failed: ${String(r.reason)}`);
  });
}
