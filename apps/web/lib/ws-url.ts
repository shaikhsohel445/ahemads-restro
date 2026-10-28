// Base URL (ws:// or wss://) of the realtime endpoint.
//
// In production the web Worker and the API share one origin (the web Worker
// forwards /api/* to the API Worker over a service binding), so the socket
// goes to this same origin and the httpOnly session cookie is sent with it.
// NEXT_PUBLIC_WS_URL overrides that for local development, where `next dev`
// cannot proxy WebSocket upgrades: point it at the API's `wrangler dev`
// (ws://localhost:8787 — use "localhost" on both sides so the cookie, which
// is scoped to the host and not the port, is shared).
export function resolveWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/^http/, "ws");
  }
  return "ws://localhost:8787";
}
