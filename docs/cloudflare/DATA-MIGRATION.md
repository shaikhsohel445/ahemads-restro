# Moving an existing installation's data (PostgreSQL → D1 + R2)

For restaurants running the self-hosted Nodedr OrderRestro (upstream) on
PostgreSQL that move to Ahemad's Restro on Cloudflare.

Tooling: `scripts/migration/pg-to-d1/` (package `@ahemads-restro/migration-tools`).

| Step | Script | Touches |
|---|---|---|
| 1 Export | `export-postgres.mjs` | reads PostgreSQL in one read-only snapshot; never writes to it |
| 2 Transform | `transform.mjs` | local files only |
| 3 Import | `import.mjs` | the target D1 database and UPLOADS bucket |
| 4 Validate | `validate.mjs` | reads D1 |

## What has been verified

`scripts/migration/test/run-local.sh` (also run in CI) builds a throwaway
PostgreSQL from the **upstream's original 38 migrations**, loads
`scripts/migration/test/fixture.sql` (Arabic text, decimals, dates, `text[]`
and `int[]` arrays, JSON, a bytea attachment, S3 credentials, sync rows), runs
all four steps into a local D1/R2 and validates. Result: every row count,
every financial sum (orders, items, payments) and D1's foreign-key check
match. The API was then run on the migrated database: the fixture owner signed
in with the original bcrypt password, orders and Arabic menu items loaded, the
INR/GSTIN receipt printed as before and the attachment downloaded from R2.

**No real production database has been migrated** — none was available. The
steps below are what remains to do with real data.

## Procedure

0. Prerequisites: Node 22.13+, network access to the PostgreSQL server (or a
   restored `pg_dump` in a scratch PostgreSQL), the deployed API Worker's D1
   database **freshly migrated and empty**, Wrangler logged in.
1. **Backup and freeze.** Take a `pg_dump` of the source (your rollback), and
   stop writes (maintenance window) so the export is final.
2. **Export.**
   ```bash
   cd scripts/migration
   SOURCE_DATABASE_URL=postgresql://user:pass@host:5432/<database> \
     node pg-to-d1/export-postgres.mjs --out ./export
   ```
3. **Transform** (add `--uploads-dir` pointing at a copy of the old
   `UPLOADS_DIR` to move menu photos and logos to R2):
   ```bash
   node pg-to-d1/transform.mjs --export ./export --out ./d1-import --uploads-dir /path/to/uploads
   ```
   Read `d1-import/report.json`. The run stops (exit 2) if any row cannot be
   converted faithfully; it lists the table, line and reason. Nothing is
   silently dropped or coerced.
4. **Bookmark D1** (production): note the current time, or
   `pnpm exec wrangler d1 time-travel info DB --env production` — this is
   the point to restore if the import must be undone.
5. **Import.**
   ```bash
   node pg-to-d1/import.mjs --dir ./d1-import --env production
   ```
6. **Validate.**
   ```bash
   node pg-to-d1/validate.mjs --export ./export --dir ./d1-import --env production
   ```
   Must print `Validation passed`. It writes `d1-import/validation.json`.
7. Smoke-test in the browser (sign in, open an old order, print its receipt,
   open a document attachment), then point users at the new hostname.

### Rollback

- Before switching users over: `wrangler d1 time-travel restore DB --env production --timestamp <step 4>` (or delete and recreate the database and re-run migrations), and keep using the old installation.
- After switching: data written on Cloudflare after the switch exists only there; export it with the in-app backup (Settings → Backup → Download) before rolling back.

## What the transform does

| Source | Target |
|---|---|
| `timestamp` / `timestamptz` (exported in UTC) | ISO-8601 text `…+00:00`, as Prisma's D1 adapter writes it |
| `date` | midnight UTC |
| `numeric`, `int*`, `float*` | numbers (exact source text) |
| `bool` | `0` / `1` |
| `json` / `jsonb` | JSON text |
| `text[]`, `int[]` | JSON arrays |
| `bytea` | `X'..'` blob |
| `document_files.data` | R2 object `documents/<uuid>`, row gets `storageKey` |
| `backup_config` S3 credentials | **scrubbed** (backups now use the R2 binding) |
| `_prisma_migrations`, `sync_state`, `sync_changes` | skipped (reported) |
| `backups` rows | kept as history; their files live in the old S3 bucket, not R2 |

Rows are inserted parents-first (from the D1 schema's foreign keys) with
statements under D1's 100 KB limit. Identifiers (cuid ids, order numbers) are
kept, so every relationship, order history, payment, tax breakdown and
timestamp is preserved exactly.

Existing restaurants keep their own currency, time zone and tax regime (e.g.
INR / Asia/Kolkata / INDIA_GST): only **new** restaurants get the Saudi
defaults. Change them in Settings if a migrated restaurant now trades in
Saudi Arabia.
