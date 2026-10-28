#!/usr/bin/env node
// Converts physical Tailwind utilities to logical ones so layouts mirror
// under <html dir="rtl">. Idempotent; run on .tsx/.ts files:
//
//   node scripts/rtl/logical-classes.mjs apps/web/app apps/web/components
//
//   ml-/mr- -> ms-/me-      pl-/pr- -> ps-/pe-      left-/right- -> start-/end-
//   text-left/right -> text-start/end    border-l/r -> border-s/e
//   rounded-l/r/tl/tr/bl/br -> rounded-s/e/ss/se/es/ee
//   float-left/right -> float-start/end
//
// Deliberately NOT converted: `left-1/2` / `right-1/2` (used with
// -translate-x-1/2 to centre; translate is physical, so converting would
// break centring) and anything that is not a class token. Directional lucide
// icons (Chevron/Arrow Left/Right) get `rtl:-scale-x-100` so they point the
// reading direction; logos, QR codes and non-directional icons are untouched.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const B = String.raw`(?<=[\s"'\`{(:!])`; // start of a class token (after variants)
const E = String.raw`(?=[\s"'\`}),])`;

const rules = [
  [new RegExp(`${B}(-?)ml-(?!auto${E})`, 'g'), '$1ms-'],
  [new RegExp(`${B}(-?)mr-(?!auto${E})`, 'g'), '$1me-'],
  [new RegExp(`${B}ml-auto${E}`, 'g'), 'ms-auto'],
  [new RegExp(`${B}mr-auto${E}`, 'g'), 'me-auto'],
  [new RegExp(`${B}pl-`, 'g'), 'ps-'],
  [new RegExp(`${B}pr-`, 'g'), 'pe-'],
  [new RegExp(`${B}(-?)left-(?!1/2${E})`, 'g'), '$1start-'],
  [new RegExp(`${B}(-?)right-(?!1/2${E})`, 'g'), '$1end-'],
  [new RegExp(`${B}text-left${E}`, 'g'), 'text-start'],
  [new RegExp(`${B}text-right${E}`, 'g'), 'text-end'],
  [new RegExp(`${B}border-l(?=[-\\s"'\`}),])`, 'g'), 'border-s'],
  [new RegExp(`${B}border-r(?=[-\\s"'\`}),])`, 'g'), 'border-e'],
  [new RegExp(`${B}rounded-tl(?=[-\\s"'\`}),])`, 'g'), 'rounded-ss'],
  [new RegExp(`${B}rounded-tr(?=[-\\s"'\`}),])`, 'g'), 'rounded-se'],
  [new RegExp(`${B}rounded-bl(?=[-\\s"'\`}),])`, 'g'), 'rounded-es'],
  [new RegExp(`${B}rounded-br(?=[-\\s"'\`}),])`, 'g'), 'rounded-ee'],
  [new RegExp(`${B}rounded-l(?=[-\\s"'\`}),])`, 'g'), 'rounded-s'],
  [new RegExp(`${B}rounded-r(?=[-\\s"'\`}),])`, 'g'), 'rounded-e'],
  [new RegExp(`${B}float-left${E}`, 'g'), 'float-start'],
  [new RegExp(`${B}float-right${E}`, 'g'), 'float-end'],
];

// <ChevronRight className="h-4 w-4" /> -> add rtl:-scale-x-100 once.
const ICON = /<((?:Chevron(?:s)?(?:Left|Right)|Arrow(?:Left|Right)|ArrowUp(?:Left|Right)|ArrowDown(?:Left|Right)|ChevronLeftCircle|ChevronRightCircle|Undo2|Redo2|LogOut|LogIn)(?:Icon)?)\b([^>]*?)(\/?)>/g;

function mirrorIcons(src) {
  return src.replace(ICON, (all, name, attrs, slash) => {
    if (attrs.includes('rtl:-scale-x-100')) return all;
    if (/className="/.test(attrs)) {
      return `<${name}${attrs.replace(/className="/, 'className="rtl:-scale-x-100 ')}${slash}>`;
    }
    if (/className=\{/.test(attrs)) return all; // dynamic; leave for review
    return `<${name}${attrs.replace(/\s*$/, '')} className="rtl:-scale-x-100" ${slash}>`.replace(/\s+\/>$/, ' />');
  });
}

function walk(path, out = []) {
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const f of readdirSync(path)) {
      if (f === 'node_modules' || f.startsWith('.')) continue;
      walk(join(path, f), out);
    }
  } else if (/\.(tsx|ts)$/.test(path) && !/\.test\.ts$/.test(path)) out.push(path);
  return out;
}

let changed = 0;
for (const root of process.argv.slice(2)) {
  for (const file of walk(root)) {
    const before = readFileSync(file, 'utf8');
    let after = before;
    for (const [re, to] of rules) after = after.replace(re, to);
    after = mirrorIcons(after);
    if (after !== before) {
      writeFileSync(file, after);
      changed++;
    }
  }
}
console.log(`logical-classes: updated ${changed} file(s)`);
