# Database: PostgreSQL → Cloudflare D1

## Schema conversion

`scripts/migration/convert-prisma-schema.mjs` converted `schema.prisma` from
PostgreSQL to SQLite; the result is maintained in `apps/api/prisma/schema.prisma`.

| PostgreSQL feature | D1 / SQLite | Effect |
|---|---|---|
| `@db.Decimal(p,s)` (77 columns) | `DECIMAL` (numeric affinity) | Prisma still returns `Decimal`. Values are stored as SQLite numbers (double precision), which is exact for the 2–4 decimal amounts the app stores; services keep rounding with `round2`. |
| `@db.Date`, `@db.Timestamptz` | `DATETIME`, stored as ISO-8601 text with `+00:00` | identical semantics (UTC) |
| `String[]` / `Int[]` (7 columns: recovery-code hashes, API-key scopes, allergens, delivery pincodes, promotion days, webhook events, report recipients) | `Json` arrays | `has` / `hasSome` filters became in-code matching; the 2FA recovery code compare-and-set uses `equals` on the whole list |
| enums | `TEXT` (Prisma validates) | unchanged in the app |
| `mode: 'insensitive'` search | removed | SQLite `LIKE` is already case-insensitive for ASCII |
| `createMany({ skipDuplicates })` | removed | permissions: only missing rows are inserted; bank-statement import de-duplicates in code against the unique key |
| `SELECT … FOR UPDATE` | removed | replaced by the restaurant WriteLock (below) |
| `DocumentFile.data bytea` | `storageKey` → R2 object | D1 rows are capped at 2 MB; attachments may be 5 MB |
| PL/pgSQL sync triggers, `pg_catalog` | — | server sync not available (MIGRATION-REPORT.md) |
| `dbgenerated(md5(random()…))` | `cuid()` | only on the unused `sync_state` table |

New defaults for this edition: `Restaurant.currency = SAR`,
`Restaurant.timezone = Asia/Riyadh`, `Branch.country = SA`,
`Branch.taxRegime = SA_VAT`. New enum values: `TaxRegime.SA_VAT`,
`PaymentMethod.MADA | STC_PAY | APPLE_PAY`.

## Migrations

The 38 PostgreSQL migrations cannot run on D1 and are kept, unmodified, in
`apps/api/prisma/pg-migrations-reference/` (they are used by the migration
test to build a source database). D1 has its own ordered history in
`apps/api/migrations/`, applied by Wrangler:

```bash
pnpm --filter @nodedr-restaurant/api db:migrate:local
pnpm --filter @nodedr-restaurant/api db:migrate:staging
pnpm --filter @nodedr-restaurant/api db:migrate:production
```

To change the schema: edit `prisma/schema.prisma`, then

```bash
pnpm --filter @nodedr-restaurant/api db:new-migration add_something
```

which diffs the existing migrations against the schema with
`prisma migrate diff`, writes `migrations/000N_add_something.sql` and
normalises SQLite-specific details. Review the SQL before applying it:
D1 applies each migration file in a transaction, but table rebuilds on large
tables take time.

## Transactions and isolation

D1 does not support interactive transactions, and Prisma 7 rejects
`$transaction(async (tx) => …)` on D1. About 30 code paths use that form.

- **Array form** `$transaction([a, b])` is sent as a D1 batch, which is atomic. Unchanged.
- **Interactive form** runs its callback against the client
  (`PrismaService.$transaction`), so the code is unchanged.
- **Isolation** — what those blocks relied on PostgreSQL for (no two
  requests interleaving a read-modify-write on the same stock level or
  balance, the `FOR UPDATE` row locks) — comes from the per-restaurant
  `WriteLock` Durable Object, held for the whole of every mutating request
  (`src/cloudflare/write-lock.*`). Requests for different restaurants still
  run in parallel. The compare-and-set `updateMany` guards the services
  already used (ticket status moves, webhook claims, idempotent checkout by
  `requestId`) keep working as before.
- **Not kept: rollback.** If a callback throws after some writes, those writes
  remain. The services validate input and permissions before writing, so a
  throw mid-way needs an unexpected failure (for example a D1 outage). This is
  the main known behavioural difference from PostgreSQL.

## Limits to keep in mind

- 100 bound parameters per statement (Prisma's D1 adapter chunks large `createMany`/`in` lists).
- 100 KB per SQL statement, 2 MB per row, 10 GB per database (Workers Paid).
- Writes are serialised per database by D1 itself; very large single-restaurant
  write volumes should be load-tested before launch.
