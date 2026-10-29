#!/usr/bin/env node
// Generates every Ahemad's Restro logo and icon from code, so the brand can be
// regenerated or tweaked in one place:
//
//   pnpm --filter @ahemads-restro/asset-tools brand
//
// The mark: an emerald tile holding a serving cloche (hospitality) whose dome
// carries three rising bars (orders, data, software) under a gold knob.
// The wordmark is converted to vector paths with fontkit (IBM Plex Sans,
// OFL), so the SVGs render identically without any font installed.
//
// Outputs (apps/web/public/brand, app/ and public/ icon conventions):
//   brand/mark.svg              standalone icon (tile)
//   brand/mark-mono.svg         one-colour icon (cut-outs, no tile)
//   brand/logo.svg              primary logo, light backgrounds (with tagline)
//   brand/logo-dark.svg         primary logo, dark backgrounds
//   brand/logo-compact.svg      horizontal mark + name, no tagline
//   brand/logo-mono.svg         one-colour logo
//   brand/*.png                 high-resolution transparent PNGs of the above
//   brand/social-profile.png    1024x1024 profile image
//   app/icon.svg, app/favicon.ico, app/apple-icon.png (Next.js metadata files)
//   public/icons/*              192/512/maskable/16/32 PNGs for the manifest
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const WEB = join(ROOT, 'apps/web');
const BRAND_DIR = join(WEB, 'public/brand');
const ICONS_DIR = join(WEB, 'public/icons');
mkdirSync(BRAND_DIR, { recursive: true });
mkdirSync(ICONS_DIR, { recursive: true });

const C = {
  emerald: '#0B5D4A',
  emeraldLight: '#13775E',
  emeraldDark: '#083B2F',
  gold: '#C9A35A',
  goldLight: '#E2C487',
  charcoal: '#1F2328',
  white: '#FFFFFF',
  warm: '#FBF7EF',
  muted: '#6B7069',
  mint: '#7FD8B8',
};

const bold = fontkit.create(readFileSync(join(ROOT, 'apps/api/assets/fonts/IBMPlexSansArabic-Bold.ttf')));
const regular = fontkit.create(readFileSync(join(ROOT, 'apps/api/assets/fonts/IBMPlexSansArabic-Regular.ttf')));

/** Text -> one SVG path string at (x, baseline y), size in px. Returns {d, width}. */
function textPath(font, text, x, y, size, letterSpacing = 0) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const parts = [];
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    const path = glyph.path
      .scale(scale, -scale)
      .translate(cursor + pos.xOffset * scale, y - pos.yOffset * scale);
    parts.push(path.toSVG());
    cursor += pos.xAdvance * scale + letterSpacing;
  });
  return { d: parts.join(' '), width: cursor - x - letterSpacing };
}

// ---- the mark (drawn on a 512 grid) --------------------------------------
// Dome: a half-ellipse sitting on the plate line; bars are cut out of it.
const DOME = 'M118 330 C118 238 180 176 256 176 C332 176 394 238 394 330 Z';
const PLATE = '<rect x="92" y="344" width="328" height="30" rx="15"/>';
const KNOB_CX = 256;
const KNOB_CY = 150;
const BARS = [
  { x: 196, h: 46 },
  { x: 241, h: 74 },
  { x: 286, h: 102 },
];
const BAR_W = 30;
const BAR_BOTTOM = 306;
const barRects = BARS.map(
  (b) => `<rect x="${b.x}" y="${BAR_BOTTOM - b.h}" width="${BAR_W}" height="${b.h}" rx="8"/>`,
).join('');

function markInner({ dome, plate, knob, barsColor, id }) {
  // Dome with bars knocked out (mask), so it also works on any background.
  return `
  <defs>
    <mask id="${id}-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
      <rect width="512" height="512" fill="#fff"/>
      <g fill="#000">${barRects}</g>
    </mask>
  </defs>
  <path d="${DOME}" fill="${dome}" mask="url(#${id}-cut)"/>
  ${barsColor ? `<g fill="${barsColor}" opacity="0.0">${barRects}</g>` : ''}
  <g fill="${plate}">${PLATE}</g>
  <circle cx="${KNOB_CX}" cy="${KNOB_CY}" r="20" fill="${knob}"/>`;
}

function tile(id, size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img" aria-label="Ahemad's Restro">
  <title>Ahemad's Restro</title>
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.emeraldLight}"/>
      <stop offset="1" stop-color="${C.emeraldDark}"/>
    </linearGradient>
    <linearGradient id="${id}-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.goldLight}"/>
      <stop offset="1" stop-color="${C.gold}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${id}-bg)"/>
  <rect x="8" y="8" width="496" height="496" rx="110" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="4"/>
  ${markInner({ dome: C.warm, plate: C.warm, knob: `url(#${id}-gold)`, id })}
</svg>`;
}

// Small sizes (16/32 px): no inner stroke, slightly heavier shapes read better.
function tileSmall(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="104" fill="${C.emerald}"/>
  <path d="M104 334 C104 230 172 162 256 162 C340 162 408 230 408 334 Z" fill="${C.warm}"/>
  <rect x="80" y="350" width="352" height="40" rx="20" fill="${C.warm}"/>
  <circle cx="256" cy="132" r="28" fill="${C.gold}"/>
</svg>`;
}

function monoMark(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 120 352 266" width="352" height="266" role="img" aria-label="Ahemad's Restro">
  <title>Ahemad's Restro</title>
  ${markInner({ dome: color, plate: color, knob: color, id: 'mono' })}
</svg>`;
}

// ---- wordmark + logos ------------------------------------------------------
function logo({ variant, tagline }) {
  const dark = variant === 'dark';
  const mono = variant === 'mono';
  const nameColor = mono ? C.charcoal : dark ? C.white : C.charcoal;
  const accentColor = mono ? C.charcoal : dark ? C.goldLight : C.emerald;
  const tagColor = mono ? C.charcoal : dark ? 'rgba(255,255,255,0.62)' : C.muted;

  const markSize = 120;
  const gap = 30;
  const textX = markSize + gap;
  const nameSize = 64;
  const baseline = tagline ? 74 : 82;
  const first = textPath(bold, "Ahemad's", textX, baseline, nameSize, -0.6);
  const second = textPath(bold, 'Restro', textX + first.width + 16, baseline, nameSize, -0.6);
  const tag = tagline
    ? textPath(regular, 'RESTAURANT MANAGEMENT', textX + 2, baseline + 36, 19, 3.2)
    : null;
  const width = Math.ceil(textX + first.width + 16 + second.width + 6);
  const height = markSize;

  const markSvg = mono
    ? `<g transform="translate(0 ${(height - markSize) / 2}) scale(${markSize / 512})">
        <rect width="512" height="512" rx="116" fill="${C.charcoal}"/>
        ${markInner({ dome: C.white, plate: C.white, knob: C.white, id: 'lm' })}
      </g>`
    : `<g transform="scale(${markSize / 512})">${tile('lg')
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '')
        .replace(/<title>.*<\/title>/, '')}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Ahemad's Restro">
  <title>Ahemad's Restro</title>
  ${markSvg}
  <path d="${first.d}" fill="${nameColor}"/>
  <path d="${second.d}" fill="${accentColor}"/>
  ${tag ? `<path d="${tag.d}" fill="${tagColor}"/>` : ''}
</svg>`;
}

// ---- ICO (PNG-compressed entries, supported by every current browser) -----
function ico(pngs) {
  const header = Buffer.alloc(6 + pngs.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const png = (svg, width, height) =>
  sharp(Buffer.from(svg), { density: 384 })
    .resize(width, height ?? width, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

const out = {
  'mark.svg': tile('mk'),
  'mark-mono.svg': monoMark(C.charcoal),
  'mark-mono-white.svg': monoMark(C.white),
  'logo.svg': logo({ variant: 'light', tagline: true }),
  'logo-dark.svg': logo({ variant: 'dark', tagline: true }),
  'logo-compact.svg': logo({ variant: 'light', tagline: false }),
  'logo-compact-dark.svg': logo({ variant: 'dark', tagline: false }),
  'logo-mono.svg': logo({ variant: 'mono', tagline: true }),
};
for (const [name, svg] of Object.entries(out)) writeFileSync(join(BRAND_DIR, name), svg);

// High-resolution transparent PNGs.
const wide = async (name, width) => {
  const svg = out[name];
  const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  return png(svg, width, Math.round((width * Number(h)) / Number(w)));
};
writeFileSync(join(BRAND_DIR, 'mark-512.png'), await png(out['mark.svg'], 512));
writeFileSync(join(BRAND_DIR, 'mark-1024.png'), await png(out['mark.svg'], 1024));
writeFileSync(join(BRAND_DIR, 'mark-mono-512.png'), await png(out['mark-mono.svg'], 512, 387));
writeFileSync(join(BRAND_DIR, 'logo-2000.png'), await wide('logo.svg', 2000));
writeFileSync(join(BRAND_DIR, 'logo-dark-2000.png'), await wide('logo-dark.svg', 2000));
writeFileSync(join(BRAND_DIR, 'logo-compact-1200.png'), await wide('logo-compact.svg', 1200));
writeFileSync(join(BRAND_DIR, 'logo-mono-2000.png'), await wide('logo-mono.svg', 2000));

// Social profile picture: mark centred on emerald, safe inside a circle crop.
const profile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="${C.emeraldDark}"/>
  <g transform="translate(192 192) scale(1.25)">${tile('pf').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title>.*<\/title>/, '')}</g>
</svg>`;
writeFileSync(join(BRAND_DIR, 'social-profile.png'), await png(profile, 1024));

// App icons. Maskable: the platform crops to a circle/squircle, so keep the
// mark inside the central 80 % safe zone on a full-bleed emerald square.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${C.emerald}"/>
  <g transform="translate(76 76) scale(0.703)">${markInner({ dome: C.warm, plate: C.warm, knob: C.gold, id: 'mx' })}</g>
</svg>`;
const small = tileSmall('sm');
writeFileSync(join(ICONS_DIR, 'icon-192.png'), await png(out['mark.svg'], 192));
writeFileSync(join(ICONS_DIR, 'icon-512.png'), await png(out['mark.svg'], 512));
writeFileSync(join(ICONS_DIR, 'icon-512-maskable.png'), await png(maskable, 512));
writeFileSync(join(ICONS_DIR, 'favicon-16x16.png'), await png(small, 16));
writeFileSync(join(ICONS_DIR, 'favicon-32x32.png'), await png(small, 32));

// Next.js metadata conventions (app/): icon.svg, favicon.ico, apple-icon.png.
writeFileSync(join(WEB, 'app/icon.svg'), out['mark.svg']);
writeFileSync(
  join(WEB, 'app/favicon.ico'),
  ico([
    { size: 16, data: await png(small, 16) },
    { size: 32, data: await png(small, 32) },
    { size: 48, data: await png(small, 48) },
  ]),
);
// Apple touch icon: opaque, no rounded corners (iOS applies its own mask).
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${C.emerald}"/>
  <g transform="translate(46 46) scale(0.82)">${markInner({ dome: C.warm, plate: C.warm, knob: C.gold, id: 'ap' })}</g>
</svg>`;
writeFileSync(join(WEB, 'app/apple-icon.png'), await png(apple, 180));

console.log(`brand: wrote ${Object.keys(out).length} SVGs and PNG/ICO icon set`);
