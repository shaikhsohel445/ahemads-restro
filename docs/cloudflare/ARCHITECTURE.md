# Architecture (Cloudflare edition)

```
 browser ──HTTPS──► ahemads-restro-web  (Worker: OpenNext build of apps/web + static assets)
                      │  /api/*  and  /api/realtime   (service binding "API", same origin)
                      ▼
                    ahemads-restro-api  (Worker: NestJS app from apps/api)
                      ├── D1  "DB"           all application data (SQLite dialect)
                      ├── R2  "UPLOADS"      menu photos, logos (uploads/), document attachments (documents/)
                      ├── R2  "BACKUPS"      gzip NDJSON database exports
                      ├── DO  "REALTIME"     RealtimeHub — one per restaurant, owns the WebSockets
                      ├── DO  "WRITE_LOCK"   WriteLock — one per restaurant, serialises writes
                      ├── Rate Limiting      sign-in and public order endpoints
                      └── Cron Triggers      scheduled orders, report e-mails, webhooks, backups
```

## Why this shape

| Decision | Reason |
|---|---|
| **Keep NestJS** and run it on Workers (`nodejs_compat` + `node:http` server bridge, `src/worker.ts`) instead of rewriting the API | 25k lines of services, guards, DTO validation and business rules move unchanged, so behaviour and API contracts stay identical. The bundle is built by `apps/api/build.mjs` because Nest's dependency injection needs TypeScript's decorator metadata, which Wrangler's esbuild does not emit. |
| **Prisma 7 + `@prisma/adapter-d1`** | Prisma 7 has no Rust engine (a WASM query compiler instead) and runs in Workers; the services keep their Prisma calls. The schema was converted from PostgreSQL (see DATABASE.md). |
| **Next.js on Workers via OpenNext**, not a static Pages export | The app has dynamic routes that must keep their URLs — printed table QR codes point at `/order/<token>`, kiosks at `/kiosk/<token>` — plus route handlers (kiosk service worker and manifest). A static export cannot serve unknown tokens. OpenNext is Cloudflare's supported adapter for App Router on Workers with static assets (the successor to `next-on-pages`). |
| **Service binding for `/api`** | Keeps the original single-origin design: the session cookie stays first-party and httpOnly, no CORS in production, no public hop between the two Workers. |
| **Durable Objects for realtime** | Socket.IO needs a long-lived server. A `RealtimeHub` per restaurant holds that restaurant's sockets (hibernation API: idle KDS tablets cost nothing) and can never broadcast across tenants. |
| **Durable Object write lock** | D1 has no interactive transactions or row locks; see DATABASE.md. |
| **R2 for files** | Workers have no disk; D1 rows are capped at 2 MB. |
| **No KV, no Queues** | Nothing in the app needs eventually-consistent caching (caching menus would show sold-out items as available). Background work already uses database-backed queues (webhook deliveries, scheduled orders) driven by Cron Triggers, so a Queue would add a second source of truth. |

## Request lifecycle (API)

1. `fetch()` in `src/worker.ts` stores the bindings for the providers and boots the Nest app once per isolate (lazily — global scope may not do I/O). A cold isolate takes about 1 s to boot locally; later requests reuse it.
2. `/api/realtime` upgrades are authenticated by `RealtimeGateway` and handed to the restaurant's `RealtimeHub`.
3. Sign-in and public order endpoints pass the edge rate limiter.
4. Mutating requests (`POST/PUT/PATCH/DELETE`) acquire the restaurant's `WriteLock`, run, and release it inside the request lifetime.
5. Express/Nest handle the request exactly as before (guards, pipes, interceptors, filters).
6. Work that is deliberately not awaited (webhook fan-out, audit writes from an interceptor, realtime pushes) goes through `detach()` / `waitUntil()`. On Workers, I/O a request leaves running after its response is cancelled; an orphaned D1 query would stall the shared Prisma client.

## What stayed the same

- Every REST route, request/response shape and status code under `/api/v1`.
- Authentication (httpOnly `nodedr_session` JWT cookie, PIN quick-switch, TOTP 2FA, API keys), RBAC permission keys and branch-access checks.
- Server-authoritative pricing, discounts, tax, loyalty, settlement and the order/KOT/billing state machines.
- The frontend's screens, routes and workflows.
