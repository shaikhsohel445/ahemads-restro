// Shared helpers for the PostgreSQL -> D1 migration scripts.
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(HERE, '../../..');
export const D1_MIGRATIONS = join(REPO, 'apps/api/migrations');

// Tables that exist only for the self-hosted build and are not migrated:
//   _prisma_migrations          Prisma's PostgreSQL migration ledger
//   sync_state, sync_changes    server-sync change log (feature not on Cloudflare)
export const SKIP_TABLES = new Set(['_prisma_migrations', 'sync_state', 'sync_changes']);

// Values that must never be copied into the new deployment.
export const SCRUB = {
  // S3 credentials of the old backup bucket: backups now go to R2 and need none.
  backup_config: { accessKeyId: '', secretAccessKey: '', endpoint: 'Cloudflare R2', bucket: 'BACKUPS (Worker binding)', region: 'auto' },
};

/**
 * The target schema, read from the D1 migrations themselves (applied to an
 * in-memory SQLite database), so the transform always matches what
 * `wrangler d1 migrations apply` creates.
 */
export function loadTargetSchema() {
  const db = new DatabaseSync(':memory:');
  for (const f of readdirSync(D1_MIGRATIONS).filter((n) => n.endsWith('.sql')).sort()) {
    db.exec(readFileSync(join(D1_MIGRATIONS, f), 'utf8'));
  }
  const tables = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .all()
    .map((r) => r.name);
  const schema = new Map();
  for (const t of tables) {
    const cols = db.prepare(`SELECT name, type, "notnull" AS nn, dflt_value AS dflt, pk FROM pragma_table_info(?)`).all(t);
    const fks = db.prepare(`SELECT "table" AS parent FROM pragma_foreign_key_list(?)`).all(t);
    schema.set(t, {
      columns: cols.map((c) => ({ name: c.name, type: String(c.type).toUpperCase(), notNull: !!c.nn, hasDefault: c.dflt !== null, pk: c.pk > 0 })),
      parents: [...new Set(fks.map((f) => f.parent).filter((p) => p !== t))],
    });
  }
  db.close();
  return schema;
}

/** Parents before children (FK order); a cycle is broken where it is found. */
export function dependencyOrder(schema) {
  const out = [];
  const done = new Set();
  const visiting = new Set();
  const visit = (t) => {
    if (done.has(t) || visiting.has(t)) return;
    visiting.add(t);
    for (const p of schema.get(t)?.parents ?? []) if (schema.has(p)) visit(p);
    visiting.delete(t);
    done.add(t);
    out.push(t);
  };
  [...schema.keys()].sort().forEach(visit);
  return out;
}

export function readJsonLines(file) {
  const text = readFileSync(file, 'utf8');
  return text ? text.split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
}

/** Columns whose sums are compared between source and target by validate.mjs. */
export const FINANCIAL_CHECKS = [
  ['orders', ['subtotal', 'taxAmount', 'discountAmount', 'tipAmount', 'totalAmount']],
  ['order_items', ['lineTotal', 'quantity']],
  ['payments', ['amount']],
  ['refunds', ['amount']],
  ['expenses', ['amount']],
  ['gift_cards', ['balance']],
  ['menu_items', ['price']],
];

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env[name.toUpperCase().replace(/-/g, '_')] ?? fallback;
}
