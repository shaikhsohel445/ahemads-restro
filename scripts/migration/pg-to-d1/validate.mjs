#!/usr/bin/env node
// Step 4 of 4: compare the imported D1 database with the PostgreSQL export.
//
//   node validate.mjs --export ./export --dir ./d1-import --env staging
//   node validate.mjs --export ./export --dir ./d1-import --local [--persist-to …]
//
// Checks, per table: row count == rows converted by transform.mjs == rows in
// the export (minus any rows listed as errors in report.json); financial
// column sums (orders, payments, refunds, …) equal to the cent; and D1's
// own `PRAGMA foreign_key_check` finds no orphans. Exits 1 on any mismatch
// and writes validation.json next to the import files.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FINANCIAL_CHECKS, REPO, SKIP_TABLES, arg } from './common.mjs';

const exportDir = arg('export', './export');
const dir = resolve(arg('dir', './d1-import'));
const env = arg('env', '');
const local = process.argv.includes('--local');
const persistTo = arg('persist-to', '');

const manifest = JSON.parse(readFileSync(join(exportDir, 'manifest.json'), 'utf8'));
const report = JSON.parse(readFileSync(join(dir, 'report.json'), 'utf8'));
const apiDir = join(REPO, 'apps/api');

function d1(sql) {
  const out = execFileSync(
    'pnpm',
    [
      'exec', 'wrangler', 'd1', 'execute', 'DB', '--json', '--command', sql,
      ...(local ? ['--local'] : ['--remote']),
      ...(env ? ['--env', env] : []),
      ...(persistTo ? ['--persist-to', resolve(persistTo)] : []),
    ],
    { cwd: apiDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
  return JSON.parse(out.slice(out.indexOf('[')))[0].results;
}

const problems = [];
const results = { tables: {}, sums: {}, foreignKeys: [] };
const errorsByTable = {};
for (const e of report.rowErrors) errorsByTable[e.table] = (errorsByTable[e.table] ?? 0) + 1;

const tables = Object.entries(manifest.tables).filter(([t, m]) => !m.skipped && !SKIP_TABLES.has(t) && report.rows[t]);
// One row of scalar subqueries (D1 limits compound SELECTs, so no UNION).
const [countRow] = d1(
  `SELECT ${tables.map(([t]) => `(SELECT COUNT(*) FROM "${t}") AS "${t}"`).join(', ')}`,
);
const counts = Object.entries(countRow).map(([t, n]) => ({ t, n: Number(n) }));
for (const { t, n } of counts) {
  const expected = manifest.tables[t].rows - (errorsByTable[t] ?? 0);
  results.tables[t] = { source: manifest.tables[t].rows, d1: n, expected };
  if (n !== expected) problems.push(`${t}: ${n} rows in D1, expected ${expected} (source ${manifest.tables[t].rows})`);
}

for (const [table, cols] of FINANCIAL_CHECKS) {
  const src = manifest.tables[table]?.sums;
  if (!src || errorsByTable[table]) continue;
  const present = cols.filter((c) => c in src);
  const [row] = d1(`SELECT ${present.map((c) => `ROUND(COALESCE(SUM("${c}"), 0), 2) AS "${c}"`).join(', ')} FROM "${table}"`);
  for (const c of present) {
    const a = Math.round(Number(src[c]) * 100);
    const b = Math.round(Number(row[c]) * 100);
    results.sums[`${table}.${c}`] = { source: src[c], d1: row[c] };
    if (a !== b) problems.push(`${table}.${c}: sum ${row[c]} in D1, ${src[c]} in source`);
  }
}

results.foreignKeys = d1('PRAGMA foreign_key_check');
if (results.foreignKeys.length) problems.push(`${results.foreignKeys.length} foreign key violation(s)`);

writeFileSync(join(dir, 'validation.json'), JSON.stringify({ ...results, problems }, null, 2));
for (const [t, r] of Object.entries(results.tables)) {
  if (r.source) console.log(`${r.d1 === r.expected ? 'ok  ' : 'FAIL'} ${t}: ${r.d1}/${r.expected}`);
}
for (const [k, v] of Object.entries(results.sums)) console.log(`sum  ${k}: ${v.d1} (source ${v.source})`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('\nValidation passed: counts, financial sums and foreign keys match.');
