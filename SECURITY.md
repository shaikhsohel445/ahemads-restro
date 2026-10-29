# Security policy

## Supported versions

| Version | Supported |
|---|---|
| 2.0.x (this repository, `master`) | Yes |
| Earlier commits of this repository | No — update to the latest `master` |
| Nodedr OrderRestro (upstream, self-hosted) | Not covered here; report to the upstream project at <https://github.com/Raktim94/nodedr-restaurant-pos> |

Ahemad's Restro has not been deployed to a production environment yet.
Security fixes are made on `master`.

## Reporting a vulnerability

Please report vulnerabilities **privately**. Do not open a public issue,
pull request or discussion for a security problem.

1. **GitHub private vulnerability reporting** (preferred): on the
   repository page open **Security → Report a vulnerability**. Only the
   maintainers can see the report.
2. **Phone**: Wem Studios, [+91 8308042362](tel:+918308042362)
   (website: <https://wemstudios.in/>). Ask how to send the details
   privately; do not send exploit details through public channels.

Include what you can of the following: the affected component (API Worker,
web Worker, marketing site, migration tooling), the version or commit, steps
to reproduce, the impact you expect, and whether you have tested it only
against your own local installation.

Test only against your own local installation (`wrangler dev`) or a
deployment you are authorised to test. Do not access or change data that is
not yours, and do not run denial-of-service or volume tests against someone
else's deployment.

We will acknowledge the report, keep you informed while it is investigated,
and credit you in the fix's changelog entry if you wish.

## Scope notes

These are the security-relevant parts of this edition; reports about them
are especially welcome.

- **Authentication and rate limits.** Session JWT in the httpOnly
  `nodedr_session` cookie (`COOKIE_SECURE=true` in staging/production);
  staff PIN quick-switch; TOTP two-factor. Sign-in, registration, PIN
  sign-in and 2FA enable/disable are limited at the edge by the
  `AUTH_RATE_LIMITER` binding (10 requests per 60 s per IP and route); public
  `POST /api/v1/public/*` endpoints (QR orders, kiosk orders, demo requests)
  by `PUBLIC_RATE_LIMITER` (30 per 60 s). The NestJS `@Throttle` limits
  remain as a second, per-isolate layer (`apps/api/src/cloudflare/rate-limit.ts`).
- **Permissions.** Every protected route checks a permission key and branch
  access on the server; hiding a link in the UI is never the only check.
- **Tenant isolation.** Realtime sockets live in their own restaurant's
  Durable Object; rooms are fixed from the verified session at upgrade time.
- **Demo request leads.** `GET /api/v1/leads/demo-requests` requires
  `Authorization: Bearer <LEADS_ACCESS_TOKEN>`, compared in constant time.
  The token must be at least 24 characters; while it is unset or shorter the
  endpoint always answers 401. Use a random value (`openssl rand -hex 32`)
  and rotate it if it may have leaked.
- **Secrets.** `JWT_SECRET` (required, at least 32 characters, validated at
  boot), `WEBHOOK_KEY`, `TWO_FACTOR_KEY`, `EMAIL_API_KEY`,
  `LEADS_ACCESS_TOKEN` and the `VERIFACTU_*` keys are set with
  `wrangler secret put <NAME> --env <staging|production>`, never in
  `wrangler.jsonc`. Locally they live in `apps/api/.dev.vars`, which is
  git-ignored: **never commit `.dev.vars`** or any `.env*.local` file. Only
  the `.example` templates belong in git.
- **Webhooks.** Payloads are signed (HMAC-SHA256, `X-OrderRestro-Signature`);
  webhook URLs must be HTTPS and public (SSRF checks in
  `apps/api/src/modules/webhooks/net-guard.ts`).
- **Money.** Prices, tax, discounts and totals are computed on the server;
  a client can never send a total or a tax amount. A way to change what a
  guest pays or what is recorded as paid is a security issue.
- **Website.** Analytics loads only after consent and only when
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; the demo form stores the country
  header and user agent, not the IP address.

Out of scope: findings that need a compromised Cloudflare account or a
leaked secret, missing hardening headers without a demonstrated impact, the
local demo account `owner@demo.local` (seed data for local development only),
and vulnerabilities in third-party services (report those to the vendor).
