import type { WorkerEnv } from './bindings';

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

// Edge rate limits for unauthenticated, abuse-prone endpoints, enforced with
// Cloudflare's Rate Limiting binding before the request reaches Nest.
//
// Why both this and the existing @Throttle decorators: @nestjs/throttler
// counts in memory, which on Workers means per isolate — a brute-force run
// spread across Cloudflare's many isolates would barely notice it. The
// binding counts per Cloudflare location for the key (client IP + route).
// The @Throttle limits stay as a second, stricter-per-isolate layer.
//
// The binding only supports 10 s or 60 s windows; the limits below match the
// self-hosted @Throttle values per minute.
const RULES: { binding: keyof WorkerEnv; method: string; path: RegExp }[] = [
  { binding: 'AUTH_RATE_LIMITER', method: 'POST', path: /^\/api\/v1\/auth\/(login|register|pin-login|2fa\/enable|2fa\/disable)$/ },
  { binding: 'PUBLIC_RATE_LIMITER', method: 'POST', path: /^\/api\/v1\/public\// },
];

export async function edgeRateLimit(
  request: Request,
  env: WorkerEnv,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  const rule = RULES.find(
    (r) => r.method === request.method && r.path.test(pathname),
  );
  if (!rule) return null;
  const limiter = env[rule.binding] as RateLimiter | undefined;
  if (!limiter) return null; // binding not configured (e.g. a test harness)
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await limiter.limit({ key: `${ip}:${pathname}` });
  if (success) return null;
  return Response.json(
    {
      statusCode: 429,
      message: 'Too many attempts. Please wait a minute and try again.',
    },
    { status: 429, headers: { 'Retry-After': '60' } },
  );
}
