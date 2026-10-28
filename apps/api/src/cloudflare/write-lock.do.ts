import { DurableObject } from 'cloudflare:workers';

// A FIFO mutex with a lease, one instance per restaurant.
//
// Why it exists: on PostgreSQL the services relied on interactive
// transactions and `SELECT ... FOR UPDATE` row locks (stock levels, running
// balances written with "round2 + set", never `increment`). D1 has neither:
// Prisma's D1 adapter runs `$transaction(fn)` bodies as individual
// statements, so two concurrent requests could interleave a read-modify-write
// and lose an update. Serialising every mutating request of one restaurant
// through this object restores the isolation those code paths were written
// against, without touching their logic. Reads never take the lock.
//
// A Durable Object is single-threaded and stays in memory while it has
// pending calls, so the in-memory queue is the lock state. The lease means a
// crashed or timed-out request can never wedge a restaurant for longer than
// LEASE_MS.
interface Waiter {
  token: string;
  leaseMs: number;
  resolve: (token: string | null) => void;
  giveUp: ReturnType<typeof setTimeout>;
}

export class WriteLock extends DurableObject {
  private holder: { token: string; expiry: ReturnType<typeof setTimeout> } | null =
    null;
  private queue: Waiter[] = [];

  acquire(leaseMs: number, waitMs: number): Promise<string | null> {
    const token = crypto.randomUUID();
    if (!this.holder) {
      this.grant(token, leaseMs);
      return Promise.resolve(token);
    }
    return new Promise((resolve) => {
      const waiter: Waiter = {
        token,
        leaseMs,
        resolve,
        giveUp: setTimeout(() => {
          this.queue = this.queue.filter((w) => w !== waiter);
          resolve(null);
        }, waitMs),
      };
      this.queue.push(waiter);
    });
  }

  release(token: string): void {
    if (this.holder?.token !== token) return;
    clearTimeout(this.holder.expiry);
    this.holder = null;
    this.next();
  }

  stats() {
    return { held: this.holder !== null, waiting: this.queue.length };
  }

  private grant(token: string, leaseMs: number) {
    this.holder = {
      token,
      expiry: setTimeout(() => this.release(token), leaseMs),
    };
  }

  private next() {
    const waiter = this.queue.shift();
    if (!waiter) return;
    clearTimeout(waiter.giveUp);
    this.grant(waiter.token, waiter.leaseMs);
    waiter.resolve(waiter.token);
  }
}
