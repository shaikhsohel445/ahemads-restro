#!/usr/bin/env node
// Creates the next D1 migration from the difference between the migrations
// already in ./migrations and prisma/schema.prisma.
//
//   pnpm --filter @ahemads-restro/api db:new-migration <short_name>
//
// Prisma generates the SQL (SQLite dialect); this script numbers the file the
// way `wrangler d1 migrations apply` expects (0002_name.sql, ...) and fixes
// the one construct Prisma emits that SQLite reads differently: a JSON array
// default written as `DEFAULT []` (an identifier in SQLite) becomes the
// string literal `DEFAULT '[]'`.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const name = (process.argv[2] ?? '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
if (!name) {
  console.error('usage: new-migration.mjs <short_name>');
  process.exit(1);
}
const dir = resolve(import.meta.dirname, '..', 'migrations');
const existing = readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
const next = String(existing.length + 1).padStart(4, '0');
// Replay the existing D1 migrations into a scratch SQLite file and diff the
// schema against it (Prisma's --from-migrations expects its own folder
// layout, not Wrangler's flat numbered files).
const scratch = join(mkdtempSync(join(tmpdir(), 'd1-diff-')), 'scratch.db');
const db = new DatabaseSync(scratch);
for (const f of existing) db.exec(readFileSync(join(dir, f), 'utf8'));
db.close();
const from = existing.length ? ['--from-config-datasource'] : ['--from-empty'];

const sql = execFileSync(
  'pnpm',
  ['exec', 'prisma', 'migrate', 'diff', ...from, '--to-schema', 'prisma/schema.prisma', '--script'],
  {
    cwd: resolve(import.meta.dirname, '..'),
    encoding: 'utf8',
    env: { ...process.env, PRISMA_SCRATCH_DB_URL: `file:${scratch}` },
  },
);
const fixed = fixSql(sql);
if (!fixed.trim() || /This is an empty migration/.test(fixed)) {
  console.log('Schema and migrations are in sync; nothing to write.');
  process.exit(0);
}
const file = resolve(dir, `${next}_${name}.sql`);
writeFileSync(file, fixed);
console.log(`Wrote ${file}`);

export function fixSql(text) {
  return text.replace(/DEFAULT \[\]/g, "DEFAULT '[]'");
}

// Also usable to normalise an existing file: node new-migration.mjs --fix <file>
if (process.argv[2] === '--fix') {
  const f = process.argv[3];
  writeFileSync(f, fixSql(readFileSync(f, 'utf8')));
}
