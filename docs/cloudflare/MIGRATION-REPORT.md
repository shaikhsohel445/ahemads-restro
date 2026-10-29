# Migration report

Source: Nodedr OrderRestro (upstream, repository `nodedr-restaurant-pos`;
self-hosted: Next.js 16 + NestJS 11 + PostgreSQL/Prisma 6 + Socket.IO,
Docker/CasaOS/Windows packaging) — left unchanged. Target: this repository,
Ahemad's Restro, a Cloudflare-hosted Saudi Arabia edition. (The product was
renamed after this report's migration work; resource names below use the
current `ahemads-restro-*` names.)
The migration reused the existing code; it was not a rewrite.

## Approach in one paragraph

The NestJS API runs on Cloudflare Workers unchanged at the controller/service
level, behind a small Worker entry (`apps/api/src/worker.ts`) that boots Nest on
the Workers `node:http` implementation. Prisma moved to D1 through its driver
adapter; the schema was converted mechanically and D1 got its own migration
history. What a Worker cannot do was replaced at the edges only: Socket.IO →
a Durable Object per restaurant, PostgreSQL locks → a write-lock Durable
Object, disk → R2, timers → Cron Triggers, SMTP → HTTPS e-mail APIs, pdfkit →
pdf-lib, `pg_dump` → a logical D1 export. The frontend is the same Next.js app
built with OpenNext, deployed as a Worker that forwards `/api` to the API over
a service binding. On top of that came the Saudi edition: Arabic + RTL across
every screen, SAR/Riyadh defaults, a Saudi VAT regime with ZATCA Phase 1 QR
receipts, Saudi payment methods and a new visual theme.

## Major changes

| Area | Change | Where |
|---|---|---|
| Runtime | NestJS on Workers, custom esbuild bundle (decorator metadata), lazy boot | `apps/api/build.mjs`, `src/worker.ts`, `src/app.factory.ts` |
| Database | PostgreSQL → D1, Prisma 7 + adapter, converted schema, new migration history | `apps/api/prisma/schema.prisma`, `apps/api/migrations/` |
| Transactions | interactive transactions run without rollback; isolation from a per-restaurant write lock | `src/prisma/prisma.service.ts`, `src/cloudflare/write-lock.*` |
| Request lifetime | detached work moved to `waitUntil` (cancelled D1 I/O otherwise stalls Prisma) | `src/cloudflare/bindings.ts` (`detach`) |
| Realtime | Socket.IO → `RealtimeHub` Durable Object + browser WebSocket client | `src/realtime/`, `apps/web/lib/realtime-socket.ts` |
| Storage | uploads and document attachments → R2; backups → R2 | `src/cloudflare/storage.service.ts`, `src/backup/` |
| Scheduling | `@nestjs/schedule` → Cron Triggers | `src/cloudflare/scheduled.ts` |
| Security | edge rate limiting for sign-in/public endpoints; secrets via Wrangler; `JWT_SECRET` validated at boot | `src/cloudflare/rate-limit.ts`, `src/app.factory.ts` |
| Email | SMTP → Resend/SendGrid | `src/modules/email/email.service.ts` |
| Printing | USB unavailable (clear error); network printing over Cloudflare TCP sockets; browser printing primary | `src/modules/orders/escpos-*.ts` |
| Frontend hosting | OpenNext Worker + service binding | `apps/web/worker.ts`, `wrangler.jsonc`, `open-next.config.ts` |
| Localization | i18n runtime with namespaces, Arabic, RTL, formatting helpers; every screen translated | `apps/web/lib/i18n/`, `apps/web/messages/`, `apps/web/lib/format.ts` |
| Saudi tax | `SA_VAT` regime, 15 % default, ZATCA QR, bilingual receipt | `packages/types/src/{tax,zatca,region}.ts`, `receipt.html.ts` |
| Payments | mada, STC Pay, Apple Pay | `packages/types/src/orders.ts`, POS checkout/refund |
| Data migration | export → transform → import → validate, with fixture test | `scripts/migration/` |
| Removed (self-hosted only) | Docker/CasaOS/MSIX/.deb packaging, updater, installer scripts and their CI | still in the original repository |

## API contract changes

No route was removed or renamed and no response shape changed, except:

- `GET /api/v1/sync/status` returns `role: "unavailable"`, `unavailable: true`; sync actions return **501**.
- Backup config (`POST /api/v1/backups/config`) ignores S3 fields; status reports the R2 destination. Downloads are `.ndjson.gz` instead of `.zip`.
- `GET /api/v1/public/menu/:qrToken` additionally returns `currency`, `country`, `taxMode`, `taxLabel`.
- Thermal USB print endpoints return an error explaining USB is unavailable.
- New: `GET /api/realtime` (WebSocket), `GET /api/docs-json`.
- Interactive transactions no longer roll back on error (DATABASE.md).

Every dependent frontend screen was updated for these.

## Test results (run on 2026-10-29, macOS, Node 24, Wrangler 4.154)

| Check | Result |
|---|---|
| API unit tests (Jest) | 228 passed, 13 skipped (VERI\*FACTU suite that needs PostgreSQL) |
| Web unit tests (node:test) | 61 passed |
| Migration tooling unit tests | 6 passed |
| Type check (types, api, web, migration) | pass |
| Lint (api, web) | 0 errors (warnings remain, as in the original) |
| Translation check | en 2,183 = ar 2,183 keys, all used keys defined (2,342 each after the later redesign and rebrand) |
| End-to-end smoke test on local Workers + D1 (`scripts/verify/smoke-api.mjs`) | 17/17: health, sign-up with Arabic names, Saudi defaults, VAT number, login, category, item at 15 %, floor, table, dine-in order (VAT 6.00 on 46.00), KDS ticket, bill preview with discount, mada checkout, bilingual ZATCA receipt with QR, report, realtime refusal without session, realtime event delivery |
| PostgreSQL → D1 migration (`scripts/migration/test/run-local.sh`) | pass: original 38 migrations + fixture → D1; counts, sums and foreign keys match; app signed in and served the migrated data |
| Backup → verify → download → restore (local R2/D1) | pass; smoke test 17/17 afterwards |
| Cron handlers (`* * * * *`, `0 * * * *`) | outcome ok |
| Web production build (OpenNext) | pass, 50 routes |
| Browser check (both Workers locally) | Arabic RTL sign-in, dashboard, POS order entry; English POS; light theme |
| `wrangler deploy --dry-run` staging/production | pass (bindings resolved) |

Not tested: anything on a real Cloudflare account (no deployment was made),
sending e-mail, network printers, the MCP endpoint, load/concurrency at
scale, Safari/iOS, a real production data migration, screen-reader passes in
Arabic.

## Remaining limitations and external requirements

1. **Cloudflare account** (Workers Paid), D1 databases, R2 buckets, secrets,
   hostname — DEPLOYMENT.md. Nothing has been deployed.
2. **No rollback inside interactive transactions** on D1 (isolation is kept
   by the write lock). Writes for one restaurant are serialised, which caps
   per-restaurant write throughput; load-test busy sites.
3. **Cold starts:** a new isolate boots the Nest app (~1 s locally) on its
   first request.
4. **ZATCA Phase 2** (FATOORA integration) not implemented.
5. **Payment gateways** not integrated (payments are staff-recorded, as before).
6. **Server sync** for desktop installs is not available (no PostgreSQL triggers; not needed with one cloud database).
7. **USB thermal printers** unusable from the cloud; network printers must be reachable from the internet; browser printing is the supported path.
8. **E-mail** needs a Resend or SendGrid account and a verified sender domain.
9. **VERI\*FACTU (Spain)** submission would need an mTLS certificate binding; out of scope.
10. **Real data migration** must still be run against the production PostgreSQL (DATA-MIGRATION.md).
11. **Open sign-up:** `/` now redirects to the marketing site (`/en` or `/ar`) and the application is at `/login`. `/signup` (`POST /api/v1/auth/register`, rate-limited) lets anyone create a new restaurant on the deployment; there is no setting to close it. Restrict it at the edge (WAF rule or Cloudflare Access) if the deployment should not accept new restaurants. (The original's `/` sign-in gate no longer exists.)
12. **Tax:** confirm the 15 % rate and item treatments with ZATCA/a tax adviser; nothing here is tax advice.
13. **Arabic plural forms** are simplified; server-generated messages are English.
14. **Delivery zone defaults** in the form (fee 40) are a leftover from the original and should be reviewed for SAR.
