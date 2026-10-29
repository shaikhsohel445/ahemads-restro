#!/usr/bin/env node
// Captures REAL screenshots of the running application for the website,
// README and sales material — no mock-ups. Uses the locally installed
// Google Chrome through playwright-core (no browser download).
//
//   1. fresh local DB + demo data:  see docs/marketing/ASSETS.md
//   2. API on :8787 and web Worker on :1995 (pnpm --filter @ahemads-restro/web preview)
//   3. pnpm --filter @ahemads-restro/asset-tools screenshots
//
// Output: apps/web/public/images/product/screens/<name>-<lang>.{png,webp}
// PNG for GitHub/README, WebP (smaller) for the website. Sign-in uses the
// local demo account from the seed; nothing secret is captured.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'apps/web/public/images/product/screens');
const WEB = process.env.WEB_URL ?? 'http://127.0.0.1:1995';
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });

// demo-data.mjs may have run hours ago: move the live (unpaid) orders, their
// kitchen tickets and the occupied tables to "a few minutes ago" so timers
// read like a real service. LOCAL D1 only; set FRESHEN=0 to skip.
if (process.env.FRESHEN !== '0') {
  const ago = (expr) => `strftime('%Y-%m-%dT%H:%M:%S.000+00:00', 'now', ${expr})`;
  const minutes = `'-' || (6 + abs(random()) % 12) || ' minutes'`;
  const sql = [
    `UPDATE orders SET createdAt = ${ago(minutes)} WHERE status IN ('OPEN', 'BILLED')`,
    `UPDATE orders SET updatedAt = createdAt WHERE status IN ('OPEN', 'BILLED')`,
    `UPDATE kots SET createdAt = (SELECT o.createdAt FROM orders o WHERE o.id = kots.orderId) WHERE status NOT IN ('SERVED', 'CANCELLED')`,
    `UPDATE kots SET acceptedAt = ${ago(`'-4 minutes'`)} WHERE acceptedAt IS NOT NULL AND status NOT IN ('SERVED', 'CANCELLED')`,
    `UPDATE kots SET readyAt = ${ago(`'-1 minutes'`)} WHERE readyAt IS NOT NULL AND status NOT IN ('SERVED', 'CANCELLED')`,
    `UPDATE tables SET statusSince = ${ago(minutes)} WHERE status = 'OCCUPIED'`,
  ].join('; ');
  execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--command', sql], {
    cwd: join(ROOT, 'apps/api'),
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// Sign in ONCE and reuse the session cookie for every capture (the sign-in
// endpoint is rate-limited to a few attempts per minute, by design).
let storageState = null;
async function signIn() {
  const ctx = await browser.newContext();
  const res = await ctx.request.post(`${WEB}/api/v1/auth/login`, {
    data: { email: 'owner@demo.local', password: 'Password123!' },
  });
  if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  storageState = await ctx.storageState();
  await ctx.close();
}

async function context(lang, viewport, deviceScaleFactor = 2) {
  if (!storageState) await signIn();
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'light',
    locale: lang === 'ar' ? 'ar-SA' : 'en-US',
    timezoneId: 'Asia/Riyadh',
    storageState,
  });
  await ctx.addInitScript((l) => {
    localStorage.setItem('nodedr-locale', l);
    localStorage.setItem('nodedr-sidebar-collapsed', '0');
  }, lang);
  return ctx;
}

async function save(page, name, { fullPage = false, width = 1600, element } = {}) {
  await page.waitForTimeout(1200);
  const buf = element
    ? await page.locator(element).screenshot({ animations: 'disabled' })
    : await page.screenshot({ fullPage, animations: 'disabled' });
  const img = sharp(buf).resize({ width, withoutEnlargement: true });
  await img.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(OUT, `${name}.png`));
  await img.clone().webp({ quality: 82 }).toFile(join(OUT, `${name}.webp`));
  console.log(`  ${name}`);
}

async function go(page, path, waitFor) {
  // Not 'networkidle': realtime pages keep a WebSocket open.
  await page.goto(`${WEB}${path}`, { waitUntil: 'load' });
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 15000 }).catch(() => undefined);
  // Wait for the restaurant name in the sidebar and for loading skeletons to
  // clear, so no capture shows a half-loaded page.
  await page.waitForSelector('text=/Al Waha|الواحة/', { state: 'attached', timeout: 15000 }).catch(() => undefined);
  await page
    .waitForFunction(() => !document.querySelector('.animate-pulse, [data-slot="skeleton"]'), null, { timeout: 15000 })
    .catch(() => undefined);
  await page.waitForTimeout(2000);
}

for (const lang of ['en', 'ar']) {
  console.log(`Desktop (${lang})`);
  const ctx = await context(lang, DESKTOP);
  const page = await ctx.newPage();

  await go(page, '/dashboard', 'text=/SAR|ر\\.س/');
  await page.waitForTimeout(1500); // chart animation
  await save(page, `dashboard-${lang}`);

  await go(page, '/orders');
  await page.getByRole('radio').nth(1).click().catch(() => undefined); // "in progress" tab
  await save(page, `orders-${lang}`);

  await go(page, '/kds');
  await save(page, `kds-${lang}`);

  await go(page, '/tables');
  await page.waitForTimeout(800);
  await save(page, `tables-${lang}`);

  await go(page, '/menu');
  await save(page, `menu-${lang}`);

  await go(page, '/reports');
  await save(page, `reports-${lang}`);

  // POS: pick a free table, add a few dishes.
  await go(page, '/pos');
  const free = page.getByRole('button', { name: /Table 2|Table 7|طاولة 2|طاولة 7/ }).first();
  await free.click().catch(() => undefined);
  await page.waitForTimeout(800);
  for (const dish of ['Kabsa', 'Hummus', 'Arabic Coffee', 'Arabic Coffee']) {
    await page.getByText(dish).first().click().catch(() => undefined);
    await page.waitForTimeout(250);
  }
  await save(page, `pos-${lang}`);

  // Billing: open the checkout of an occupied dine-in table's order.
  await go(page, '/orders');
  await page.getByRole('radio').nth(1).click().catch(() => undefined);
  await page.waitForTimeout(600);
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.count()) {
    await firstRow.click();
    await page.waitForTimeout(1000);
    await save(page, `order-detail-${lang}`);
  }
  await ctx.close();

  // Receipt: the printed bill of a paid order (ZATCA simplified invoice).
  const rctx = await context(lang, { width: 420, height: 1100 }, 3);
  const api = rctx.request;
  const list = await (await api.get(`${WEB}/api/v1/orders/manage?branchId=demo-branch&tab=history`)).json();
  const paid = (Array.isArray(list) ? list : []).find((o) => o.status === 'PAID');
  if (paid) {
    const rp = await rctx.newPage();
    await rp.goto(`${WEB}/api/v1/orders/${paid.id}/receipt?branchId=demo-branch&lang=${lang}`, { waitUntil: 'load' });
    await save(rp, `receipt-${lang}`, { element: 'body', width: 900 });
  }
  await rctx.close();

  console.log(`Mobile (${lang})`);
  const mctx = await context(lang, MOBILE, 3);
  const m = await mctx.newPage();
  await go(m, '/dashboard', 'text=/SAR|ر\\.س/');
  await m.waitForTimeout(1200);
  await save(m, `mobile-dashboard-${lang}`, { width: 780 });
  await go(m, '/pos');
  await m.getByRole('button', { name: /Table 2|طاولة 2/ }).first().click().catch(() => undefined);
  await m.waitForTimeout(600);
  for (const dish of ['Kabsa', 'Arabic Coffee']) {
    await m.getByText(dish).first().click().catch(() => undefined);
    await m.waitForTimeout(250);
  }
  await save(m, `mobile-pos-${lang}`, { width: 780 });
  await go(m, '/kds');
  await save(m, `mobile-kds-${lang}`, { width: 780 });
  await mctx.close();
}

await browser.close();
console.log(`Screenshots written to ${OUT}`);
