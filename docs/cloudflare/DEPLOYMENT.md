# Deploying Ahemad's Restro to Cloudflare

Nothing in this repository has been deployed to a Cloudflare account. These
steps are written against the configuration in `apps/api/wrangler.jsonc` and
`apps/web/wrangler.jsonc`, which were validated with `wrangler deploy --dry-run`
for both environments.

## Requirements

- A Cloudflare account on **Workers Paid**: password hashing (bcrypt) and
  PDF/XLSX exports need more than the Free plan's 10 ms CPU per request, and
  the API bundle (~4 MB gzipped) exceeds the Free plan's 3 MB limit.
- `wrangler login` (or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in CI).

## 1. Create resources (once per environment)

```bash
cd apps/api
pnpm exec wrangler d1 create ahemads-restro-staging          # copy database_id into env.staging
pnpm exec wrangler r2 bucket create ahemads-restro-uploads-staging
pnpm exec wrangler r2 bucket create ahemads-restro-backups-staging
```

Repeat with `production`. Replace each `REPLACE_WITH_*` in
`apps/api/wrangler.jsonc`. Durable Objects and rate limiters need no
pre-creation (the `migrations` block in `wrangler.jsonc` creates the Durable
Object classes on first deploy; rate limiter `namespace_id`s are any unique
integers per account).

## 2. Secrets and settings

```bash
pnpm exec wrangler secret put JWT_SECRET --env staging         # openssl rand -hex 32
pnpm exec wrangler secret put WEBHOOK_KEY --env staging        # optional
pnpm exec wrangler secret put EMAIL_API_KEY --env staging      # optional (Resend/SendGrid)
```

Optional secrets: `TWO_FACTOR_KEY` (2FA secret encryption; falls back to
`JWT_SECRET`) and `LEADS_ACCESS_TOKEN` (24+ characters; enables
`GET /api/v1/leads/demo-requests` for reading the website's demo requests).

Set `CORS_ORIGIN` (the web origin), `EMAIL_FROM`/`EMAIL_PROVIDER` if e-mail is
used, `DEMO_NOTIFY_EMAIL` if demo requests should be e-mailed, `RELEASES_REPO`
if the update notice should follow a GitHub repository, and
`COOKIE_SECURE=true` in each environment's `vars`. Swagger is off in
production unless `ENABLE_SWAGGER=true`. The full list is in the README's
environment variable table.

### Website build settings

The web Worker's public site reads `NEXT_PUBLIC_*` variables **at build
time**, so export them in the shell (or CI job) that runs
`deploy:staging` / `deploy:production`, or put them in
`apps/web/.env.production.local` (git-ignored):

```bash
export NEXT_PUBLIC_SITE_URL=https://<public-host>              # required for a public site
export NEXT_PUBLIC_SOURCE_CODE_URL=https://<public-repository> # AGPL-3.0 §13 source offer
# optional: NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_GSC_VERIFICATION, NEXT_PUBLIC_SUPPORT_EMAIL
```

See `apps/web/.env.example` and
[../marketing/ANALYTICS-AND-SEARCH-CONSOLE.md](../marketing/ANALYTICS-AND-SEARCH-CONSOLE.md).

## 3. Database

```bash
pnpm --filter @ahemads-restro/api db:migrate:staging
```

New installation: done — the first sign-up creates the restaurant and owner.
Sign-up stays open afterwards (every sign-up creates another restaurant);
restrict `/signup` and `POST /api/v1/auth/register` (for example with a
Cloudflare WAF rule or Cloudflare Access) if the deployment is not meant to
accept new restaurants.
Moving an existing self-hosted Nodedr OrderRestro (upstream) installation:
follow DATA-MIGRATION.md now.

## 4. Deploy (API first, so the web Worker's service binding resolves)

```bash
pnpm --filter @ahemads-restro/api deploy:staging
pnpm --filter @ahemads-restro/web deploy:staging
# or both: pnpm deploy:staging
```

Attach a hostname to the **web** Worker (Workers → Settings → Domains &
Routes, or a `routes` entry in `apps/web/wrangler.jsonc`). The API needs no
public hostname: it is reached through the service binding. (It keeps a
`*.workers.dev` URL by default; disable `workers_dev` for it if you do not
want that.)

## 5. Verify

```bash
API_URL=https://<staging-host> pnpm test:smoke     # creates a throwaway restaurant
```

Then sign in, switch to Arabic, place and pay an order, check the KDS updates
live, print a receipt.

## Production

Same steps with `--env production` / `deploy:production`. Before migrating
data into production read DATA-MIGRATION.md (Time Travel bookmark, maintenance
window). Roll back code with `wrangler rollback --env production` (per
Worker); roll back data with D1 Time Travel (OPERATIONS.md).

## Observability

`observability.enabled` is on for both Workers: logs and invocations appear
under Workers → Logs. `pnpm exec wrangler tail --env production` streams live.
Nest's own logger (errors with stack traces, warnings such as rejected
realtime connections or failed webhook deliveries) writes to these logs.
