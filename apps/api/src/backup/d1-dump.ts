import type { D1Database } from '@cloudflare/workers-types';

// Logical backup of the whole D1 database as gzip'd NDJSON:
//
//   {"format":"orderrestro-d1/1","createdAt":"…","tables":["…", …]}
//   {"t":"orders","r":{"id":"…","total":"12.5", …}}
//   …
//
// Values are written exactly as D1 stores them (no Prisma conversion), so a
// restore round-trips byte-for-byte. BLOB columns are base64 ({"$b64":…}).
// This replaces `pg_dump --format=custom` (no child processes on Workers).

export const DUMP_FORMAT = 'orderrestro-d1/1';
const PAGE = 500;
// D1 allows at most 100 bound parameters per statement.
const MAX_PARAMS = 100;
const BATCH_STATEMENTS = 50;

type Row = Record<string, unknown>;

interface Column {
  name: string;
  type: string;
}

export async function listTables(db: D1Database): Promise<string[]> {
  const res = await db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table'
         AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_cf\\_%' ESCAPE '\\'
         AND name NOT LIKE 'd1\\_%' ESCAPE '\\'
       ORDER BY name`,
    )
    .all<{ name: string }>();
  return res.results.map((r) => r.name);
}

async function columns(db: D1Database, table: string): Promise<Column[]> {
  const res = await db
    .prepare(`SELECT name, type FROM pragma_table_info(?)`)
    .bind(table)
    .all<Column>();
  return res.results;
}

// Parents before children, from the schema's own foreign keys, so a restore
// can insert in this order and delete in the reverse one.
export async function tablesInDependencyOrder(
  db: D1Database,
  tables: string[],
): Promise<string[]> {
  const deps = new Map<string, Set<string>>();
  for (const t of tables) {
    const res = await db
      .prepare(`SELECT "table" AS parent FROM pragma_foreign_key_list(?)`)
      .bind(t)
      .all<{ parent: string }>();
    deps.set(
      t,
      new Set(res.results.map((r) => r.parent).filter((p) => p !== t)),
    );
  }
  const ordered: string[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (t: string) => {
    if (done.has(t) || visiting.has(t)) return; // a cycle is broken here
    visiting.add(t);
    for (const p of deps.get(t) ?? []) if (deps.has(p)) visit(p);
    visiting.delete(t);
    done.add(t);
    ordered.push(t);
  };
  tables.forEach(visit);
  return ordered;
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function encodeValue(v: unknown): unknown {
  if (v instanceof ArrayBuffer) return { $b64: toBase64(new Uint8Array(v)) };
  if (ArrayBuffer.isView(v))
    return {
      $b64: toBase64(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
    };
  return v;
}

function decodeValue(v: unknown, blob: boolean): unknown {
  if (blob && v && typeof v === 'object' && '$b64' in v)
    return fromBase64(String((v as { $b64: string }).$b64));
  return v;
}

/** Streams the dump as NDJSON text lines (no compression). */
export async function* dumpLines(db: D1Database): AsyncGenerator<string> {
  const tables = await listTables(db);
  yield JSON.stringify({
    format: DUMP_FORMAT,
    createdAt: new Date().toISOString(),
    tables,
  }) + '\n';
  for (const table of tables) {
    const cols = await columns(db, table);
    const blobCols = cols
      .filter((c) => /BLOB/i.test(c.type))
      .map((c) => c.name);
    let lastRowid = -Infinity;
    for (;;) {
      const page = await db
        .prepare(
          `SELECT rowid AS __rowid, * FROM "${table}" WHERE rowid > ? ORDER BY rowid LIMIT ${PAGE}`,
        )
        .bind(lastRowid === -Infinity ? -9007199254740991 : lastRowid)
        .all<Row>();
      for (const raw of page.results) {
        lastRowid = Number(raw.__rowid);
        const { __rowid: _drop, ...row } = raw;
        for (const c of blobCols) {
          if (row[c] != null) {
            const v = row[c];
            row[c] = encodeValue(
              Array.isArray(v) ? new Uint8Array(v as number[]) : v,
            );
          }
        }
        yield JSON.stringify({ t: table, r: row }) + '\n';
      }
      if (page.results.length < PAGE) break;
    }
  }
}

/** gzip'd dump as one buffer, for storing in R2 and hashing. */
export async function dumpGzip(db: D1Database): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const lines = dumpLines(db);
  const source = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const next = await lines.next();
      if (next.done) controller.close();
      else controller.enqueue(encoder.encode(next.value));
    },
  });
  const gz = source.pipeThrough(
    new CompressionStream('gzip') as unknown as TransformStream<
      Uint8Array,
      Uint8Array
    >,
  );
  return new Uint8Array(await new Response(gz as never).arrayBuffer());
}

export async function gunzipText(
  data: ArrayBuffer | Uint8Array,
): Promise<string> {
  const stream = new Response(data as never).body!.pipeThrough(
    new DecompressionStream('gzip'),
  );
  return new Response(stream as never).text();
}

/**
 * Replaces every table's contents with the dump's. Deletes children-first
 * and inserts parents-first, in D1 batches (each batch is atomic; the whole
 * restore is not — see docs/cloudflare/OPERATIONS.md for taking a D1 Time
 * Travel reference point first).
 */
export async function restoreDump(db: D1Database, ndjson: string) {
  const lines = ndjson.split('\n').filter(Boolean);
  const header = JSON.parse(lines[0] ?? '{}') as {
    format?: string;
    tables?: string[];
  };
  if (header.format !== DUMP_FORMAT)
    throw new Error(`Not an OrderRestro D1 backup (format ${header.format})`);

  const live = await listTables(db);
  const order = await tablesInDependencyOrder(db, live);
  const rowsByTable = new Map<string, Row[]>();
  for (const line of lines.slice(1)) {
    const { t, r } = JSON.parse(line) as { t: string; r: Row };
    if (!live.includes(t)) continue; // table dropped since the backup
    rowsByTable.set(t, [...(rowsByTable.get(t) ?? []), r]);
  }

  await db.batch([
    db.prepare('PRAGMA defer_foreign_keys = ON'),
    ...[...order].reverse().map((t) => db.prepare(`DELETE FROM "${t}"`)),
  ]);

  let pending: ReturnType<D1Database['prepare']>[] = [];
  const flush = async () => {
    if (!pending.length) return;
    await db.batch([db.prepare('PRAGMA defer_foreign_keys = ON'), ...pending]);
    pending = [];
  };
  let restored = 0;
  for (const table of order) {
    const rows = rowsByTable.get(table) ?? [];
    if (!rows.length) continue;
    const cols = await columns(db, table);
    const names = cols.map((c) => c.name);
    const blob = new Set(
      cols.filter((c) => /BLOB/i.test(c.type)).map((c) => c.name),
    );
    const perStmt = Math.max(1, Math.floor(MAX_PARAMS / names.length));
    for (let i = 0; i < rows.length; i += perStmt) {
      const chunk = rows.slice(i, i + perStmt);
      const placeholders = chunk
        .map(() => `(${names.map(() => '?').join(', ')})`)
        .join(', ');
      const values = chunk.flatMap((r) =>
        names.map((n) => decodeValue(r[n] ?? null, blob.has(n))),
      );
      pending.push(
        db
          .prepare(
            `INSERT INTO "${table}" (${names.map((n) => `"${n}"`).join(', ')}) VALUES ${placeholders}`,
          )
          .bind(...values),
      );
      if (pending.length >= BATCH_STATEMENTS) await flush();
    }
    restored += rows.length;
  }
  await flush();
  return { tables: order.length, rows: restored };
}
