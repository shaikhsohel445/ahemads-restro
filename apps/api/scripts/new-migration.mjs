#!/usr/bin/env node
// Creates the next D1 migration from the difference between the migrations
// already in ./migrations and prisma/schema.prisma.
//
//   pnpm --filter @nodedr-restaurant/api db:new-migration <short_name>
//
// Prisma generates the SQL (SQLite dialect); this script numbers the file the
// way `wrangler d1 migrations apply` expects (0002_name.sql, ...) and fixes
// the one construct Prisma emits that SQLite reads differently: a JSON array
// default written as `DEFAULT []` (an identifier in SQLite) becomes the
// string literal `DEFAULT '[]'`.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const name = (process.argv[2] ?? '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
if (!name) {
  console.error('usage: new-migration.mjs <short_name>');
  process.exit(1);
}
const dir = resolve(import.meta.dirname, '..', 'migrations');
const existing = readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
const next = String(existing.length + 1).padStart(4, '0');
const from = existing.length ? ['--from-migrations', dir] : ['--from-empty'];

const sql = execFileSync(
  'pnpm',
  ['exec', 'prisma', 'migrate', 'diff', ...from, '--to-schema', 'prisma/schema.prisma', '--script'],
  { cwd: resolve(import.meta.dirname, '..'), encoding: 'utf8' },
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
