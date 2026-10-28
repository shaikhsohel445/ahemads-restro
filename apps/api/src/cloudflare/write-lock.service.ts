import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { workerEnv } from './bindings';

interface WriteLockStub {
  acquire(leaseMs: number, waitMs: number): Promise<string | null>;
  release(token: string): Promise<void>;
}

const LEASE_MS = 30_000;
const WAIT_MS = 20_000;
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Holds the restaurant's WriteLock (see write-lock.do.ts) around every
// mutating API request. Called from the Worker's fetch() (src/worker.ts), not
// from Express middleware: the lock must be released inside the request's own
// lifetime, and Express's `finish` event fires after the Worker has already
// returned the response — too late for an RPC to the Durable Object.
//
// The lock key is the restaurant the request will write to, worked out from
// what the request already carries:
//   - a staff session cookie        -> that user's restaurant
//   - /public/menu/:qrToken/...     -> the table's restaurant (QR orders)
//   - /public/kiosk/:kioskToken/... -> the kiosk branch's restaurant
//   - anything else (API keys, signup/login) -> one shared "global" key
// Getting the key wrong can only over-serialise (fall back to "global"),
// never let two writers to the same restaurant run at once, because every
// path that can reach a restaurant's rows resolves to that restaurant.
@Injectable()
export class WriteLockService {
  private readonly logger = new Logger(WriteLockService.name);
  private readonly userTenant = new Map<string, string>();
  private readonly tokenTenant = new Map<string, string>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  needsLock(request: Request): boolean {
    return (
      !READ_METHODS.has(request.method) &&
      new URL(request.url).pathname.startsWith('/api/')
    );
  }

  async run(
    request: Request,
    handle: () => Promise<Response>,
    waitUntil: (p: Promise<unknown>) => void,
  ): Promise<Response> {
    let key = 'global';
    try {
      key = (await this.lockKey(request)) ?? 'global';
    } catch {
      key = 'global';
    }
    const ns = workerEnv().WRITE_LOCK;
    const stub = ns.get(ns.idFromName(key)) as unknown as WriteLockStub;
    const token = await stub.acquire(LEASE_MS, WAIT_MS);
    if (!token) {
      return Response.json(
        {
          statusCode: 503,
          message: 'The restaurant is busy saving another change. Please retry.',
        },
        { status: 503, headers: { 'Retry-After': '2' } },
      );
    }
    try {
      const response = await handle();
      // Buffer the body before releasing, so every write the handler makes
      // while producing the response happens while the lock is held.
      const body = await response.arrayBuffer();
      return new Response(body, response);
    } finally {
      waitUntil(
        stub
          .release(token)
          .catch((err) =>
            this.logger.warn(`Write lock release failed: ${String(err)}`),
          ),
      );
    }
  }

  private async lockKey(request: Request): Promise<string | null> {
    const path = new URL(request.url).pathname;
    const qr = /\/v1\/public\/menu\/([^/]+)\//.exec(path);
    if (qr) return this.tenantOfToken('qr', qr[1]);
    const kiosk = /\/v1\/public\/kiosk\/([^/]+)\//.exec(path);
    if (kiosk) return this.tenantOfToken('kiosk', kiosk[1]);

    const session = readCookie(request.headers.get('Cookie'), 'nodedr_session');
    if (!session) return null;
    const { sub } = this.jwt.verify<{ sub: string }>(session);
    const cached = this.userTenant.get(sub);
    if (cached) return `restaurant:${cached}`;
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      select: { restaurantId: true },
    });
    if (!user) return null;
    this.userTenant.set(sub, user.restaurantId);
    return `restaurant:${user.restaurantId}`;
  }

  private async tenantOfToken(kind: 'qr' | 'kiosk', token: string) {
    const cacheKey = `${kind}:${token}`;
    const cached = this.tokenTenant.get(cacheKey);
    if (cached) return `restaurant:${cached}`;
    const branch =
      kind === 'qr'
        ? (
            await this.prisma.table.findUnique({
              where: { qrToken: token },
              select: {
                floor: { select: { branch: { select: { restaurantId: true } } } },
              },
            })
          )?.floor.branch
        : await this.prisma.branch.findUnique({
            where: { kioskToken: token },
            select: { restaurantId: true },
          });
    if (!branch) return null;
    this.tokenTenant.set(cacheKey, branch.restaurantId);
    return `restaurant:${branch.restaurantId}`;
  }
}

export function readCookie(raw: string | null, name: string): string | null {
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
