#!/usr/bin/env node
// Step 3 of 4: load the transformed files into D1 and R2 with Wrangler.
//
//   node import.mjs --dir ./d1-import --env staging            # remote
//   node import.mjs --dir ./d1-import --local [--persist-to …] # local dev DB
//
// Runs from apps/api so Wrangler picks up its bindings (DB, UPLOADS). The
// target database must be freshly migrated and EMPTY (run
// `pnpm --filter @ahemads-restro/api db:migrate:<env>` first); importing
// twice fails on primary keys rather than duplicating rows.
// Never point this at production without a fresh D1 Time Travel bookmark
// (docs/cloudflare/DATA-MIGRATION.md).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { REPO, arg } from './common.mjs';

const dir = resolve(arg('dir', './d1-import'));
const env = arg('env', '');
const local = process.argv.includes('--local');
const persistTo = arg('persist-to', '');
const bucket = arg('bucket', '');
if (!local && !env) {
  console.error('Pass --env <staging|production> for a remote import, or --local.');
  process.exit(1);
}
const plan = JSON.parse(readFileSync(join(dir, 'plan.json'), 'utf8'));
const apiDir = join(REPO, 'apps/api');
const target = [
  ...(local ? ['--local'] : ['--remote']),
  ...(env ? ['--env', env] : []),
  ...(persistTo ? ['--persist-to', resolve(persistTo)] : []),
];
const wrangler = (args) =>
  execFileSync('pnpm', ['exec', 'wrangler', ...args], { cwd: apiDir, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });

for (const [i, file] of plan.sql.entries()) {
  process.stdout.write(`[${i + 1}/${plan.sql.length}] ${file} … `);
  wrangler(['d1', 'execute', 'DB', '--file', join(dir, file), '--yes', ...target]);
  console.log('ok');
}

if (plan.r2.length) {
  const name =
    bucket ||
    (() => {
      const cfg = readFileSync(join(apiDir, 'wrangler.jsonc'), 'utf8');
      const section = env ? cfg.slice(cfg.indexOf(`"${env}"`)) : cfg;
      return /"binding": "UPLOADS", "bucket_name": "([^"]+)"/.exec(section)?.[1];
    })();
  if (!name) throw new Error('Could not find the UPLOADS bucket name; pass --bucket');
  for (const [i, obj] of plan.r2.entries()) {
    process.stdout.write(`[R2 ${i + 1}/${plan.r2.length}] ${obj.key} … `);
    wrangler([
      'r2', 'object', 'put', `${name}/${obj.key}`,
      '--file', join(dir, obj.file),
      ...(obj.contentType ? ['--content-type', obj.contentType] : []),
      ...(local ? ['--local'] : ['--remote']),
      ...(persistTo ? ['--persist-to', resolve(persistTo)] : []),
    ]);
    console.log('ok');
  }
}
console.log('Import finished. Run validate.mjs next.');
