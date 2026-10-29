#!/usr/bin/env node
// Fills a LOCAL demo database with realistic data for product screenshots,
// through the real API (so every number on screen is computed by the app):
// a richer bilingual menu, customers, paid orders spread over the last two
// weeks (backdated afterwards with SQL on the local D1 only), open dine-in
// tables and kitchen tickets in every state.
//
// Prerequisites: fresh local D1 (`pnpm db:migrate:local && pnpm db:seed:local`)
// and the API running on http://localhost:8787. Never point at production.
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.API_URL ?? 'http://127.0.0.1:8787';
if (!/localhost|127\.0\.0\.1/.test(API)) {
  console.error('demo-data only runs against a local API.');
  process.exit(1);
}
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BRANCH = 'demo-branch';
let cookie = '';

async function call(method, path, body, attempt = 0) {
  let res;
  try {
    res = await fetch(`${API}/api/v1${path}`, {
    method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // An idle keep-alive socket can be closed while the SQL step runs; retry once.
    if (attempt === 0) return call(method, path, body, 1);
    throw err;
  }
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
const q = `branchId=${BRANCH}`;
const sql = (command) =>
  execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', command], {
    cwd: join(ROOT, 'apps/api'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

await call('POST', '/auth/login', { email: 'owner@demo.local', password: 'Password123!' });
await call('PATCH', `/settings/restaurant?${q}`, { name: 'مطعم الواحة — Al Waha Bistro' }).catch(() => undefined);

// ---- menu --------------------------------------------------------------
const cats = await call('GET', `/menu/categories?${q}`);
const catId = (needle) => cats.find((c) => c.name.includes(needle))?.id;
const extraCats = [
  ['المشويات — Grills', 2],
  ['الحلويات — Desserts', 3],
];
for (const [name, sortOrder] of extraCats) {
  if (!cats.some((c) => c.name === name)) cats.push(await call('POST', `/menu/categories?${q}`, { name, sortOrder }));
}
const extraItems = [
  ['المشويات', 'شيش طاووق — Shish Tawook', 42, false],
  ['المشويات', 'كباب لحم — Lamb Kebab', 58, false],
  ['المشويات', 'مشاوي مشكلة — Mixed Grill', 89, false],
  ['الأطباق الرئيسية', 'مندي لحم — Lamb Mandi', 75, false],
  ['الأطباق الرئيسية', 'برياني دجاج — Chicken Biryani', 39, false],
  ['المقبلات', 'متبل — Moutabal', 17, true],
  ['المقبلات', 'فتوش — Fattoush', 19, true],
  ['الحلويات', 'كنافة — Kunafa', 26, true],
  ['الحلويات', 'أم علي — Om Ali', 22, true],
  ['المشروبات', 'عصير ليمون بالنعناع — Lemon Mint', 14, true],
  ['المشروبات', 'شاي كرك — Karak Tea', 8, true],
];
const existing = await call('GET', `/menu/items?${q}`);
for (const [cat, name, price, isVeg] of extraItems) {
  if (existing.some((i) => i.name === name)) continue;
  await call('POST', `/menu/items?${q}`, { categoryId: catId(cat), name, price, isVeg, isHalal: true });
}
const items = await call('GET', `/menu/items?${q}`);
const item = (needle) => items.find((i) => i.name.includes(needle));

// ---- customers -----------------------------------------------------------
const people = [
  ['عبدالله القحطاني', '+966501234501'],
  ['نورة العتيبي', '+966501234502'],
  ['Faisal Al-Harbi', '+966501234503'],
  ['Sara Khan', '+966501234504'],
];
const customers = [];
for (const [name, phone] of people) {
  customers.push(await call('POST', `/customers?${q}`, { name, phone }).catch(() => null));
}

// ---- paid history (takeaway orders, backdated below) -----------------------
const basket = [
  [['Kabsa', 2], ['Arabic Coffee', 2]],
  [['Sambousek', 1], ['Lemon Mint', 1]],
  [['Mixed Grill', 1], ['Hummus', 1], ['Water', 2]],
  [['Mandi', 1], ['Fattoush', 1], ['Karak', 2]],
  [['Biryani', 2], ['Kunafa', 1]],
  [['Shish Tawook', 2], ['Moutabal', 1]],
  [['Margherita', 1], ['Om Ali', 1]],
];
const pays = ['MADA', 'CASH', 'MADA', 'APPLE_PAY', 'CARD', 'STC_PAY', 'MADA'];
const paidIds = [];
for (let i = 0; i < 42; i++) {
  const lines = basket[i % basket.length].map(([n, qty]) => ({ menuItemId: item(n).id, quantity: qty }));
  const order = await call('POST', `/orders?${q}`, { type: i % 5 === 0 ? 'DINE_IN' : 'TAKEAWAY', ...(i % 5 === 0 ? { tableId: undefined } : {}), items: lines }).catch(async () =>
    call('POST', `/orders?${q}`, { type: 'TAKEAWAY', items: lines }),
  );
  const bill = await call('POST', `/orders/${order.id}/bill-preview?${q}`, {});
  await call('POST', `/orders/${order.id}/checkout?${q}`, {
    payments: [{ method: pays[i % pays.length], amount: Number(bill.totalDue ?? bill.totalAmount) }],
    requestId: `demo-${order.id}`,
    ...(i % 6 === 0 && customers[i % 4] ? { customerId: customers[i % 4].id } : {}),
  });
  paidIds.push(order.id);
}
// Spread them over the last 14 days at lunch/dinner hours (local D1 only).
paidIds.forEach((id, i) => {
  const day = 13 - (i % 14);
  const hour = [12, 13, 14, 19, 20, 21][i % 6];
  const ts = `strftime('%Y-%m-%dT%H:%M:%S.000+00:00', 'now', '-${day} days', 'start of day', '+${hour - 3} hours', '+${(i * 7) % 50} minutes')`;
  sql(`UPDATE orders SET createdAt = ${ts}, updatedAt = ${ts} WHERE id = '${id}'; UPDATE payments SET createdAt = ${ts} WHERE orderId = '${id}'; UPDATE kots SET createdAt = ${ts}, acceptedAt = ${ts}, readyAt = ${ts}, servedAt = ${ts} WHERE orderId = '${id}';`);
});

// ---- live service: occupied tables and kitchen tickets in every state -----
const floors = await call('GET', `/tables/floors?${q}`);
const tables = floors.flatMap((f) => f.tables);
const live = [
  [tables[0], [['Mixed Grill', 1], ['Hummus', 1], ['Lemon Mint', 2]], 'NEW'],
  [tables[2], [['Mandi', 2], ['Fattoush', 1]], 'ACCEPTED'],
  [tables[3], [['Kabsa', 1], ['Moutabal', 1], ['Karak', 2]], 'PREPARING'],
  [tables[5], [['Shish Tawook', 2], ['Kunafa', 2]], 'READY'],
  [null, [['Sambousek', 3], ['Water', 3]], 'PREPARING'],
  [null, [['Biryani', 1], ['Arabic Coffee', 1]], 'NEW'],
];
const flow = ['ACCEPTED', 'PREPARING', 'READY'];
for (const [table, lines, state] of live) {
  const order = await call('POST', `/orders?${q}`, {
    type: table ? 'DINE_IN' : 'TAKEAWAY',
    ...(table ? { tableId: table.id, guestCount: 2 + (lines.length % 3) } : { guestName: 'Faisal' }),
    items: lines.map(([n, qty]) => ({ menuItemId: item(n).id, quantity: qty })),
  });
  const tickets = await call('GET', `/kds/tickets?${q}`);
  const list = Array.isArray(tickets) ? tickets : (tickets.tickets ?? []);
  const kot = list.find((k) => (k.order?.id ?? k.orderId) === order.id);
  if (!kot) continue;
  for (const step of flow.slice(0, flow.indexOf(state) + 1)) {
    await call('PATCH', `/kds/tickets/${kot.id}/status?${q}`, { status: step });
  }
}
console.log(`demo data: ${items.length} menu items, ${paidIds.length} paid orders over 14 days, ${live.length} live orders`);
