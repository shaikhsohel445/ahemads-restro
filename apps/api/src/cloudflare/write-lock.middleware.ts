import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { hasWorkerEnv, workerEnv } from './bindings';

interface WriteLockStub {
  acquire(leaseMs: number, waitMs: number): Promise<string | null>;
  release(token: string): Promise<void>;
}

const LEASE_MS = 30_000;
const WAIT_MS = 20_000;
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Holds the restaurant's WriteLock (see write-lock.do.ts) for the whole
// lifetime of every mutating request. The lock key is the restaurant the
// request will write to, worked out from what the request already carries:
//   - a staff session cookie        -> that user's restaurant
//   - /public/menu/:qrToken/...     -> the table's restaurant (QR orders)
//   - /public/kiosk/:kioskToken/... -> the kiosk branch's restaurant
//   - anything else (API keys, sync, signup/login) -> one shared "global" key
// Getting the key wrong can only over-serialise (fall back to "global"),
// never let two writers to the same restaurant run at once, because every
// path that can reach a restaurant's rows resolves to that restaurant.
@Injectable()
export class WriteLockMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WriteLockMiddleware.name);
  private readonly userTenant = new Map<string, string>();
  private readonly tokenTenant = new Map<string, string>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (READ_METHODS.has(req.method) || !hasWorkerEnv()) return next();

    let key = 'global';
    try {
      key = (await this.lockKey(req)) ?? 'global';
    } catch {
      key = 'global';
    }
    const ns = workerEnv().WRITE_LOCK;
    const stub = ns.get(ns.idFromName(key)) as unknown as WriteLockStub;
    const token = await stub.acquire(LEASE_MS, WAIT_MS);
    if (!token) {
      res.status(503).setHeader('Retry-After', '2').json({
        statusCode: 503,
        message: 'The restaurant is busy saving another change. Please retry.',
      });
      return;
    }
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      stub.release(token).catch((err) =>
        this.logger.warn(`Write lock release failed: ${String(err)}`),
      );
    };
    res.on('finish', release);
    res.on('close', release);
    next();
  }

  private async lockKey(req: Request): Promise<string | null> {
    const path = req.path;
    const qr = /\/v1\/public\/menu\/([^/]+)\//.exec(path);
    if (qr) return this.tenantOfToken('qr', qr[1]);
    const kiosk = /\/v1\/public\/kiosk\/([^/]+)\//.exec(path);
    if (kiosk) return this.tenantOfToken('kiosk', kiosk[1]);

    const session = (req.cookies as Record<string, string> | undefined)?.[
      'nodedr_session'
    ];
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
