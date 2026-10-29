# Contributing to Ahemad's Restro

Thank you for considering a contribution. This repository is the Cloudflare
and Saudi Arabia edition of [Nodedr OrderRestro](https://github.com/Raktim94/nodedr-restaurant-pos)
(upstream), maintained by [Wem Studios](https://wemstudios.in/). Changes that
apply to the self-hosted original are better proposed upstream.

## Contents

- [Code of Conduct](#code-of-conduct)
- [Licence of contributions](#licence-of-contributions)
- [Before you start](#before-you-start)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Conventions that are not optional](#conventions-that-are-not-optional)
- [Translations (English and Arabic)](#translations-english-and-arabic)
- [Database changes](#database-changes)
- [User interface](#user-interface)
- [Checks to run](#checks-to-run)
- [Branches, commits and pull requests](#branches-commits-and-pull-requests)
- [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating you agree to uphold it. Report unacceptable behaviour as
described there.

## Licence of contributions

The project is licensed under [AGPL-3.0-only](LICENSE). By submitting a pull
request you agree that your contribution is licensed under AGPL-3.0-only as
well. You keep the copyright on your own contribution. No contributor
licence agreement or sign-off is required.

Do not submit code you are not allowed to license this way, and do not add
dependencies whose licence is incompatible with AGPL-3.0 (see
[docs/LICENSE-REVIEW.md](docs/LICENSE-REVIEW.md)).

## Before you start

Read these first; they are the source of truth for how this edition works:

1. [README.md](README.md) — overview, setup, environment variables, limitations.
2. [docs/cloudflare/ARCHITECTURE.md](docs/cloudflare/ARCHITECTURE.md) — the
   Workers, D1, R2 and Durable Objects layout and why.
3. [docs/cloudflare/DATABASE.md](docs/cloudflare/DATABASE.md) — D1
   migrations, and how transactions and isolation differ from PostgreSQL.
4. [docs/cloudflare/FEATURE-CHECKLIST.md](docs/cloudflare/FEATURE-CHECKLIST.md)
   and [docs/cloudflare/MIGRATION-REPORT.md](docs/cloudflare/MIGRATION-REPORT.md)
   — what works, how it was verified, known limitations.
5. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — UI kit, tokens and layout rules.

The documents in [docs/original/](docs/original/) describe the self-hosted
upstream (Docker, PostgreSQL, Socket.IO). Where they disagree with
`docs/cloudflare/`, the Cloudflare documents are correct for this repository.

For a large change (a new module, a change to an architecture decision),
open an issue first to agree on the approach.

## Development setup

Requirements: Node.js 24 (or 22.12+; not 23) and pnpm 11 (`corepack enable`).
No Cloudflare account is needed for development.

```bash
pnpm install
pnpm --filter @ahemads-restro/types build
cp apps/api/.dev.vars.example apps/api/.dev.vars     # set JWT_SECRET (openssl rand -hex 32)
pnpm db:migrate:local
pnpm db:seed:local                                   # demo: owner@demo.local / Password123! (local only)
pnpm --filter @ahemads-restro/api dev                # API on :8787
pnpm --filter @ahemads-restro/web preview            # web Worker on :1995
```

For frontend work with hot reload, copy `apps/web/.env.example` to
`apps/web/.env.local` and run `pnpm --filter @ahemads-restro/web dev`
instead of `preview`. After changing API code, restart `wrangler dev` (the
API is a bundle built by `apps/api/build.mjs`). Full details:
[docs/cloudflare/LOCAL-DEVELOPMENT.md](docs/cloudflare/LOCAL-DEVELOPMENT.md).

Never commit `apps/api/.dev.vars`, `apps/web/.env.local` or any real secret.

## Project structure

```
apps/api          NestJS API on Workers; one NestJS module per domain in src/modules/<domain>
apps/web          Next.js application (app/(app)) and marketing site (app/(site))
packages/types    shared Zod schemas, tax regimes, regional defaults, ZATCA QR, brand config
scripts/          asset generators, PostgreSQL -> D1 migration tooling, smoke test
docs/             Cloudflare, marketing and original (upstream) documentation
```

A new backend domain is a new NestJS module wired into `AppModule`, not new
routes threaded through an existing one.

## Conventions that are not optional

Pull requests that break these rules will be asked to change before merge.

- **Server-authoritative money.** Prices, tax, discounts, loyalty and totals
  are computed on the server (`apps/api/src/modules/orders/pricing.ts`,
  `settlement.ts`). Never trust an amount, total or tax value sent by a
  client. Whether a menu price includes tax is a per-branch setting
  (inclusive for `SA_VAT`); tax is backed out of inclusive prices, never
  added on top.
- **Round before you store.** Money amounts are rounded to the minor unit
  (`round2`) before they are written. Prefer an atomic Prisma `increment`
  with an already-rounded amount or an integer (as for loyalty points and
  store-credit refunds) over a read-modify-write, and never accumulate
  unrounded floating-point values in the database.
- **One shared Zod schema per DTO.** Validation schemas live in
  `packages/types` and drive both the API's `ZodValidationPipe` and the
  frontend forms. Do not write a parallel frontend-only or backend-only shape
  for something that already has a shared schema.
- **Permissions through the decorator.** Every permission-gated route uses
  `@Auth('permission.key')` and the branch-access checks. Do not branch on a
  role name in business logic; if a permission is missing, add it to the
  permission list. Hiding a link in the UI is never the only check.
- **Realtime through the hub, not polling.** Services call
  `RealtimeGateway.emitToBranch` / `emitToUsers` after their D1 writes; the
  `RealtimeHub` Durable Object delivers the event and the frontend's
  `useRealtime` hook invalidates the matching TanStack Query cache. Pushes are
  hints: screens refetch from the API. Do not add `setInterval` polling.
- **Respect the Workers request lifetime.** Work that is not awaited before
  the response (webhooks, audit writes, realtime pushes) must go through
  `detach()` / `waitUntil()` (`apps/api/src/cloudflare/bindings.ts`).
- **No interactive transactions to rely on.** D1 does not roll back an
  interactive `$transaction` callback; validate input and permissions before
  the first write, and use the array form `$transaction([a, b])` (an atomic
  D1 batch) where atomicity matters. See DATABASE.md.
- **No hardcoded region or brand.** Currency, time zone and tax come from the
  restaurant and branch settings with defaults in
  `packages/types/src/region.ts`; product name, colours and developer details
  come from `packages/types/src/brand.ts`. Deployment-specific values (site
  URL, analytics id, verification tokens) come from environment variables,
  never from code.
- **Compatibility identifiers stay.** `nodedr_session`, `nodedr-locale` and the
  other `nodedr*` browser storage keys,
  `X-OrderRestro-*` webhook headers, the `orderrestro-d1/1` backup format and
  the `orderrestro:order:` QR prefix are kept on purpose so existing data,
  devices and integrations keep working. Do not rename them without a
  migration plan.

## Translations (English and Arabic)

- Every user-visible string in the application goes through `t()` with a key
  in `apps/web/messages/en/<area>.json` **and** `apps/web/messages/ar/<area>.json`.
  `pnpm i18n:check` must pass.
- Marketing site copy lives in `apps/web/content/site/` with an `en` and an
  `ar` version of each text (or an explicit list of the languages a page
  exists in).
- Layouts must work right-to-left: use logical utilities
  (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`), mark directional
  icons to mirror, and isolate numbers, codes and phone numbers inside Arabic
  text with `<bdi>` or `dir="ltr"`.
- If you are not confident in Arabic, say so in the pull request so a
  reviewer can check the wording.

## Database changes

Edit `apps/api/prisma/schema.prisma`, then generate the next migration:

```bash
pnpm --filter @ahemads-restro/api db:new-migration short_name
pnpm db:migrate:local
```

Commit the generated `apps/api/migrations/000N_short_name.sql` with the schema
change, after reviewing the SQL. Never edit a migration that has already been
merged; add a new one. The PostgreSQL migrations in
`apps/api/prisma/pg-migrations-reference/` are reference material for the
data migration test and must not be changed.

## User interface

Follow [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): the shared primitives in
`apps/web/components/ui/`, mobile-first layouts with no horizontal page
scroll, touch targets of at least 44 px on service screens (POS, KDS,
tables), and WCAG 2.1 AA as the accessibility floor
([ACCESSIBILITY.md](ACCESSIBILITY.md)). Attach screenshots in English and
Arabic, at phone and desktop widths, for UI changes.

## Checks to run

Before opening a pull request:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm i18n:check
```

When you change API behaviour, also run the end-to-end smoke test against
your local API (`pnpm test:smoke`). When you touch `scripts/migration/`, run
`pnpm test:migration` (needs PostgreSQL binaries). CI runs the type check,
tests, translation check, both Worker builds, the smoke test and the
migration test on every pull request.

## Branches, commits and pull requests

1. Fork the repository and branch from `master`:
   `feat/short-description`, `fix/…`, `docs/…` or `chore/…`.
2. Keep each pull request to one concern. A bug fix does not need an
   unrelated refactor.
3. Write commit messages that explain why, not only what. Keep the subject
   line under about 70 characters; an area prefix such as `api:`, `web:` or
   `docs:` is welcome but not required.
4. Open the pull request against `master` and fill in the template: what
   changed, why, how you tested it, and screenshots for UI changes.
5. If the change touches money, permissions, realtime or tax, say in the
   description how it follows the rules above.
6. Update the documentation in the same pull request when behaviour,
   configuration or limitations change (README, `docs/cloudflare/`, and
   CHANGELOG.md under **Unreleased**).

## Reporting bugs and requesting features

Use the issue templates. Mark money-correctness and permission bugs (a total
that does not match its lines, a permission that does not actually block an
action) clearly in the title; they are treated as high priority.

**Security vulnerabilities must not be reported in public issues.** Follow
[SECURITY.md](SECURITY.md).
