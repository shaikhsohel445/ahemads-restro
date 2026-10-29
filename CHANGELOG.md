# Changelog

All notable changes to Ahemad's Restro are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

No version of this edition has been released or tagged yet. The first
release will be **2.0.0**, the version already set in `package.json` and in
`APP_VERSION` for staging and production (`apps/api/wrangler.jsonc`). The
work that led to it was done in the milestones below, all dated 2026-10-29;
the commit hashes refer to this repository.

## [Unreleased] — planned as 2.0.0

### Added
- Ahemad's Restro brand: logo, compact and one-colour variants, mark,
  favicons, app and social icons, generated from code
  (`scripts/assets/brand.mjs`); one brand configuration for the API and the
  web app (`packages/types/src/brand.ts`). (968050f)
- Public marketing website in English and Arabic under `/en` and `/ar`: home
  page, nine solution pages, blog with three articles, privacy policy and
  terms; canonical URLs, hreflang, Open Graph images, JSON-LD,
  `sitemap.xml` and `robots.txt`; consent-gated Google Analytics when
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. (968050f)
- Demo requests: `POST /api/v1/public/demo-requests` stores requests in D1
  (migration `0002_demo_requests.sql`), optional e-mail to
  `DEMO_NOTIFY_EMAIL`, and `GET /api/v1/leads/demo-requests` protected by
  `LEADS_ACCESS_TOKEN`. (968050f)
- Adding branches from the application: `POST /api/v1/branches` and
  Settings → Branches. Multiple branches previously existed in the data model
  only. (968050f)
- Real product screenshots (desktop and phone, English and Arabic) and
  marketing graphics built from them, with their generators
  (`scripts/assets/demo-data.mjs`, `screenshots.mjs`, `graphics.mjs`).
- Documentation for GitHub: README, NOTICE, SECURITY, CONTRIBUTING,
  MAINTAINERS, CITATION, asset inventory, analytics and Search Console guide,
  licence review; `apps/web/.env.example` with the site variables.

### Changed
- Package scope renamed to `@ahemads-restro`; Workers, D1 databases and R2
  buckets renamed to `ahemads-restro-*`. (968050f)
- `/` now redirects to the marketing site (`/ar` for browsers preferring
  Arabic, `/en` otherwise); the application is reached at `/login`.
- Upstream-branded documents and images moved to `docs/original/`.

- The marketing site serves screenshots as pre-sized WebP files
  (`images: { unoptimized: true }` in `apps/web/next.config.ts`, so no
  Cloudflare Images binding is needed); the PNG versions remain for the
  README. Arabic pages use an Arabic Open Graph image
  (`BRAND.assets.ogImageAr`, `/images/product/marketing/og-default-ar.png`).

### Fixed
- The dashboard's "today" figures and daily trends use the restaurant's time
  zone instead of the Worker's UTC clock, so a late-evening order in Riyadh
  is no longer counted on the previous or next day.
- Requests could hang until the runtime killed them (after about 60 s) when
  another, concurrent request was cancelled: Prisma's cross-request batching
  of `findUnique` calls ran the merged query in the cancelled request's I/O
  context. The API now batches only inside an array `$transaction`
  (`apps/api/src/prisma/prisma.service.ts`).

## Interface redesign — 2026-10-29

### Changed
- New application shell: dark-emerald grouped, collapsible sidebar,
  page-aware header and floating tab bar on phones; shared UI primitives
  (PageHeader, StatCard, Segmented, StatusPill, EmptyState, SearchInput) and
  status colour tokens. (4bc10e7)
- Responsive redesign of POS (three-zone workspace, bottom-sheet order panel
  on tablets and phones), kitchen display (status board with ageing timers),
  orders (cards on phones), tables, reservations (agenda by time slot),
  dashboard, back office and settings (two-column layout with grouped
  navigation). (7bfa92a)

### Fixed
- Bottom padding for the mobile tab bar, icon-only language switcher on
  phones, and Wrangler's `keep_names` breaking next-themes' inline script.
  (7bfa92a)

## Saudi Arabia localisation — 2026-10-29

### Added
- `SA_VAT` tax regime (15 % default rate, VAT-inclusive); SAR, Asia/Riyadh
  and SA defaults for new restaurants; mada, STC Pay and Apple Pay payment
  methods. (4913660)
- Bilingual simplified tax invoice with the ZATCA Phase 1 QR code (Base64
  TLV). (4913660)
- English and Arabic for every screen with right-to-left layouts, IBM Plex
  Sans Arabic, SAR and Riyadh-time formatting, and a translation parity check
  (`pnpm i18n:check`). (837798f, 92b336a, 572757f)
- Saudi theme (emerald, gold, sand) in light and dark. (837798f, 572757f)
- Saudi VAT and ZATCA tests. (ec17096)

### Changed
- The self-service kiosk starts in Arabic, with English as the second
  language. (572757f)

## Cloudflare migration — 2026-10-29

### Added
- The NestJS API runs on Cloudflare Workers: esbuild bundle with decorator
  metadata, `node:http` bridge, D1 through Prisma 7 and its D1 adapter, a
  converted schema with its own D1 migration history. (a5a54ce)
- Durable Objects: `RealtimeHub` (WebSockets per restaurant, replacing
  Socket.IO) and `WriteLock` (serialises each restaurant's writes). (a5a54ce)
- R2 for uploads, document attachments and backups; Cron Triggers for
  scheduled jobs. (a5a54ce)
- Next.js built with OpenNext and served as a Worker that forwards `/api` to
  the API over a service binding. (92b336a)
- PostgreSQL → D1/R2 data migration tooling (export, transform, import,
  validate), tested on fixture data. (8abe1c8)
- Edge rate limits for sign-in and public endpoints, CI for Workers and D1,
  environment templates and root scripts. (8542f28)
- End-to-end smoke test (`scripts/verify/smoke-api.mjs`). (4913660)
- Cloudflare documentation: architecture, database, deployment, data
  migration, realtime, operations, feature checklist and migration report.
  (ec17096, 07f34c8)

### Changed
- E-mail through the Resend or SendGrid HTTPS APIs instead of SMTP; D1 seed
  through Wrangler's platform proxy. (a552960)
- PDF export with pdf-lib and an embedded Arabic font instead of pdfkit.
  (a5a54ce)
- Work that outlives a request runs through `waitUntil`; the write lock is
  held around `fetch()`. (4913660)
- Interactive database transactions no longer roll back on error (D1 has no
  interactive transactions); see `docs/cloudflare/DATABASE.md`.

### Removed
- Self-hosted packaging (Docker, CasaOS, Windows MSIX, .deb, installer
  scripts), the Docker updater and their CI workflows. (8542f28)
- Server sync between installations and USB thermal printing are not
  available on Workers.

## Upstream baseline

- Imported the source of [Nodedr OrderRestro](https://github.com/Raktim94/nodedr-restaurant-pos)
  (self-hosted NestJS + PostgreSQL + Next.js, AGPL-3.0-only, Copyright (C)
  2026 Nodedr Infotech Private Limited and Raktim Ranjit) as the starting
  point, renaming `apps/backend` to `apps/api`. (f4d6876)
  The upstream project's own history is in its repository.
