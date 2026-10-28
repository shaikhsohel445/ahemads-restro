import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '../generated/prisma/client';
import { workerEnv } from '../cloudflare/bindings';

// Cloudflare D1 through Prisma's driver adapter. There is no connection pool
// or URL: the adapter wraps the Worker's `DB` binding.
//
// Transactions:
//   - `$transaction([q1, q2, …])` (array form) is sent as one D1 batch, which
//     D1 executes atomically. Unchanged.
//   - `$transaction(async (tx) => …)` (interactive) does not exist on D1 and
//     Prisma rejects it. The ~30 call sites carried over from PostgreSQL keep
//     their shape: the callback runs against this client directly. Isolation
//     — what those blocks relied on PostgreSQL for (no interleaved
//     read-modify-write, the old `FOR UPDATE` row locks) — comes from the
//     per-restaurant WriteLock held for the whole request
//     (src/cloudflare/write-lock.do.ts). What is NOT kept is rollback: if a
//     callback throws after some writes, those writes stay. The services
//     validate before writing, and docs/cloudflare/DATABASE.md lists this as
//     a known difference.
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter: new PrismaD1(workerEnv().DB as never) });
  }

  // Overloads mirror PrismaClient's own.
  override $transaction: PrismaClient['$transaction'] = ((
    arg: unknown,
    options?: unknown,
  ) => {
    if (typeof arg === 'function') {
      return (arg as (tx: unknown) => Promise<unknown>)(this);
    }
    // The generated client class types its prototype loosely; the call below
    // is the client's own batch $transaction.
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const batch = PrismaClient.prototype.$transaction as (
      this: PrismaClient,
      arg: unknown,
      options?: unknown,
    ) => Promise<unknown>;
    return batch.call(this, arg, options);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  }) as PrismaClient['$transaction'];

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
