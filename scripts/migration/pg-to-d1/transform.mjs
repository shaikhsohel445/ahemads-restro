#!/usr/bin/env node
// Step 2 of 4: turn an export (export-postgres.mjs) into D1 import files.
//
//   node transform.mjs --export ./export --out ./d1-import [--uploads-dir /data/uploads]
//
// Writes:
//   d1-import/sql/NNNN_<table>[_partK].sql  INSERTs in foreign-key order,
//                                           each statement < 90 KB (D1 caps
//                                           a statement at 100 KB)
//   d1-import/r2/...                        objects to upload to the UPLOADS
//                                           bucket (document attachments,
//                                           menu photos/logos)
//   d1-import/plan.json                     ordered SQL files + R2 objects
//   d1-import/report.json                   every dropped column, skipped
//                                           table, scrubbed value and
//                                           conversion failure
// Nothing is silently discarded: a row that cannot be converted faithfully
// fails the run (listed in report.json) unless --allow-row-errors is given.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { SCRUB, SKIP_TABLES, arg, dependencyOrder, loadTargetSchema, readJsonLines } from './common.mjs';
import { ConversionError, sqlString, toSqlite } from './values.mjs';

const exportDir = arg('export', './export');
const out = arg('out', './d1-import');
const uploadsDir = arg('uploads-dir', '');
const allowRowErrors = process.argv.includes('--allow-row-errors');
const MAX_STATEMENT = 90_000;

const manifest = JSON.parse(readFileSync(join(exportDir, 'manifest.json'), 'utf8'));
const schema = loadTargetSchema();
const order = dependencyOrder(schema);

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'sql'), { recursive: true });
mkdirSync(join(out, 'r2'), { recursive: true });

const report = {
  createdAt: new Date().toISOString(),
  skippedTables: [],
  sourceOnlyTables: [],
  targetOnlyTables: [],
  droppedColumns: {},
  scrubbed: {},
  rowErrors: [],
  rows: {},
};
const plan = { sql: [], r2: [] };
let fileNo = 0;

for (const t of Object.keys(manifest.tables)) {
  if (manifest.tables[t].skipped || SKIP_TABLES.has(t)) report.skippedTables.push(t);
  else if (!schema.has(t)) report.sourceOnlyTables.push(t);
}

const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

for (const table of order) {
  const src = join(exportDir, 'tables', `${table}.ndjson`);
  if (!existsSync(src)) {
    report.targetOnlyTables.push(table);
    continue;
  }
  const target = schema.get(table);
  const targetCols = new Map(target.columns.map((c) => [c.name, c]));
  const lines = readJsonLines(src);
  const statements = [];
  let header = null;
  let values = [];
  let size = 0;
  let converted = 0;

  const flush = () => {
    if (!values.length) return;
    statements.push(`${header}\n${values.join(',\n')};`);
    values = [];
    size = 0;
  };

  for (const [index, { types, row }] of lines.entries()) {
    const record = { ...row };
    // Document attachments move from a bytea column to R2.
    if (table === 'document_files' && 'data' in record) {
      const key = `documents/${randomUUID()}`;
      const hex = String(record.data ?? '').replace(/^\\x/, '');
      const file = join('r2', key);
      mkdirSync(join(out, 'r2', 'documents'), { recursive: true });
      writeFileSync(join(out, file), Buffer.from(hex, 'hex'));
      plan.r2.push({ key, file, contentType: record.mimeType ?? 'application/octet-stream', bytes: hex.length / 2 });
      delete record.data;
      record.storageKey = key;
      types.storageKey = 'text';
    }
    if (SCRUB[table]) {
      for (const [col, value] of Object.entries(SCRUB[table])) {
        if (col in record) {
          record[col] = value;
          report.scrubbed[`${table}.${col}`] = (report.scrubbed[`${table}.${col}`] ?? 0) + 1;
        }
      }
    }
    const names = [];
    const literals = [];
    try {
      for (const [col, value] of Object.entries(record)) {
        const tc = targetCols.get(col);
        if (!tc) {
          report.droppedColumns[`${table}.${col}`] = (report.droppedColumns[`${table}.${col}`] ?? 0) + 1;
          continue;
        }
        names.push(col);
        literals.push(toSqlite(value, types[col] ?? 'text', tc.type));
      }
      for (const tc of target.columns) {
        if (tc.notNull && !tc.hasDefault && !names.includes(tc.name)) {
          throw new ConversionError(`required column ${tc.name} has no source value`);
        }
      }
    } catch (err) {
      if (!(err instanceof ConversionError)) throw err;
      report.rowErrors.push({ table, line: index + 1, id: row.id ?? null, error: err.message });
      continue;
    }
    const rowHeader = `INSERT INTO "${table}" (${names.map((n) => `"${n}"`).join(', ')}) VALUES`;
    const tuple = `(${literals.join(', ')})`;
    if (tuple.length + rowHeader.length > MAX_STATEMENT) {
      report.rowErrors.push({ table, line: index + 1, id: row.id ?? null, error: 'row larger than a D1 statement (100 KB)' });
      continue;
    }
    if (header !== rowHeader || size + tuple.length > MAX_STATEMENT) {
      flush();
      header = rowHeader;
    }
    values.push(tuple);
    size += tuple.length + 2;
    converted++;
  }
  flush();
  report.rows[table] = { source: lines.length, converted };

  // Files of at most ~200 statements keep each `wrangler d1 execute` call small.
  for (let part = 0; part * 200 < statements.length; part++) {
    const name = `${String(++fileNo).padStart(4, '0')}_${table}${statements.length > 200 ? `_part${part + 1}` : ''}.sql`;
    writeFileSync(
      join(out, 'sql', name),
      `-- ${table}: rows ${part * 200 + 1}.. of ${converted}\nPRAGMA defer_foreign_keys = on;\n${statements.slice(part * 200, part * 200 + 200).join('\n')}\n`,
    );
    plan.sql.push(join('sql', name));
  }
}

// Menu photos and logos from the self-hosted UPLOADS_DIR -> R2 uploads/.
if (uploadsDir) {
  const name = /^[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$/i;
  report.uploads = { copied: 0, skipped: [] };
  mkdirSync(join(out, 'r2', 'uploads'), { recursive: true });
  for (const f of readdirSync(uploadsDir)) {
    if (!name.test(f)) {
      report.uploads.skipped.push(f);
      continue;
    }
    const file = join('r2', 'uploads', f);
    copyFileSync(join(uploadsDir, f), join(out, file));
    plan.r2.push({ key: `uploads/${f}`, file, contentType: contentTypes[extname(f).toLowerCase()] });
    report.uploads.copied++;
  }
}

writeFileSync(join(out, 'plan.json'), JSON.stringify(plan, null, 2));
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
const total = Object.values(report.rows).reduce((n, r) => n + r.converted, 0);
console.log(`${plan.sql.length} SQL file(s), ${plan.r2.length} R2 object(s), ${total} row(s) converted`);
console.log(`skipped tables: ${report.skippedTables.join(', ') || '-'}`);
console.log(`dropped columns: ${Object.keys(report.droppedColumns).join(', ') || '-'}`);
if (report.rowErrors.length) {
  console.error(`${report.rowErrors.length} row(s) could not be converted — see report.json`);
  if (!allowRowErrors) process.exit(2);
}
