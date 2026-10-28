import { defineConfig } from 'prisma/config';

// Prisma 7 reads its CLI configuration from here. At runtime the API never
// uses a connection URL: PrismaService is constructed with the D1 driver
// adapter bound to the Worker's `DB` binding (see src/prisma/prisma.service.ts).
// Schema changes are shipped as D1 migrations (apps/api/migrations, applied by
// `wrangler d1 migrations apply`), generated with `prisma migrate diff`
// (see docs/cloudflare/DATABASE.md). The SQLite file below is only a scratch
// target the schema engine needs for diffing; it never holds real data.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.PRISMA_SCRATCH_DB_URL ?? 'file:./.prisma-scratch.db',
  },
});
