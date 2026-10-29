# Operations: backups, recovery, scheduled jobs, monitoring

## Recovery options

| Situation | Tool |
|---|---|
| Bad deploy (code) | `wrangler rollback --env production` (API and web separately) |
| Bad data change, last 30 days | **D1 Time Travel**: `wrangler d1 time-travel restore DB --env production --timestamp <ISO>` — atomic, whole database |
| Portable copy / move elsewhere | In-app backups (below) |
| Deleted photo or attachment | R2 has no undelete; keep a periodic copy of the UPLOADS bucket elsewhere (e.g. rclone) if that matters |

Bookmark before risky operations: `wrangler d1 time-travel info DB --env production`.

## In-app backups (Settings → Backup)

- Every `intervalDays` (default 3; checked hourly by cron) and on demand.
- Logical export of every D1 table to gzip'd NDJSON in the `BACKUPS` R2
  bucket, then re-downloaded and SHA-256 verified before it is marked
  VERIFIED. Keeps the newest `retainCount` (default 2), deleting older ones
  only after a newer one is verified.
- Download a stored backup, or export a fresh one straight to your computer.
  The file format is identified as `orderrestro-d1/1`, a name kept from the
  upstream so existing backups stay restorable.
- Restore (Owner only, type RESTORE): replaces every table's rows with the
  backup's. It runs in D1 batches and is **not** atomic as a whole — take a
  Time Travel bookmark first. Photos/attachments in R2 are not affected.
- Verified locally: backup → VERIFIED → download → restore → smoke test passes.
- Limits: the export is built in Worker memory (128 MB); for databases near
  that size use `wrangler d1 export` / Time Travel instead.

## Scheduled jobs (Cron Triggers, UTC)

| Cron | Jobs |
|---|---|
| `* * * * *` | release scheduled orders to the kitchen; retry webhook deliveries; VERI\*FACTU submission (Spain, no-op otherwise) |
| `*/10 * * * *` | scheduled report e-mails |
| `0 * * * *` | backup schedule check |
| `0 0 * * *` | webhook delivery cleanup (03:00 Riyadh) |

Each job is idempotent (claimed rows, "is it due" checks), so a retried or
overlapping trigger is harmless. Failures are logged per job.

## Monitoring

- Workers Logs (enabled in both `wrangler.jsonc` files) — search for
  `ERROR`, `Realtime push`, `Write lock`, `Cron`.
- `wrangler tail --env production` for live debugging.
- `GET /api/health` for uptime checks.
- D1 dashboard: query count, rows read/written, database size.
- Watch for 503 "The restaurant is busy saving another change": it means a
  write waited 20 s for the restaurant's write lock — a sign of a stuck or
  very slow request.
