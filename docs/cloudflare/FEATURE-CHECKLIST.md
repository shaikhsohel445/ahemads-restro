# Feature migration checklist

Every module of Nodedr OrderRestro (upstream; audited from `apps/backend/src`
and `apps/web/app` in the source repository), its status in Ahemad's Restro on
Cloudflare, and how it was verified, followed by the features added in this
edition. "Smoke" = `scripts/verify/smoke-api.mjs` against the Worker on a
local D1 (17/17 steps passing); "unit" = Jest/node tests; "browser" = checked
in a browser against both Workers running locally (`wrangler dev`).

Legend: ✅ migrated · ⚠️ migrated with a documented difference · ⛔ not available on Cloudflare (reason given)

## Platform

| Area | Original | Cloudflare | Status | Verified |
|---|---|---|---|---|
| HTTP API (`/api/v1/*`) | NestJS + Express on Node | Same NestJS app on Workers (`node:http` bridge, `src/worker.ts`) | ✅ | smoke, unit |
| API docs | Swagger UI at `/api/docs` | OpenAPI JSON at `/api/docs-json`, UI at `/api/docs` (assets from cdnjs) | ✅ | curl |
| Database | PostgreSQL + Prisma 6 | D1 + Prisma 7 driver adapter | ⚠️ transactions — see DATABASE.md | smoke, migration test |
| Realtime | Socket.IO gateway | `RealtimeHub` Durable Object + WebSocket (`/api/realtime`) | ✅ | smoke (auth refused / events received) |
| Write isolation | PostgreSQL row locks | `WriteLock` Durable Object per restaurant | ✅ | smoke |
| Scheduled jobs | `@nestjs/schedule` timers | Cron Triggers (`src/cloudflare/scheduled.ts`) | ⚠️ webhooks retried each minute (was 10 s); first attempt is immediate | handler invoked locally for `* * * * *` and `0 * * * *` (outcome ok) |
| File uploads | Local `UPLOADS_DIR` volume | R2 `UPLOADS` bucket, same `/api/uploads/:name` URLs | ✅ | migration test (attachment) |
| Rate limiting | `@nestjs/throttler` (in memory) | Throttler kept + Cloudflare Rate Limiting binding on sign-in and public endpoints | ✅ | config dry run |
| Frontend hosting | `next start` (standalone) | OpenNext on Workers + static assets; `/api` via service binding | ✅ | build, browser |
| Email | nodemailer SMTP | Resend or SendGrid HTTPS API | ⚠️ provider change | type-check only — no e-mail was sent |
| PDF export | pdfkit | pdf-lib + embedded IBM Plex Sans Arabic | ✅ (Arabic now supported) | bundle boots |
| XLSX / CSV export | exceljs / CSV | unchanged | ✅ | — |

## Business modules

| Module | Status | Notes | Verified |
|---|---|---|---|
| Auth (password, PIN, 2FA TOTP, sessions) | ✅ | bcryptjs reads existing bcrypt hashes; httpOnly cookie unchanged | smoke, migration test login |
| Roles & permissions, permission sync | ✅ | sync now writes only missing/changed permissions | smoke |
| Restaurants, branches, settings | ✅ | new defaults SAR / Asia/Riyadh / SA / SA_VAT | smoke |
| Menu, categories, items, modifiers, combos | ✅ | new items default to the branch regime's rate (15%) | smoke |
| Tables, floors, floor designer, QR codes | ✅ | canvas kept LTR so stored coordinates are language-neutral | smoke, browser |
| Orders: dine-in, takeaway, delivery, scheduled | ✅ | acceptance / KOT / billing state machines unchanged | smoke |
| QR self-ordering, table requests | ✅ | public menu now also returns currency and tax label | type-check |
| Self-service kiosk | ✅ | Arabic default language, RTL ticket | unit (kiosk service, web kiosk libs) |
| Kitchen display (KDS), stations, sounds | ✅ | live updates through the Durable Object | smoke, browser |
| Billing, discounts, coupons, tips, loyalty, gift cards | ✅ | server-authoritative settlement unchanged | unit (settlement, saudi-vat) |
| Payments, partial payments, refunds | ✅ | + mada, STC Pay, Apple Pay methods | smoke (mada) |
| Receipts / bills (browser print) | ✅ | ZATCA simplified invoice for SA_VAT branches | unit, smoke |
| Thermal printing — network (port 9100) | ⚠️ | via Cloudflare TCP sockets; printer must be reachable from the internet | unit |
| Thermal printing — USB | ⛔ | no USB on Workers; clear error, browser printing recommended | unit |
| Customers, CRM | ✅ | | — |
| Reservations, waitlist | ✅ | | — |
| Delivery zones, drivers | ✅ | pincode array matched in code | unit (delivery) |
| Inventory, recipes, stock, waste, transfers | ✅ | | unit (stock-plan) |
| Procurement (PR, quotations, POs, GRN, invoices, payments) | ✅ | | — |
| Accounting, expenses, budgets, bank reconciliation | ⚠️ | bank import de-duplicates in code (no `skipDuplicates`) | unit (accounting, ledger) |
| HR, attendance, shifts, leave, payroll | ✅ | | — |
| Marketing: campaigns, promotions, coupons | ✅ | email via HTTPS provider | unit (discounts) |
| Reports + scheduled report e-mails | ✅ | PDF supports Arabic | unit (csv, report-schedules); PDF not rendered in a test |
| Operations: equipment, maintenance, documents | ⚠️ | attachments moved from DB bytea to R2 | migration test |
| Notifications (in-app, targeted) | ✅ | per-user rooms in the Durable Object | smoke |
| Audit log | ✅ | | smoke |
| Webhooks (signed, retried) | ⚠️ | delivered with `fetch`; SSRF checks kept, Workers cannot reach private IPs | unit (net-guard, signing) |
| Integration API keys, staff API keys | ✅ | | unit |
| MCP server (`/api/v1/mcp`) | ✅ | bundled; not exercised by the smoke test | — |
| Backups | ⚠️ | logical D1 export to R2 instead of `pg_dump` to S3; D1 Time Travel is primary | local: backup → VERIFIED, download, restore, then smoke 17/17; not yet run against remote R2 |
| VERI\*FACTU (Spain) | ⚠️ | code kept; AEAT mTLS submission would need a Workers mTLS certificate binding (not configured); out of Saudi scope | integration suite skipped (PostgreSQL-only) |
| Server sync (desktop ↔ hub) | ⛔ | depended on PostgreSQL triggers; on Cloudflare every device uses the one D1 database. Endpoints answer 501 / "unavailable" | unit |
| Software updates (Docker updater) | ⛔ | replaced by Cloudflare deployments; page shows version only | — |
| Self-hosted packaging (Docker, CasaOS, Windows MSIX, .deb, installer) | ⛔ | not applicable to Cloudflare; remains in the original repository | — |

## Saudi localization

| Item | Status | Verified |
|---|---|---|
| English + Arabic UI, language switcher, persisted choice | ✅ 2,183 keys in each language at migration time; 2,342 after the redesign and rebrand | `pnpm i18n:check`, browser |
| RTL layout (`<html dir>`, logical utilities, mirrored icons) | ✅ | browser (login, dashboard, POS) |
| Arabic font (IBM Plex Sans Arabic) in UI, PDFs, receipts | ✅ | browser, unit |
| SAR formatting, Asia/Riyadh times | ✅ | unit, browser |
| SA_VAT regime, 15% default, VAT-inclusive | ✅ | unit |
| ZATCA Phase 1 QR on simplified tax invoices | ✅ | unit, smoke |
| ZATCA Phase 2 (Fatoora integration) | ⛔ not implemented | — |
| Saudi payment methods (mada, STC Pay, Apple Pay) | ✅ recorded by staff | smoke |
| Saudi-inspired theme (emerald / gold / sand), light and dark | ✅ | browser |

## Added in this edition

| Feature | Status | Notes | Verified |
|---|---|---|---|
| Redesigned application shell and screens | ✅ | grouped collapsible sidebar, mobile tab bar, shared UI primitives | browser, real screenshots (`scripts/assets/screenshots.mjs`) |
| Add a branch from the app (`POST /api/v1/branches`, Settings → Branches) | ✅ | multi-branch was data-model only before | — |
| Public marketing site `/en`, `/ar` (home, solution pages, blog, privacy, terms) | ✅ | canonical, hreflang, Open Graph, JSON-LD, sitemap, robots | build |
| Demo requests (`POST /api/v1/public/demo-requests`, lead list behind `LEADS_ACCESS_TOKEN`) | ✅ | stored in D1 (migration 0002); e-mail only when configured | — |
| Consent-gated GA4 on the marketing site | ✅ | only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set | — |
