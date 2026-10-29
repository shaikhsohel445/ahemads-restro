#!/usr/bin/env node
// Converts the original PostgreSQL Prisma schema into the SQLite/D1 schema
// used by apps/api. Kept as a script (not a one-off hand edit) so the
// conversion rules are reviewable and re-runnable if the source schema moves.
//
//   node scripts/migration/convert-prisma-schema.mjs <pg-schema> <out-schema>
//
// Rules (each one is a PostgreSQL feature D1/SQLite does not have):
//   - datasource provider postgresql -> sqlite (connection comes from the
//     D1 driver adapter at runtime, not a URL)
//   - generator prisma-client-js -> prisma-client (Prisma 7, no Rust engine,
//     workerd runtime)
//   - native type attributes (@db.Decimal(12,2), @db.Date, @db.Timestamptz,
//     @db.Char) are dropped; SQLite has no such column types
//   - scalar lists (String[] / Int[]) become Json arrays
//   - dbgenerated(md5(random()...)) becomes cuid()
//   - BigInt autoincrement ids become Int (SQLite rowid alias)
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("usage: convert-prisma-schema.mjs <pg-schema> <out-schema>");
  process.exit(1);
}

let s = readFileSync(src, "utf8");
const report = [];
const count = (re) => (s.match(re) ?? []).length;

s = s.replace(
  /generator client \{[^}]*\}/,
  `generator client {
  provider               = "prisma-client"
  output                 = "../src/generated/prisma"
  runtime                = "workerd"
  moduleFormat           = "cjs"
  generatedFileExtension = "ts"
  importFileExtension    = ""
}`,
);
s = s.replace(
  /datasource db \{[^}]*\}/,
  `datasource db {
  provider = "sqlite"
}`,
);

report.push(`@db.* native types removed: ${count(/ @db\.[A-Za-z]+(\([^)]*\))?/g)}`);
s = s.replace(/ @db\.[A-Za-z]+(\([^)]*\))?/g, "");

report.push(`scalar lists -> Json: ${count(/\b(String|Int)\[\]/g)}`);
s = s.replace(/\b(String|Int)\[\](\s+)@default\(\[\]\)/g, 'Json$2@default("[]")');
s = s.replace(/\b(String|Int)\[\]/g, "Json");

report.push(`dbgenerated defaults -> cuid(): ${count(/@default\(dbgenerated\([^)]*\)+\)/g)}`);
s = s.replace(/@default\(dbgenerated\(".*?"\)\)/g, "@default(cuid())");

s = s.replace(/BigInt(\s+)@id(\s+)@default\(autoincrement\(\)\)/g, "Int$1@id$2@default(autoincrement())");

s = s.replace(
  /^\/\/ Nodedr OrderRestro — Phase 0\/1 core schema\.\n/,
  "// Ahemad's Restro — Cloudflare D1 (SQLite) schema.\n// GENERATED from the PostgreSQL schema by scripts/migration/convert-prisma-schema.mjs,\n// then maintained here. See docs/cloudflare/DATABASE.md.\n",
);

writeFileSync(out, s);
console.log(report.join("\n"));
