import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BranchAccessService } from '../common/services/branch-access.service';
import { hasWorkerEnv, waitUntil, workerEnv } from '../cloudflare/bindings';
import { readCookie } from '../cloudflare/write-lock.service';
import { PrismaService } from '../prisma/prisma.service';

interface RealtimeHubStub {
  fetch(request: Request): Promise<Response>;
  broadcast(rooms: string[], event: string, payload: unknown): Promise<number>;
}

export interface VerifiedRealtimeIdentity {
  userId: string;
  restaurantId: string;
  branchId: string;
}

// Same public surface as the Socket.IO gateway it replaces —
// emitToBranch / emitToUsers — so none of the ~50 call sites in the
// services changed. Delivery now goes through the restaurant's RealtimeHub
// Durable Object (realtime-hub.do.ts) instead of an in-process Socket.IO
// server, which a Worker cannot host.
//
// Room scoping is unchanged:
//   - emitToBranch: table/KOT/order state, genuinely "everyone on this branch"
//   - emitToUsers: permission-gated or single-recipient notifications; never
//     sent through a branch room
@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);
  // Branch -> restaurant and user -> restaurant never change for a row, so an
  // isolate-level cache saves a D1 read per emit.
  private readonly branchTenant = new Map<string, string>();
  private readonly userTenant = new Map<string, string>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  // Every event (KOT contents, table/order status, customer names) is scoped
  // to a branch room, so the upgrade requires the same httpOnly session
  // cookie every REST call needs and cross-checks the requested branch
  // against the user's own restaurant. A request failing either check never
  // reaches the Durable Object.
  async authorizeUpgrade(
    cookieHeader: string | null,
    branchId: string | null,
  ): Promise<VerifiedRealtimeIdentity> {
    const token = readCookie(cookieHeader, 'nodedr_session');
    if (!token) throw new Error('No session cookie');
    const payload = this.jwt.verify<{ sub: string }>(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, restaurantId: true },
    });
    if (!user || !user.isActive) throw new Error('Session no longer valid');
    if (!branchId) throw new Error('Missing branchId');
    await this.branchAccess.assertAccess(user.restaurantId, branchId);
    this.userTenant.set(user.id, user.restaurantId);
    this.branchTenant.set(branchId, user.restaurantId);
    return { userId: user.id, restaurantId: user.restaurantId, branchId };
  }

  hub(restaurantId: string): RealtimeHubStub {
    const ns = workerEnv().REALTIME;
    return ns.get(ns.idFromName(`restaurant:${restaurantId}`)) as never;
  }

  emitToBranch(branchId: string, event: string, payload: unknown) {
    this.dispatch(async () => {
      const restaurantId = await this.restaurantOfBranch(branchId);
      if (!restaurantId) return;
      await this.hub(restaurantId).broadcast(
        [this.branchRoom(branchId)],
        event,
        payload,
      );
    }, event);
  }

  // Targets exactly the given users' sockets, whichever branch they are
  // viewing, regardless of branch-room membership.
  emitToUsers(userIds: string[], event: string, payload: unknown) {
    if (userIds.length === 0) return;
    this.dispatch(async () => {
      const byTenant = new Map<string, string[]>();
      for (const id of userIds) {
        const restaurantId = await this.restaurantOfUser(id);
        if (!restaurantId) continue;
        byTenant.set(restaurantId, [
          ...(byTenant.get(restaurantId) ?? []),
          this.userRoom(id),
        ]);
      }
      await Promise.all(
        [...byTenant].map(([restaurantId, rooms]) =>
          this.hub(restaurantId).broadcast(rooms, event, payload),
        ),
      );
    }, event);
  }

  // Emits are fire-and-forget for the caller (as with Socket.IO), but the
  // Worker is kept alive until delivery to the hub finishes.
  private dispatch(work: () => Promise<void>, event: string) {
    if (!hasWorkerEnv()) return;
    waitUntil(
      work().catch((err) =>
        this.logger.warn(
          `Realtime push "${event}" failed: ${err instanceof Error ? err.message : String(err)}`,
        ),
      ),
    );
  }

  private async restaurantOfBranch(branchId: string) {
    const cached = this.branchTenant.get(branchId);
    if (cached) return cached;
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { restaurantId: true },
    });
    if (branch) this.branchTenant.set(branchId, branch.restaurantId);
    return branch?.restaurantId ?? null;
  }

  private async restaurantOfUser(userId: string) {
    const cached = this.userTenant.get(userId);
    if (cached) return cached;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { restaurantId: true },
    });
    if (user) this.userTenant.set(userId, user.restaurantId);
    return user?.restaurantId ?? null;
  }

  private branchRoom(branchId: string) {
    return `branch:${branchId}`;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}
