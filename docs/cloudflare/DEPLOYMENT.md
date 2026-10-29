# Deploying to Cloudflare

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

Set `CORS_ORIGIN` (the web origin), `EMAIL_FROM`/`EMAIL_PROVIDER` if e-mail is
used, and `COOKIE_SECURE=true` in each environment's `vars`. Swagger is off in
production unless `ENABLE_SWAGGER=true`.

## 3. Database

```bash
pnpm --filter @ahemads-restro/api db:migrate:staging
```

New installation: done — the first sign-up creates the restaurant and owner.
Moving an existing self-hosted installation: follow DATA-MIGRATION.md now.

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
