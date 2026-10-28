// Minimal declarations for the Workers runtime modules this API imports.
// The full @cloudflare/workers-types globals are not loaded program-wide
// because they clash with @types/node (Request, Response, crypto, ...) that
// the NestJS code is typed against; the Worker-only files import the types
// they need from @cloudflare/workers-types explicitly.
declare module 'cloudflare:workers' {
  import type { DurableObjectState } from '@cloudflare/workers-types';

  export abstract class DurableObject<Env = unknown> {
    protected ctx: DurableObjectState;
    protected env: Env;
    constructor(ctx: DurableObjectState, env: Env);
  }

  export function waitUntil(promise: Promise<unknown>): void;
}

declare module 'cloudflare:node' {
  export function httpServerHandler(options: { port: number }): {
    fetch(request: unknown, env: unknown, ctx: unknown): Promise<Response>;
  };
}

declare module 'cloudflare:sockets' {
  export interface Socket {
    readonly opened: Promise<unknown>;
    readonly closed: Promise<void>;
    readonly readable: ReadableStream<Uint8Array>;
    readonly writable: WritableStream<Uint8Array>;
    close(): Promise<void>;
  }
  export function connect(address: { hostname: string; port: number }): Socket;
}
