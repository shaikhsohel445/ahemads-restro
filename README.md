# Nodedr OrderRestro — Cloudflare edition for Saudi Arabia

Restaurant management — POS, kitchen display, tables and floor plans, QR
self-ordering, kiosk, menu, inventory and procurement, staff and roles,
reservations, delivery, loyalty and gift cards, accounting, reports — running
on Cloudflare (Workers, D1, R2, Durable Objects), in **English and Arabic**
with right-to-left layouts, **Saudi Riyal** pricing, **Asia/Riyadh** time,
**Saudi VAT** (15 % default, VAT-inclusive) and ZATCA Phase 1 QR codes on
simplified tax invoices.

This is a migration of the self-hosted
[Nodedr OrderRestro](https://github.com/Raktim94/nodedr-restaurant-pos)
(NestJS + PostgreSQL + Next.js); the business logic, API and screens are the
original ones.

```
apps/api          NestJS API on Cloudflare Workers (D1, R2, Durable Objects, Cron)
apps/web          Next.js app on Cloudflare Workers via OpenNext (forwards /api to the API)
packages/types    shared Zod schemas, tax regimes, Saudi region defaults, ZATCA QR
scripts/migration PostgreSQL -> D1/R2 data migration (export, transform, import, validate)
scripts/verify    end-to-end smoke test
docs/cloudflare   architecture, deployment, database, operations, localization, report
```

## Quick start (local, no Cloudflare account needed)

Requires Node 24 (or 22.12+) and pnpm 11.

```bash
pnpm install
pnpm --filter @nodedr-restaurant/types build
cp apps/api/.dev.vars.example apps/api/.dev.vars    # set JWT_SECRET (openssl rand -hex 32)
pnpm db:migrate:local
pnpm db:seed:local                                  # demo: owner@demo.local / Password123!
pnpm --filter @nodedr-restaurant/api dev            # API  -> http://localhost:8787
pnpm --filter @nodedr-restaurant/web preview        # app  -> http://localhost:1995
```

More: [local development](docs/cloudflare/LOCAL-DEVELOPMENT.md) ·
[deployment](docs/cloudflare/DEPLOYMENT.md) ·
[migration report & limitations](docs/cloudflare/MIGRATION-REPORT.md) ·
[feature checklist](docs/cloudflare/FEATURE-CHECKLIST.md) ·
[moving existing data](docs/cloudflare/DATA-MIGRATION.md).

## Checks

```bash
pnpm typecheck
pnpm test                 # API (Jest), web (node:test), migration tooling
pnpm i18n:check           # English/Arabic parity
pnpm test:smoke           # end-to-end against the running API
pnpm test:migration       # PostgreSQL -> D1 round trip (needs PostgreSQL binaries)
```

## Important

- Not deployed anywhere yet; deploying needs a Cloudflare **Workers Paid** account.
- ZATCA **Phase 2** (FATOORA integration) is not included. Confirm VAT rates
  with ZATCA or a tax adviser — nothing here is tax advice.
- Payments are recorded by staff (cash, card, mada, STC Pay, Apple Pay); no
  payment gateway is integrated.

Licence: AGPL-3.0-only (see [LICENSE](LICENSE)).
