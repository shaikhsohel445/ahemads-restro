import 'reflect-metadata';
import { httpServerHandler } from 'cloudflare:node';
import { waitUntil as cfWaitUntil } from 'cloudflare:workers';
import type {
  ExecutionContext,
  ScheduledController,
} from '@cloudflare/workers-types';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { setWorkerEnv, type WorkerEnv } from './cloudflare/bindings';

// Durable Object classes must be exported from the Worker's main module.
export { RealtimeHub } from './realtime/realtime-hub.do';
export { WriteLock } from './cloudflare/write-lock.do';

// Cloudflare Workers entry for the API.
//
// The existing NestJS application runs on top of Express, which in turn runs
// on the Workers `node:http` server implementation: the Nest app listens on a
// virtual port inside the isolate and `httpServerHandler` hands each incoming
// fetch() to it. The app boots lazily on the first request of an isolate
// (global scope may not do I/O on Workers) and then serves every later
// request that isolate handles.
//
// Two things bypass Express:
//   - GET /api/realtime (WebSocket upgrade): authenticated by the Nest
//     RealtimeGateway, then handed to the restaurant's RealtimeHub Durable
//     Object, which owns the socket (Socket.IO replacement).
//   - Cron Triggers: `scheduled()` runs the jobs in cloudflare/scheduled.ts.
const NEST_PORT = 4000;
const nodeHandler = httpServerHandler({ port: NEST_PORT });

let appPromise: Promise<NestExpressApplication> | null = null;

async function boot(): Promise<NestExpressApplication> {
  const { createApp } = await import('./app.factory.js');
  const app = await createApp();
  await app.listen(NEST_PORT);
  return app;
}

function getApp(env: WorkerEnv): Promise<NestExpressApplication> {
  setWorkerEnv(env, cfWaitUntil);
  if (!appPromise) {
    appPromise = boot().catch((err) => {
      // Let the next request retry instead of caching a failed boot forever.
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

function startupError(err: unknown) {
  console.error('API failed to start', err);
  const message =
    err instanceof Error && err.message.startsWith('JWT_SECRET')
      ? err.message
      : 'API is starting or misconfigured — see the Worker logs.';
  return Response.json({ statusCode: 503, message }, { status: 503 });
}

async function realtimeUpgrade(
  request: Request,
  app: NestExpressApplication,
): Promise<Response> {
  if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
    return new Response('Expected a WebSocket upgrade', { status: 426 });
  }
  const { RealtimeGateway } = await import('./realtime/realtime.gateway.js');
  const gateway = app.get(RealtimeGateway);
  const url = new URL(request.url);
  let identity;
  try {
    identity = await gateway.authorizeUpgrade(
      request.headers.get('Cookie'),
      url.searchParams.get('branchId'),
    );
  } catch (err) {
    console.warn(
      `Rejecting realtime connection: ${err instanceof Error ? err.message : String(err)}`,
    );
    return new Response('Unauthorized', { status: 401 });
  }
  const headers = new Headers(request.headers);
  headers.set('X-Realtime-Branch', identity.branchId);
  headers.set('X-Realtime-User', identity.userId);
  return gateway
    .hub(identity.restaurantId)
    .fetch(new Request(request.url, { headers }));
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    let app: NestExpressApplication;
    try {
      app = await getApp(env);
    } catch (err) {
      return startupError(err);
    }
    if (new URL(request.url).pathname === '/api/realtime') {
      return realtimeUpgrade(request, app);
    }
    return nodeHandler.fetch(request as never, env as never, ctx as never);
  },

  async scheduled(
    controller: ScheduledController,
    env: WorkerEnv,
    ctx: ExecutionContext,
  ) {
    const app = await getApp(env);
    const { runCron } = await import('./cloudflare/scheduled.js');
    ctx.waitUntil(runCron(app, controller.cron));
  },
};
