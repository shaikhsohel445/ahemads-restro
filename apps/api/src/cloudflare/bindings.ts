import type {
  D1Database,
  DurableObjectNamespace,
  KVNamespace,
  Queue,
  R2Bucket,
} from '@cloudflare/workers-types';

// Bindings declared in apps/api/wrangler.jsonc. Plain string vars/secrets
// are also mirrored onto process.env by the `nodejs_compat` runtime, which is
// how the existing services (ConfigService, process.env.X) keep reading them.
export interface WorkerEnv {
  DB: D1Database;
  UPLOADS: R2Bucket;
  BACKUPS: R2Bucket;
  CACHE: KVNamespace;
  REALTIME: DurableObjectNamespace;
  WRITE_LOCK: DurableObjectNamespace;
  JOBS?: Queue;
  JWT_SECRET?: string;
  CORS_ORIGIN?: string;
  [key: string]: unknown;
}

// The Worker entry stores the env it was invoked with here before the Nest
// app boots, so providers (PrismaService, StorageService, RealtimeGateway)
// can reach bindings without importing `cloudflare:workers` — which keeps
// them loadable under plain Node for unit tests.
let current: WorkerEnv | null = null;
let waitUntilImpl: ((promise: Promise<unknown>) => void) | null = null;

export function setWorkerEnv(
  env: WorkerEnv,
  waitUntilFn?: (promise: Promise<unknown>) => void,
) {
  current = env;
  if (waitUntilFn) waitUntilImpl = waitUntilFn;
}

export function workerEnv(): WorkerEnv {
  if (!current) {
    throw new Error(
      'Cloudflare bindings are not available (not running inside the Worker)',
    );
  }
  return current;
}

export function hasWorkerEnv(): boolean {
  return current !== null;
}

// Fire-and-forget work that must outlive the response (webhook delivery,
// realtime fan-out). Falls back to a detached promise outside the Worker.
export function waitUntil(promise: Promise<unknown>) {
  if (waitUntilImpl) {
    waitUntilImpl(promise);
  } else {
    promise.catch(() => undefined);
  }
}

// Work deliberately not awaited by the request that starts it ("void
// this.webhooks.emit(...)" in the self-hosted code). On Workers an un-awaited
// promise is not enough: once the response is sent, I/O the request still has
// in flight is cancelled, and a D1 query cancelled half-way leaves the shared
// Prisma client waiting on it, stalling every later query in the isolate.
// detach() hands the promise to waitUntil() so it runs to completion, and
// swallows its error the way the original `.catch(() => undefined)` did.
export function detach(promise: Promise<unknown>) {
  waitUntil(promise.catch(() => undefined));
}
