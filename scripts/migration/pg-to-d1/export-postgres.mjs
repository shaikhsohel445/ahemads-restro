#!/usr/bin/env node
// Step 1 of 4: export the self-hosted PostgreSQL database to plain files.
//
//   SOURCE_DATABASE_URL=postgresql://user:pass@host:5432/orderrestro \
//     node export-postgres.mjs --out ./export
//
// Read-only on the source (one REPEATABLE READ snapshot, so every table is
// exported from the same instant). Writes:
//   export/tables/<table>.ndjson   one JSON row per line, values in a lossless
//                                  wire form (see encode() below)
//   export/manifest.json           row counts + financial sums per table, used
//                                  by validate.mjs after the import
// Point it at a backup restored into a scratch PostgreSQL, or at the live
// database during a maintenance window — it never writes to the source.
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { FINANCIAL_CHECKS, SKIP_TABLES, arg } from './common.mjs';

const url = arg('source-database-url', process.env.SOURCE_DATABASE_URL);
const out = arg('out', './export');
if (!url) {
  console.error('Set SOURCE_DATABASE_URL (or --source-database-url).');
  process.exit(1);
}

// Return every type as PostgreSQL's own text form, so nothing is lost or
// shifted by node-postgres' JS conversions (DATE at local midnight, numeric
// precision, int8 > 2^53). bytea is handled separately (hex text).
for (const oid of Object.values(pg.types.builtins)) {
  pg.types.setTypeParser(oid, (v) => v);
}
// Array types are not in `builtins`: _bool _bytea _int2 _int4 _text _varchar
// _int8 _float4 _float8 _timestamp _date _numeric _jsonb.
for (const oid of [1000, 1001, 1005, 1007, 1009, 1015, 1016, 1021, 1022, 1115, 1182, 1231, 3807]) {
  pg.types.setTypeParser(oid, (v) => v);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
// Timestamps come out in UTC text form regardless of the server's zone.
await client.query(`SET LOCAL TIME ZONE 'UTC'`);
await client.query(`SET LOCAL bytea_output = 'hex'`);

const tables = (
  await client.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
  )
).rows.map((r) => r.table_name);

const columnsOf = async (table) =>
  (
    await client.query(
      `SELECT column_name, data_type, udt_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [table],
    )
  ).rows;

mkdirSync(join(out, 'tables'), { recursive: true });
const manifest = { exportedAt: new Date().toISOString(), source: url.replace(/:[^:@/]+@/, ':***@'), tables: {} };

for (const table of tables) {
  if (SKIP_TABLES.has(table)) {
    manifest.tables[table] = { skipped: true };
    continue;
  }
  const cols = await columnsOf(table);
  const types = Object.fromEntries(cols.map((c) => [c.column_name, c.udt_name]));
  const stream = createWriteStream(join(out, 'tables', `${table}.ndjson`));
  // Keyset pagination on ctid keeps memory flat for large tables.
  const pageSize = 2000;
  let count = 0;
  let last = '(0,0)';
  for (;;) {
    const res = await client.query(
      `SELECT ctid::text AS __ctid, * FROM "${table}" WHERE ctid > $1::tid ORDER BY ctid LIMIT ${pageSize}`,
      [last],
    );
    for (const row of res.rows) {
      last = row.__ctid;
      delete row.__ctid;
      stream.write(JSON.stringify({ types, row }) + '\n');
      count++;
    }
    if (res.rows.length < pageSize) break;
  }
  await new Promise((r) => stream.end(r));
  const entry = { rows: count, columns: cols.map((c) => `${c.column_name}:${c.udt_name}`) };
  const check = FINANCIAL_CHECKS.find(([t]) => t === table);
  if (check) {
    const present = check[1].filter((c) => types[c]);
    if (present.length) {
      const sums = await client.query(
        `SELECT ${present.map((c) => `COALESCE(SUM("${c}"), 0)::text AS "${c}"`).join(', ')} FROM "${table}"`,
      );
      entry.sums = sums.rows[0];
    }
  }
  manifest.tables[table] = entry;
  console.log(`exported ${table}: ${count} rows`);
}

await client.query('COMMIT');
await client.end();
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\nWrote ${out}/manifest.json`);
