#!/usr/bin/env node
// Builds the marketing graphics from the brand files and the REAL product
// screenshots (run `brand` and `screenshots` first). Each graphic is an HTML
// layout rendered by the locally installed Chrome, so it can be edited like a
// web page. They are composites of genuine screenshots, not mock-ups.
//
//   pnpm --filter @ahemads-restro/asset-tools graphics
//
// Output: apps/web/public/images/product/marketing/
//   og-default.png / og-default-ar.png   1200x630  Open Graph + Twitter cards
//   github-social-preview.png             1280x640  GitHub repository preview
//   hero.png / hero-ar.png                1600x1000 hero graphic
//   product-overview.png                  1600x1000 the main screens together
//   feature-overview.png (+ -ar)          1600x1000 the implemented features
//   brand-sheet.png                       1600x1000 logo and icon preview sheet
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PUB = join(ROOT, 'apps/web/public');
const OUT = join(PUB, 'images/product/marketing');
const TMP = join(ROOT, 'scripts/assets/.tmp');
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const url = (p) => pathToFileURL(p).href;
const pub = (p) => url(join(PUB, p));
const shot = (name) => pub(`images/product/screens/${name}.png`);
const FONTS = join(ROOT, 'apps/api/assets/fonts');

const BASE_CSS = `
@font-face { font-family: Plex; src: url(${url(join(FONTS, 'IBMPlexSansArabic-Regular.ttf'))}); font-weight: 400; }
@font-face { font-family: Plex; src: url(${url(join(FONTS, 'IBMPlexSansArabic-Bold.ttf'))}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; }
/* Clip overhanging frames; in RTL they would otherwise scroll the page. */
.stage { position: fixed; inset: 0; overflow: hidden; }
body { font-family: Plex, sans-serif; color: #1F2328; background: #FBF7EF; overflow: hidden; -webkit-font-smoothing: antialiased; }
.bg { position: absolute; inset: 0; background:
  radial-gradient(1200px 600px at 85% -10%, rgba(201,163,90,.22), transparent 60%),
  radial-gradient(900px 700px at -10% 110%, rgba(11,93,74,.16), transparent 60%), #FBF7EF; }
.dark { color: #fff; }
.dark .bg { background:
  radial-gradient(1000px 600px at 90% -20%, rgba(201,163,90,.28), transparent 60%),
  radial-gradient(900px 700px at -10% 120%, rgba(127,216,184,.18), transparent 60%), #0A3D31; }
.frame { border-radius: 18px; overflow: hidden; background: #fff; border: 1px solid rgba(0,0,0,.08);
  box-shadow: 0 40px 90px -30px rgba(10,61,49,.55); }
.frame .bar { height: 26px; background: #F6F2EB; display: flex; gap: 7px; align-items: center; padding: 0 12px; direction: ltr; }
.frame .bar i { width: 10px; height: 10px; border-radius: 50%; display: block; }
.frame img { display: block; width: 100%; }
.phone { border-radius: 30px; overflow: hidden; border: 7px solid #1F2328; background: #1F2328; box-shadow: 0 40px 80px -25px rgba(0,0,0,.5); }
.phone img { display: block; width: 100%; border-radius: 22px; }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; font-size: 20px;
  background: rgba(11,93,74,.08); color: #0B5D4A; font-weight: 700; }
.dark .chip { background: rgba(255,255,255,.1); color: #E2C487; }
.gold { color: #C9A35A; }
`;

const frame = (src, style = '') =>
  `<div class="frame" style="${style}"><div class="bar"><i style="background:#E0705C"></i><i style="background:#E2B656"></i><i style="background:#5FB37C"></i></div><img src="${src}"></div>`;
const phone = (src, style = '') => `<div class="phone" style="${style}"><img src="${src}"></div>`;
const page = (body, { dir = 'ltr', lang = 'en', dark = false, css = '' } = {}) =>
  `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><style>${BASE_CSS}${css}</style></head><body class="${dark ? 'dark' : ''}"><div class="stage"><div class="bg"></div>${body}</div></body></html>`;

// Only features the application really implements (see README "Features").
const FEATURES = {
  en: [
    ['Point of sale', 'Dine-in, takeaway and delivery orders with modifiers, discounts and split payments'],
    ['Kitchen display', 'Live tickets by station: new, accepted, preparing, ready'],
    ['Tables & floors', 'Floor plans, live table status, order merging, QR table ordering'],
    ['Billing & receipts', 'Arabic and English receipts, VAT breakdown, ZATCA QR code'],
    ['Menu management', 'Categories, items, modifiers, half portions, availability'],
    ['Reports', 'Sales, items, payments, tax and staff reports with exports'],
    ['Multi-branch', 'Branches with their own tables, printers and tax settings'],
    ['Roles & permissions', 'Owner, administrator, accountant, cashier, waiter and kitchen roles'],
  ],
  ar: [
    ['نقطة البيع', 'طلبات محلية وسفري وتوصيل مع الإضافات والخصومات وتقسيم الدفع'],
    ['شاشة المطبخ', 'تذاكر مباشرة لكل محطة: جديدة، مقبولة، قيد التحضير، جاهزة'],
    ['الطاولات والصالات', 'مخططات الصالات وحالة الطاولات المباشرة ودمج الطلبات والطلب عبر QR'],
    ['الفواتير والإيصالات', 'إيصالات عربية وإنجليزية مع تفصيل الضريبة ورمز QR لهيئة الزكاة'],
    ['إدارة القائمة', 'الفئات والأصناف والإضافات ونصف الحصة والتوفر'],
    ['التقارير', 'تقارير المبيعات والأصناف والمدفوعات والضريبة والموظفين مع التصدير'],
    ['تعدد الفروع', 'فروع بطاولاتها وطابعاتها وإعدادات ضريبتها'],
    ['الأدوار والصلاحيات', 'المالك والمسؤول والمحاسب والكاشير والنادل والمطبخ'],
  ],
};

const COPY = {
  en: {
    name: "Ahemad's Restro",
    tagline: 'Restaurant management software',
    headline: 'Orders, tables, kitchen and billing — <span class="gold">in one system.</span>',
    chips: ['English & العربية', 'SAR · VAT · ZATCA QR', 'Runs in the browser'],
    by: 'Designed & developed by Wem Studios',
    features: 'Everything a restaurant runs on',
  },
  ar: {
    name: "Ahemad's Restro",
    tagline: 'برنامج إدارة المطاعم',
    headline: 'الطلبات والطاولات والمطبخ والفواتير <span class="gold">في نظام واحد.</span>',
    chips: ['العربية و English', 'ريال · ضريبة · QR الزكاة', 'يعمل من المتصفح'],
    by: 'تصميم وتطوير Wem Studios',
    features: 'كل ما يحتاجه مطعمك',
  },
};

function og(lang, { w = 1200, h = 630, dark = true } = {}) {
  const c = COPY[lang];
  const rtl = lang === 'ar';
  return page(
    `<div style="position:absolute;top:0;bottom:0;${rtl ? 'right' : 'left'}:0;width:58%;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between">
      <img src="${pub(dark ? 'brand/logo-compact-dark.svg' : 'brand/logo-compact.svg')}" style="height:62px;align-self:flex-start">
      <div>
        <div style="font-size:${rtl ? 50 : 52}px;font-weight:700;line-height:1.18;letter-spacing:${rtl ? 0 : -1}px">${c.headline}</div>
        <div style="margin-top:26px;display:flex;flex-wrap:wrap;gap:10px">${c.chips.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      </div>
      <div style="font-size:19px;opacity:.75">${c.by}</div>
    </div>
    <div style="position:absolute;top:70px;${rtl ? 'left:-160px' : 'right:-170px'};width:${Math.round(w * 0.62)}px;transform:perspective(1600px) rotateY(${rtl ? 14 : -14}deg) rotateX(4deg)">
      ${frame(shot(`dashboard-${lang}`))}
    </div>
    <div style="position:absolute;bottom:-90px;${rtl ? 'left:150px' : 'right:150px'};width:180px">${phone(shot(`mobile-pos-${lang}`))}</div>`,
    { dir: rtl ? 'rtl' : 'ltr', lang, dark },
  );
}

function hero(lang) {
  const rtl = lang === 'ar';
  return page(
    `<div style="position:absolute;top:80px;${rtl ? 'right' : 'left'}:90px;width:1250px">${frame(shot(`dashboard-${lang}`))}</div>
     <div style="position:absolute;bottom:60px;${rtl ? 'left' : 'right'}:90px;width:300px">${phone(shot(`mobile-pos-${lang}`))}</div>`,
    { dir: rtl ? 'rtl' : 'ltr', lang },
  );
}

function overview() {
  return page(
    `<div style="position:absolute;top:60px;left:60px;width:900px">${frame(shot('pos-en'))}</div>
     <div style="position:absolute;top:60px;right:60px;width:560px">${frame(shot('kds-en'))}</div>
     <div style="position:absolute;bottom:60px;right:60px;width:560px">${frame(shot('reports-en'))}</div>
     <div style="position:absolute;bottom:60px;left:60px;width:900px;height:330px;overflow:hidden;border-radius:18px">${frame(shot('tables-en'))}</div>`,
  );
}

function features(lang) {
  const c = COPY[lang];
  const rtl = lang === 'ar';
  const icon = (i) =>
    `<div style="width:54px;height:54px;border-radius:14px;background:#0B5D4A;color:#E2C487;display:grid;place-items:center;font-size:24px;font-weight:700">${i + 1}</div>`;
  return page(
    `<div style="position:absolute;inset:0;padding:70px 80px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:52px;font-weight:700">${c.features}</div>
        <img src="${pub('brand/logo-compact.svg')}" style="height:54px">
      </div>
      <div style="margin-top:50px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">
        ${FEATURES[lang]
          .map(
            ([t, d], i) => `<div style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:22px;padding:30px 28px;min-height:330px;box-shadow:0 20px 50px -30px rgba(10,61,49,.4)">
              ${icon(i)}
              <div style="margin-top:26px;font-size:28px;font-weight:700">${t}</div>
              <div style="margin-top:12px;font-size:21px;line-height:1.5;color:#5B605B">${d}</div>
            </div>`,
          )
          .join('')}
      </div>
    </div>`,
    { dir: rtl ? 'rtl' : 'ltr', lang },
  );
}

function social() {
  return page(
    `<div style="position:absolute;inset:0;padding:70px 80px;width:60%;display:flex;flex-direction:column;justify-content:center;gap:34px">
      <img src="${pub('brand/logo-dark.svg')}" style="width:520px">
      <div style="font-size:30px;line-height:1.4;opacity:.9">Open-source restaurant POS, kitchen display and billing for Cloudflare — English & Arabic, SAR, VAT and ZATCA QR receipts.</div>
      <div style="font-size:20px;opacity:.7">Designed &amp; developed by Wem Studios · AGPL-3.0</div>
    </div>
    <div style="position:absolute;top:90px;right:-200px;width:780px;transform:perspective(1600px) rotateY(-14deg)">${frame(shot('pos-en'))}</div>`,
    { dark: true },
  );
}

function brandSheet() {
  const tile = (bg, inner, label, fg = '#1F2328') =>
    `<div style="background:${bg};border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;border:1px solid rgba(0,0,0,.07)">${inner}<div style="font-size:16px;color:${fg};opacity:.7">${label}</div></div>`;
  const img = (p, s) => `<img src="${pub(p)}" style="${s}">`;
  return page(
    `<div style="position:absolute;inset:0;padding:50px;display:grid;grid-template-columns:1.4fr 1.4fr 1fr;grid-template-rows:1fr 1fr 0.8fr;gap:24px">
      ${tile('#fff', img('brand/logo.svg', 'width:440px'), 'logo.svg — light backgrounds')}
      ${tile('#0A3D31', img('brand/logo-dark.svg', 'width:440px'), 'logo-dark.svg — dark backgrounds', '#fff')}
      ${tile('#fff', img('brand/mark.svg', 'width:150px'), 'mark.svg — app icon')}
      ${tile('#FBF7EF', img('brand/logo-compact.svg', 'width:400px'), 'logo-compact.svg')}
      ${tile('#fff', img('brand/logo-mono.svg', 'width:440px'), 'logo-mono.svg — one colour')}
      ${tile('#C9A35A', img('brand/mark-mono-white.svg', 'width:130px'), 'mark-mono-white.svg', '#fff')}
      <div style="grid-column:1 / span 3;background:#fff;border-radius:22px;border:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:space-around;padding:0 40px">
        ${[16, 32, 48, 64, 96, 128, 180]
          .map((s) => `<div style="text-align:center">${img('brand/mark.svg', `width:${s}px;height:${s}px`)}<div style="font-size:15px;opacity:.6;margin-top:8px">${s}px</div></div>`)
          .join('')}
        <div style="display:flex;gap:14px">${['#0B5D4A', '#0A3D31', '#C9A35A', '#1F2328', '#FAF7F2']
          .map((c) => `<div style="text-align:center"><div style="width:62px;height:62px;border-radius:14px;background:${c};border:1px solid rgba(0,0,0,.1)"></div><div style="font-size:13px;opacity:.6;margin-top:6px">${c}</div></div>`)
          .join('')}</div>
      </div>
    </div>`,
  );
}

const JOBS = [
  ['og-default', og('en'), 1200, 630],
  ['og-default-ar', og('ar'), 1200, 630],
  ['github-social-preview', social(), 1280, 640],
  ['hero', hero('en'), 1600, 1000],
  ['hero-ar', hero('ar'), 1600, 1000],
  ['product-overview', overview(), 1600, 1000],
  ['feature-overview', features('en'), 1600, 1000],
  ['feature-overview-ar', features('ar'), 1600, 1000],
  ['brand-sheet', brandSheet(), 1600, 1000],
];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--allow-file-access-from-files'],
});
for (const [name, html, width, height] of JOBS) {
  const file = join(TMP, `${name}.html`);
  writeFileSync(file, html);
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url(file), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const buf = await p.screenshot();
  await sharp(buf).png({ compressionLevel: 9, palette: true, quality: 92 }).toFile(join(OUT, `${name}.png`));
  // Open Graph images must stay PNG/JPEG; the rest also get a WebP for the site.
  if (!name.startsWith('og-') && name !== 'github-social-preview') {
    await sharp(buf).webp({ quality: 84 }).toFile(join(OUT, `${name}.webp`));
  }
  console.log(`  ${name} ${width}x${height}`);
  await ctx.close();
}
await browser.close();
console.log(`Graphics written to ${OUT}`);
