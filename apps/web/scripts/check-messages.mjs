#!/usr/bin/env node
// Checks the translation files against each other and against the code:
//   1. every key used as t("ns.key") / translate("ns.key") exists in English
//   2. every English key exists in Arabic (the two complete languages)
//   3. no namespace file is invalid JSON
// Exits non-zero on any problem in 1–3. Spanish/French gaps are only counted
// (they fall back to English by design).
//
//   pnpm --filter @ahemads-restro/web i18n:check
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const load = (locale) => {
  const dir = join(root, "messages", locale);
  const flat = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const ns = file.replace(/\.json$/, "");
    const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
    for (const [k, v] of Object.entries(data)) flat[`${ns}.${k}`] = v;
  }
  return flat;
};

const en = load("en");
const ar = load("ar");
const problems = [];

for (const key of Object.keys(en)) {
  if (!(key in ar)) problems.push(`missing in ar: ${key}`);
}
for (const key of Object.keys(ar)) {
  if (!(key in en)) problems.push(`only in ar (no English source): ${key}`);
}

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    if (f === "node_modules" || f.startsWith(".")) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mts)$/.test(f) && !f.endsWith(".test.ts")) out.push(p);
  }
  return out;
};
const used = new Set();
const CALL = /\b(?:t|translate)\(\s*["'`]([a-zA-Z]+\.[A-Za-z0-9_.-]+)["'`]/g;
for (const dir of ["app", "components", "hooks", "lib"]) {
  for (const file of walk(join(root, dir))) {
    for (const m of readFileSync(file, "utf8").matchAll(CALL)) used.add(m[1]);
  }
}
for (const key of used) {
  if (!(key in en)) problems.push(`used in code but missing in en: ${key}`);
}

for (const extra of ["es", "fr"]) {
  const d = load(extra);
  const missing = Object.keys(en).filter((k) => !(k in d)).length;
  console.log(`${extra}: ${missing} of ${Object.keys(en).length} keys fall back to English`);
}
console.log(`en: ${Object.keys(en).length} keys, ar: ${Object.keys(ar).length} keys, ${used.size} used in code`);
if (problems.length) {
  console.error(problems.slice(0, 200).join("\n"));
  console.error(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log("messages OK");
