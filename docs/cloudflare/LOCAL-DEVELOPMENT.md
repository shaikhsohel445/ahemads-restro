# Local development

Everything runs locally with Wrangler's simulators (workerd, local D1, R2 and
Durable Objects) — no Cloudflare account is needed.

## Requirements

- **Node.js 24** (or 22.12+). Prisma 7 refuses Node 23.
- **pnpm 11** (`corepack enable`).

## First run

```bash
pnpm install                                   # also runs `prisma generate`
pnpm --filter @ahemads-restro/types build
cp apps/api/.dev.vars.example apps/api/.dev.vars
#   then put a value in JWT_SECRET:  openssl rand -hex 32
pnpm db:migrate:local                          # creates the local D1 schema
pnpm db:seed:local                             # optional demo restaurant (Arabic/English menu, SAR)
```

Demo sign-in after seeding: `owner@demo.local` / `Password123!` (local data only).

## Running

Production-like (both Workers, joined by the service binding):

```bash
pnpm --filter @ahemads-restro/api dev            # API on http://localhost:8787
pnpm --filter @ahemads-restro/web preview        # OpenNext build + web Worker on http://localhost:1995
```

Fast frontend iteration with hot reload:

```bash
pnpm --filter @ahemads-restro/api dev
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @ahemads-restro/web dev            # next dev on http://localhost:1995
```

`next dev` proxies `/api/*` to the API; WebSockets go straight to
`ws://localhost:8787` (see `apps/web/.env.example`).

The API Worker is a bundle: after changing API code, restart
`wrangler dev` (it re-runs `build.mjs`), or run `pnpm --filter @ahemads-restro/api build`.

Cron Triggers do not fire on their own locally. Trigger one with:

```bash
curl -X POST "http://127.0.0.1:8787/cdn-cgi/local/explorer/api/local/scheduled?worker=ahemads-restro-api" \
  -H 'content-type: application/json' -d '{"cron":"* * * * *"}'
```

## Checks

```bash
pnpm typecheck
pnpm --filter @ahemads-restro/api test          # Jest
pnpm --filter @ahemads-restro/web test          # node:test
pnpm --filter @ahemads-restro/migration-tools test
pnpm i18n:check                                    # English/Arabic key parity
pnpm test:smoke                                    # end-to-end against the running API (port 8787)
pnpm test:migration                                # PostgreSQL -> D1 round trip (needs PostgreSQL binaries)
```

## Useful paths

| Path | What |
|---|---|
| `apps/api/src/worker.ts` | Worker entry: boot, realtime upgrade, rate limit, write lock, cron |
| `apps/api/src/cloudflare/` | bindings, R2 storage, write lock, rate limit, cron table |
| `apps/api/src/realtime/` | RealtimeHub Durable Object + gateway |
| `apps/api/migrations/` | D1 migrations |
| `apps/web/worker.ts` | web Worker entry (forwards `/api`) |
| `apps/web/messages/{en,ar}/` | translations, one file per screen area |
| `apps/web/lib/i18n/`, `lib/format.ts` | i18n runtime, SAR / Riyadh formatting |
| `packages/types/src/region.ts`, `tax.ts`, `zatca.ts` | regional defaults, tax regimes, ZATCA QR |
| `.wrangler/state` (per app) | local D1/R2/DO data — delete to start over |
