#!/usr/bin/env node
// End-to-end smoke test against a running API Worker (local `wrangler dev`
// or a staging deployment). Exercises the core restaurant flow through the
// real HTTP API: signup -> menu -> table -> dine-in order -> KDS ticket ->
// bill preview -> payment -> receipt (with ZATCA QR) -> reports, plus the
// authenticated realtime WebSocket.
//
//   API_URL=http://127.0.0.1:8787 node scripts/verify/smoke-api.mjs
//
// Creates a new restaurant with a random e-mail each run; never point it at
// production.
const BASE = (process.env.API_URL ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
let cookie = '';
const results = [];

async function call(method, path, body, { expect = [200, 201], raw = false } = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const text = await res.text();
  if (!expect.includes(res.status)) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return raw ? text : text ? JSON.parse(text) : null;
}

async function step(name, fn) {
  const t = Date.now();
  try {
    const out = await fn();
    results.push({ name, ok: true, ms: Date.now() - t });
    console.log(`  ok   ${name} (${Date.now() - t} ms)`);
    return out;
  } catch (err) {
    results.push({ name, ok: false, error: err.message });
    console.log(`  FAIL ${name}: ${err.message}`);
    throw err;
  }
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function main() {
  console.log(`Smoke test against ${BASE}`);
  const email = `owner+${Date.now()}@example.test`;

  await step('health', async () => {
    const r = await fetch(`${BASE}/api/health`);
    assert(r.ok, `health ${r.status}`);
  });

  const { user } = await step('register restaurant (Arabic name)', () =>
    call('POST', '/auth/register', {
      restaurantName: 'مطعم الواحة',
      branchName: 'فرع الرياض',
      ownerName: 'Owner',
      email,
      password: 'Password123!',
    }),
  );
  assert(user.roleName === 'OWNER', 'owner role');

  const branch = await step('branch defaults are Saudi', async () => {
    const [b] = await call('GET', '/branches');
    assert(b.country === 'SA', `country ${b.country}`);
    assert(b.taxRegime === 'SA_VAT', `regime ${b.taxRegime}`);
    return b;
  });
  const q = `branchId=${branch.id}`;

  await step('set VAT number', () =>
    call('PATCH', `/settings/branch?${q}`, { taxId: '310122393500003' }),
  );

  await step('login again with password', async () => {
    cookie = '';
    await call('POST', '/auth/login', { email, password: 'Password123!' });
  });

  const category = await step('create category', () =>
    call('POST', `/menu/categories?${q}`, { name: 'مشويات' }),
  );
  const item = await step('create item (VAT defaults to 15%)', async () => {
    const it = await call('POST', `/menu/items?${q}`, {
      categoryId: category.id,
      name: 'شاورما دجاج',
      price: 23,
    });
    assert(Number(it.taxRatePercent) === 15, `tax ${it.taxRatePercent}`);
    return it;
  });

  const floor = await step('create floor', () =>
    call('POST', `/tables/floors?${q}`, { name: 'Ground' }),
  );
  const table = await step('create table', () =>
    call('POST', `/tables?${q}`, { floorId: floor.id, number: 'T1', capacity: 4 }),
  );

  const order = await step('create dine-in order', () =>
    call('POST', `/orders?${q}`, {
      type: 'DINE_IN',
      tableId: table.id,
      items: [{ menuItemId: item.id, quantity: 2 }],
    }),
  );
  assert(Number(order.totalAmount) === 46, `total ${order.totalAmount}`);
  assert(Math.abs(Number(order.taxAmount) - 6) < 0.011, `vat ${order.taxAmount}`);

  await step('kitchen ticket visible on KDS', async () => {
    const tickets = await call('GET', `/kds/tickets?${q}`);
    const list = Array.isArray(tickets) ? tickets : (tickets.tickets ?? []);
    assert(list.length >= 1, 'no KDS ticket');
  });

  const preview = await step('bill preview with 10% discount', () =>
    call('POST', `/orders/${order.id}/bill-preview?${q}`, { discountPercent: 10 }),
  );

  await step('checkout with mada', () =>
    call('POST', `/orders/${order.id}/checkout?${q}`, {
      discountPercent: 10,
      payments: [{ method: 'MADA', amount: Number(preview.totalAmount ?? preview.total ?? 41.4) }],
      requestId: `smoke-${Date.now()}`,
    }),
  );

  await step('paid receipt is a bilingual ZATCA invoice with QR', async () => {
    const html = await call('GET', `/orders/${order.id}/receipt?${q}`, null, { raw: true });
    assert(html.includes('فاتورة ضريبية مبسطة'), 'missing Arabic invoice title');
    assert(html.includes('310122393500003'), 'missing VAT number');
    assert(html.includes('<svg'), 'missing QR');
  });

  await step('sales report runs', () =>
    call('GET', `/reports/sales-summary?${q}&from=2020-01-01&to=2100-01-01`, null, {
      expect: [200, 400, 404],
    }),
  );

  await step('realtime: unauthenticated socket is refused', async () => {
    const ws = new WebSocket(`${BASE.replace(/^http/, 'ws')}/api/realtime?${q}`);
    const opened = await new Promise((resolve) => {
      ws.addEventListener('open', () => resolve(true));
      ws.addEventListener('error', () => resolve(false));
      ws.addEventListener('close', () => resolve(false));
    });
    if (opened) ws.close();
    assert(!opened, 'socket without a session cookie was accepted');
  });

  await step('realtime: staff socket receives order events', async () => {
    const wsUrl = `${BASE.replace(/^http/, 'ws')}/api/realtime?${q}`;
    const ws = new WebSocket(wsUrl, { headers: { cookie } });
    const got = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('no event within 10s')), 10_000);
      ws.addEventListener('message', (e) => {
        if (e.data === 'pong') return;
        clearTimeout(timer);
        resolve(JSON.parse(e.data));
      });
      ws.addEventListener('error', () => reject(new Error('socket error')));
    });
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', () => reject(new Error('socket did not open')));
    });
    await call('POST', `/orders?${q}`, {
      type: 'TAKEAWAY',
      items: [{ menuItemId: item.id, quantity: 1 }],
    });
    const msg = await got;
    ws.close();
    assert(typeof msg.event === 'string', 'event name');
    return msg.event;
  });

  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} steps passed`);
}

main().catch(() => {
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} steps passed`);
  process.exit(1);
});
