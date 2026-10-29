# Realtime (Socket.IO → Durable Objects)

## Then and now

| | Self-hosted (Nodedr OrderRestro, upstream) | Cloudflare (Ahemad's Restro) |
|---|---|---|
| Server | Socket.IO gateway inside the Nest process | `RealtimeHub` Durable Object, one per restaurant (`apps/api/src/realtime/realtime-hub.do.ts`) |
| Endpoint | `/socket.io/` (polling → websocket) | `GET /api/realtime?branchId=…` (WebSocket upgrade) |
| Auth | session cookie + branch access, checked on connect | same check (`RealtimeGateway.authorizeUpgrade`) before the request reaches the Durable Object |
| Rooms | `branch:<id>`, `user:<id>` | same, as WebSocket tags |
| Server API | `emitToBranch`, `emitToUsers` | unchanged — none of the ~50 call sites changed |
| Message | Socket.IO event | JSON `{"event": "...", "payload": {...}}` |
| Client | `socket.io-client` | `apps/web/lib/realtime-socket.ts` (`on`, `disconnect`, auto-reconnect with backoff, keep-alive) |

Events are unchanged: `order.created`, `order.updated`, `kot.created`,
`kot.updated`, `table.updated`, `table.request`, `notification.created`, …

## Guarantees

- **Tenant isolation:** a socket can only live in its own restaurant's
  Durable Object, and rooms are fixed at upgrade time from the verified
  session; nothing a client sends changes them.
- **Persist, then notify:** services emit after their D1 writes complete; the
  push is delivered via `waitUntil`, after the response.
- **Pushes are hints, not data** (as before): screens refetch from the API.
  After any reconnect the client refetches every query, so a push missed
  while offline cannot leave a screen stale.
- **Keep-alive:** the client sends `ping` every 25 s; the Durable Object's
  auto-response answers `pong` without waking from hibernation. No pong in
  10 s → the client closes and reconnects (0.5 s, 1 s, 2 s … capped at 15 s,
  with jitter).
- **Cost:** hibernating WebSockets do not bill duration while idle, so an idle
  kitchen tablet costs nothing between orders.

Unauthenticated guests (QR order page) do not use sockets, exactly as before.

## Verified

`scripts/verify/smoke-api.mjs`: a socket without a session cookie is refused
(401); a staff socket receives the event produced by creating an order.
