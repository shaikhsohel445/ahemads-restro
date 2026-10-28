import type { NextConfig } from "next";

// The browser only ever talks to ONE origin. In production on Cloudflare the
// web Worker (worker.ts) forwards /api/* to the API Worker over a service
// binding. In local development (`next dev`) the rewrite below does the same
// job against the API's `wrangler dev` (http://localhost:8787 by default), so
// the session cookie stays first-party in both. WebSockets cannot be proxied
// by `next dev`; set NEXT_PUBLIC_WS_URL=ws://localhost:8787 for local runs
// (see lib/ws-url.ts).
const API_DEV_URL = process.env.API_DEV_URL ?? "http://localhost:8787";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/api/:path*", destination: `${API_DEV_URL}/api/:path*` }];
  },
};

export default nextConfig;
