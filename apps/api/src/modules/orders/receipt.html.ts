// Self-printing HTML receipt — ported from nodedr-pos's
// backend/src/lib/receipt.js (same 80mm-thermal-safe layout rules: @page
// margin 0, left-aligned body, box-sizing border-box so 80mm stays 80mm
// after padding). Loaded into a hidden iframe by the frontend
// (lib/print.ts), which calls window.print() itself; the inline script here
// is only a fallback for engines that block that cross-frame call.
//
// Multi-region tax (2026-09-27): which tax rows get shown, and whether the
// top line reads as a tax-inclusive subtotal or a pre-tax one, now follows
// the branch's taxRegime/taxMode — see resolveTaxLabel/resolveTaxIdLabel
// in @ahemads-restro/types. This file only changes labels and which
// rows are shown; order.subtotal/taxAmount/totalAmount are unchanged
// (computed once, correctly, in pricing.ts — see its own multi-region
// note) and are never recomputed here.

import { qrSvg } from '../verifactu/verifactu.qr';
import type { ReceiptVerifactu } from './escpos-receipt';
import {
  formatDateTime,
  formatMoney,
  resolveTaxIdLabel,
  resolveTaxLabel,
  TAX_REGIME_PRESETS,
  zatcaQrBase64,
  type TaxMode,
  type TaxRegime,
} from '@ahemads-restro/types';

// Saudi Arabia (2026, Cloudflare edition): a SA_VAT branch prints a ZATCA
// *simplified tax invoice* — English and Arabic labels side by side, the
// seller's VAT number, and the Phase 1 TLV QR code (zatcaQrBase64). Every
// other regime prints exactly as before, in the requested UI language.
type Lang = 'en' | 'ar';
const LABELS: Record<string, Record<Lang, string>> = {
  item: { en: 'Item', ar: 'الصنف' },
  qty: { en: 'Qty', ar: 'الكمية' },
  rate: { en: 'Rate', ar: 'السعر' },
  amount: { en: 'Amount', ar: 'المبلغ' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  discount: { en: 'Discount', ar: 'الخصم' },
  incl: { en: 'incl.', ar: 'شامل' },
  loyalty: { en: 'Loyalty', ar: 'نقاط الولاء' },
  pts: { en: 'pts', ar: 'نقطة' },
  tip: { en: 'Tip', ar: 'إكرامية' },
  paid: { en: 'Paid', ar: 'مدفوع' },
  received: { en: 'Received', ar: 'المستلم' },
  change: { en: 'Change', ar: 'الباقي' },
  amountPaid: { en: 'Amount paid', ar: 'المبلغ المدفوع' },
  balanceDue: { en: 'Balance due', ar: 'المبلغ المتبقي' },
  totalDue: { en: 'TOTAL DUE', ar: 'الإجمالي المستحق' },
  grandTotal: { en: 'GRAND TOTAL', ar: 'الإجمالي' },
  totalInclVat: { en: 'TOTAL (incl. VAT)', ar: 'الإجمالي شامل الضريبة' },
  order: { en: 'Order', ar: 'الطلب' },
  table: { en: 'Table', ar: 'الطاولة' },
  guest: { en: 'Guest', ar: 'العميل' },
  phone: { en: 'Ph', ar: 'هاتف' },
  provisional: {
    en: 'Bill only — not a receipt. Payment pending.',
    ar: 'فاتورة مبدئية — ليست إيصالاً. الدفع معلّق.',
  },
  thanks: { en: 'Thank you! Visit again.', ar: 'شكراً لزيارتكم!' },
  simplifiedInvoice: {
    en: 'Simplified Tax Invoice',
    ar: 'فاتورة ضريبية مبسطة',
  },
  vatNo: { en: 'VAT No.', ar: 'الرقم الضريبي' },
  noVatNo: {
    en: 'VAT number not set — add it in Settings to print a valid tax invoice.',
    ar: 'لم يُضبط الرقم الضريبي.',
  },
  CASH: { en: 'Cash', ar: 'نقداً' },
  CARD: { en: 'Card', ar: 'بطاقة' },
  MADA: { en: 'mada', ar: 'مدى' },
  STC_PAY: { en: 'STC Pay', ar: 'STC Pay' },
  APPLE_PAY: { en: 'Apple Pay', ar: 'Apple Pay' },
  GIFT_CARD: { en: 'Gift card', ar: 'بطاقة هدية' },
  STORE_CREDIT: { en: 'Store credit', ar: 'رصيد المتجر' },
  BANK_TRANSFER: { en: 'Bank transfer', ar: 'تحويل بنكي' },
  WALLET: { en: 'Wallet', ar: 'محفظة' },
  OTHER: { en: 'Other', ar: 'أخرى' },
};

function esc(value: string | number | null | undefined): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}

interface ReceiptOrder {
  /** Spain VERI*FACTU invoice QR, printed on a paid receipt. */
  verifactu?: ReceiptVerifactu | null;
  orderNumber: string;
  type: string;
  createdAt: Date;
  table: { label: string } | null;
  customer: { name: string; phone: string | null } | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  tipAmount: number;
  loyaltyPointsRedeemed: number;
  loyaltyDiscountAmount: number;
  totalAmount: number;
  /** Discount as a percentage of the subtotal, printed next to the amount. */
  discountPercent?: number;
  /** A bill handed over before payment: no "paid in full" wording. */
  isProvisional?: boolean;
  /** Applied so far / still owed; printed when set. */
  amountPaid?: number;
  balanceDue?: number;
  items: {
    nameSnapshot: string;
    quantity: number;
    unitPriceSnapshot: number;
    lineTotal: number;
    taxRateSnapshot: number;
    modifiers: { nameSnapshot: string; priceAdjSnapshot: number }[];
  }[];
  payments: {
    method: string;
    amount: number;
    tendered?: number | null;
    changeGiven?: number | null;
  }[];
}

export function buildReceiptHtml({
  restaurantName,
  branch,
  currency,
  order,
  timezone,
  language = 'en',
}: {
  restaurantName: string;
  /** Restaurant time zone; the Worker itself runs in UTC. */
  timezone?: string;
  /** UI language of the staff member printing (ignored for ZATCA invoices, which are bilingual). */
  language?: string;
  branch: {
    name: string;
    address: string | null;
    phone: string | null;
    gstNumber: string | null;
    taxRegime: TaxRegime;
    taxMode: TaxMode;
    taxLabel: string | null;
    taxId: string | null;
  };
  currency: string;
  order: ReceiptOrder;
}): string {
  const zatca = TAX_REGIME_PRESETS[branch.taxRegime].zatcaSimplifiedInvoice;
  const lang: Lang = language === 'ar' && !zatca ? 'ar' : 'en';
  // A ZATCA invoice is bilingual: "Subtotal / المجموع الفرعي".
  const L = (key: string) => {
    const entry = LABELS[key];
    if (!entry) return key;
    return zatca && entry.en !== entry.ar
      ? `${entry.en} / ${entry.ar}`
      : entry[lang];
  };
  // Latin digits in both languages, as Saudi receipts print them.
  const money = (n: number) => formatMoney(n, currency, 'en');
  const dateStr = formatDateTime(order.createdAt, timezone, lang);
  const taxLabel = zatca
    ? `${resolveTaxLabel(branch.taxRegime, branch.taxLabel)} / ضريبة القيمة المضافة`
    : resolveTaxLabel(branch.taxRegime, branch.taxLabel);
  // gstNumber is the pre-multi-region field every India install already
  // has populated; taxId is the new generic one. India falls back to the
  // old field so nothing already printed on file goes blank.
  const taxIdValue =
    branch.taxId ||
    (branch.taxRegime === 'INDIA_GST' ? branch.gstNumber : null);
  const taxIdLabel = zatca ? L('vatNo') : resolveTaxIdLabel(branch.taxRegime);
  const zatcaQr =
    zatca && taxIdValue && !order.isProvisional
      ? zatcaQrBase64({
          sellerName: restaurantName,
          vatNumber: taxIdValue,
          timestamp: order.createdAt,
          total: order.totalAmount,
          vatTotal: order.taxAmount,
        })
      : null;

  const itemRows = order.items
    .map((item) => {
      const modifierLines = item.modifiers
        .map((m) => `<div class="sub">+ ${esc(m.nameSnapshot)}</div>`)
        .join('');
      return `
        <tr>
          <td>${esc(item.nameSnapshot)}${modifierLines}${
            Number(item.taxRateSnapshot) > 0
              ? `<div class="sub">${esc(zatca ? 'VAT' : taxLabel)} @ ${item.taxRateSnapshot}%</div>`
              : ''
          }</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${money(item.unitPriceSnapshot)}</td>
          <td class="num">${money(item.lineTotal)}</td>
        </tr>`;
    })
    .join('');

  const totalRows: [string, string][] = [];
  if (branch.taxMode === 'EXCLUSIVE') {
    // US-style: show the pre-tax subtotal, then add tax as its own line —
    // order.subtotal/taxAmount are unchanged, this only reslices the
    // display (see pricing.ts: the stored subtotal already has tax baked
    // in, exactly like every other regime, so the pre-tax figure the
    // customer expects to see is subtotal - taxAmount).
    totalRows.push([L('subtotal'), money(order.subtotal - order.taxAmount)]);
    if (order.discountAmount > 0) {
      totalRows.push([
        order.discountPercent && order.discountPercent > 0
          ? `${L('discount')} (${Number(order.discountPercent)}%)`
          : L('discount'),
        `- ${money(order.discountAmount)}`,
      ]);
    }
    if (order.taxAmount > 0) {
      totalRows.push([taxLabel, money(order.taxAmount)]);
    }
  } else {
    totalRows.push([L('subtotal'), money(order.subtotal)]);
    if (order.discountAmount > 0) {
      totalRows.push([
        order.discountPercent && order.discountPercent > 0
          ? `${L('discount')} (${Number(order.discountPercent)}%)`
          : L('discount'),
        `- ${money(order.discountAmount)}`,
      ]);
    }
    if (order.taxAmount > 0) {
      // Prices are tax-inclusive (see ARCHITECTURE.md) — this is a breakup
      // of tax already inside the total above, not an additional charge.
      if (TAX_REGIME_PRESETS[branch.taxRegime].splitCgstSgst) {
        const half =
          Math.round((order.taxAmount / 2 + Number.EPSILON) * 100) / 100;
        totalRows.push(['CGST (incl.)', money(half)]);
        totalRows.push(['SGST (incl.)', money(order.taxAmount - half)]);
      } else {
        totalRows.push([`${taxLabel} (${L('incl')})`, money(order.taxAmount)]);
      }
    }
  }
  if (order.loyaltyDiscountAmount > 0) {
    totalRows.push([
      `${L('loyalty')} (${order.loyaltyPointsRedeemed} ${LABELS.pts[lang]})`,
      `- ${money(order.loyaltyDiscountAmount)}`,
    ]);
  }
  if (order.tipAmount > 0) {
    totalRows.push([L('tip'), money(order.tipAmount)]);
  }

  const paymentRows = order.payments.flatMap((p) => {
    const rows = [
      `<tr><td>${esc(L('paid'))} (${esc(LABELS[p.method]?.[zatca ? 'en' : lang] ?? p.method)})</td><td class="num">${money(p.amount)}</td></tr>`,
    ];
    if (p.tendered != null && p.changeGiven != null && p.changeGiven > 0) {
      rows.push(
        `<tr><td class="sub">&nbsp;&nbsp;${esc(L('received'))}</td><td class="num sub">${money(p.tendered)}</td></tr>`,
        `<tr><td class="sub">&nbsp;&nbsp;${esc(L('change'))}</td><td class="num sub">${money(p.changeGiven)}</td></tr>`,
      );
    }
    return rows;
  });
  const settlementRows =
    order.amountPaid !== undefined && order.balanceDue !== undefined
      ? `<hr class="rule"><table class="totals">
          <tr><td>${esc(L('amountPaid'))}</td><td class="num">${money(order.amountPaid)}</td></tr>
          <tr class="grand"><td>${esc(L('balanceDue'))}</td><td class="num">${money(order.balanceDue)}</td></tr>
        </table>`
      : '';

  return `<!doctype html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<title>${esc(order.orderNumber)}</title>
<style>
  * { box-sizing: border-box; }
  html { margin: 0; }
  body { font-family: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', -apple-system, Segoe UI, Roboto, Tahoma, Arial, sans-serif; margin: 0; padding: 4mm; color: #111; width: 80mm; }
  p { margin: 0 0 3px; }
  .receipt { width: 100%; margin: 0; }
  h1 { font-size: 15px; text-align: center; margin: 0 0 2px; }
  .center { text-align: center; }
  .muted { color: #555; font-size: 11px; line-height: 1.35; }
  .rule { border: none; border-top: 1px dashed #999; margin: 5px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: start; font-size: 10px; text-transform: uppercase; color: #777; padding-bottom: 2px; }
  td { padding: 1px 0; vertical-align: top; word-break: break-word; }
  .num { text-align: end; white-space: nowrap; padding-inline-start: 6px; direction: ltr; unicode-bidi: isolate; }
  .zatca-title { text-align: center; font-weight: 700; font-size: 12px; margin: 2px 0 4px; }
  .sub { font-size: 10px; color: #777; }
  .totals td { padding: 1px 0; }
  .grand td { font-weight: 700; font-size: 13px; border-top: 1px solid #111; padding-top: 3px; }
  .vf { text-align: center; font-size: 11px; }
  .vf svg { display: block; margin: 4px auto; }
  .footer { text-align: center; margin-top: 6px; font-size: 11px; }
  @page { size: 80mm auto; margin: 0; }
  @media print {
    html, body { width: 80mm; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <script>
    window.addEventListener('message', function (e) { if (e.data === 'print') window.print(); });
  </script>
  <div class="receipt">
    <h1>${esc(restaurantName)}</h1>
    ${zatca && !order.isProvisional ? `<p class="zatca-title">${esc(L('simplifiedInvoice'))}</p>` : ''}
    <p class="center muted">
      ${esc(branch.name)}${branch.address ? `<br>${esc(branch.address)}` : ''}
      ${branch.phone ? `<br>${esc(L('phone'))}: ${esc(branch.phone)}` : ''}
      ${taxIdValue ? `<br>${esc(taxIdLabel)}: ${esc(taxIdValue)}` : zatca ? `<br>${esc(LABELS.noVatNo.en)}` : ''}
    </p>
    <hr class="rule">
    <p class="muted">
      ${esc(dateStr)}<br>
      ${esc(L('order'))}: #${esc(order.orderNumber)} · ${esc(order.type.replace('_', ' '))}
      ${order.table ? `<br>${esc(L('table'))}: ${esc(order.table.label)}` : ''}
      ${order.customer ? `<br>${esc(L('guest'))}: ${esc(order.customer.name)}${order.customer.phone ? ` · ${esc(order.customer.phone)}` : ''}` : ''}
    </p>
    <hr class="rule">
    <table>
      <thead>
        <tr><th>${esc(L('item'))}</th><th class="num">${esc(L('qty'))}</th><th class="num">${esc(L('rate'))}</th><th class="num">${esc(L('amount'))}</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <hr class="rule">
    <table class="totals">
      ${totalRows.map(([l, v]) => `<tr><td>${esc(l)}</td><td class="num">${esc(v)}</td></tr>`).join('')}
      <tr class="grand"><td>${esc(L(order.isProvisional ? 'totalDue' : zatca ? 'totalInclVat' : 'grandTotal'))}</td><td class="num">${money(order.totalAmount)}</td></tr>
    </table>
    ${
      paymentRows.length > 0
        ? `<hr class="rule"><table class="totals">${paymentRows.join('')}</table>`
        : ''
    }
    ${settlementRows}
    ${
      order.verifactu && !order.isProvisional
        ? `<hr class="rule"><div class="vf"><strong>Factura simplificada ${esc(order.verifactu.invoiceNumber)}</strong><div>${esc(order.verifactu.heading)}</div>${qrSvg(order.verifactu.url, '35mm')}<div>${esc(order.verifactu.legend)}</div><strong>${esc(order.verifactu.short)}</strong></div>`
        : ''
    }
    ${
      zatcaQr
        ? `<hr class="rule"><div class="vf">${qrSvg(zatcaQr, '30mm')}</div>`
        : ''
    }
    <hr class="rule">
    <p class="footer">${esc(L(order.isProvisional ? 'provisional' : 'thanks'))}</p>
  </div>
</body>
</html>`;
}
