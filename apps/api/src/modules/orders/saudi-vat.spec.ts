import {
  decodeZatcaQr,
  TAX_REGIME_PRESETS,
  zatcaQrBase64,
} from '@nodedr-restaurant/types';
import { priceLine, toEffectiveInclusiveUnitPrice } from './pricing';
import { buildReceiptHtml } from './receipt.html';
import { computeBill } from './settlement';

// Saudi edition: the server-authoritative pricing code is unchanged; these
// pin its behaviour for the SA_VAT preset (15%, VAT-inclusive) and the ZATCA
// simplified-invoice receipt.
describe('Saudi VAT (SA_VAT)', () => {
  const preset = TAX_REGIME_PRESETS.SA_VAT;

  it('defaults to 15% and VAT-inclusive prices', () => {
    expect(preset.defaultRatePercent).toBe(15);
    expect(preset.defaultMode).toBe('INCLUSIVE');
    expect(preset.zatcaSimplifiedInvoice).toBe(true);
  });

  it('extracts 15% VAT from an inclusive price', () => {
    // 115.00 incl. VAT = 100.00 + 15.00 VAT
    expect(
      priceLine({ quantity: 1, unitPriceInclusive: 115, taxRatePercent: 15 }),
    ).toEqual({
      lineTotal: 115,
      taxAmount: 15,
    });
    // 2 x 23.00 = 46.00 -> VAT 6.00
    expect(
      priceLine({ quantity: 2, unitPriceInclusive: 23, taxRatePercent: 15 })
        .taxAmount,
    ).toBe(6);
  });

  it('adds 15% on top when a branch prices exclusive of VAT', () => {
    expect(toEffectiveInclusiveUnitPrice(100, 15, 'EXCLUSIVE')).toBe(115);
    expect(toEffectiveInclusiveUnitPrice(100, 15, 'INCLUSIVE')).toBe(100);
  });

  it('a discount reduces the taxable value proportionally; tips are outside VAT', () => {
    const bill = computeBill({
      lines: [
        priceLine({ quantity: 2, unitPriceInclusive: 23, taxRatePercent: 15 }),
      ],
      discountPercent: 10,
      tip: 5,
    });
    expect(bill.subtotal).toBe(46);
    expect(bill.discountAmount).toBe(4.6);
    expect(bill.taxAmount).toBe(5.4); // 41.40 incl. -> 5.40 VAT
    expect(bill.totalDue).toBe(46.4); // 41.40 + 5.00 tip
  });

  it('mixed zero-rated and standard-rated lines keep their own rates', () => {
    const lines = [
      priceLine({ quantity: 1, unitPriceInclusive: 115, taxRatePercent: 15 }),
      priceLine({ quantity: 1, unitPriceInclusive: 10, taxRatePercent: 0 }),
    ];
    expect(computeBill({ lines }).taxAmount).toBe(15);
  });
});

describe('ZATCA simplified tax invoice receipt', () => {
  const branch = {
    name: 'الرياض',
    address: null,
    phone: null,
    gstNumber: null,
    taxRegime: 'SA_VAT' as const,
    taxMode: 'INCLUSIVE' as const,
    taxLabel: null,
    taxId: '310122393500003',
  };
  const order = {
    orderNumber: 'ORD-1',
    type: 'DINE_IN',
    createdAt: new Date('2026-10-28T12:00:00Z'),
    table: null,
    customer: null,
    subtotal: 115,
    discountAmount: 0,
    taxAmount: 15,
    tipAmount: 0,
    loyaltyPointsRedeemed: 0,
    loyaltyDiscountAmount: 0,
    totalAmount: 115,
    items: [
      {
        nameSnapshot: 'كبسة',
        quantity: 1,
        unitPriceSnapshot: 115,
        lineTotal: 115,
        taxRateSnapshot: 15,
        modifiers: [],
      },
    ],
    payments: [{ method: 'MADA', amount: 115 }],
  };

  it('is bilingual, shows the VAT number, Riyadh time and a QR', () => {
    const html = buildReceiptHtml({
      restaurantName: 'مطعم الواحة',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      branch,
      order,
    });
    expect(html).toContain('Simplified Tax Invoice / فاتورة ضريبية مبسطة');
    expect(html).toContain('310122393500003');
    expect(html).toContain('3:00'); // 12:00 UTC = 15:00 Riyadh
    expect(html).toContain('mada');
    expect(html).toContain('<svg');
  });

  it('never prints the QR on a provisional bill', () => {
    const html = buildReceiptHtml({
      restaurantName: 'مطعم الواحة',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      branch,
      order: { ...order, isProvisional: true },
    });
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('فاتورة ضريبية مبسطة');
  });

  it('QR payload carries the five Phase 1 fields', () => {
    const fields = decodeZatcaQr(
      zatcaQrBase64({
        sellerName: 'مطعم الواحة',
        vatNumber: '310122393500003',
        timestamp: '2026-10-28T12:00:00Z',
        total: 115,
        vatTotal: 15,
      }),
    );
    expect(fields).toEqual({
      1: 'مطعم الواحة',
      2: '310122393500003',
      3: '2026-10-28T12:00:00Z',
      4: '115.00',
      5: '15.00',
    });
  });

  it('other regimes print exactly as before (no ZATCA wording)', () => {
    const html = buildReceiptHtml({
      restaurantName: 'Bistro',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      branch: {
        ...branch,
        taxRegime: 'INDIA_GST',
        taxId: null,
        gstNumber: '29ABCDE1234F1Z5',
      },
      order,
    });
    expect(html).toContain('CGST (incl.)');
    expect(html).not.toContain('فاتورة');
  });
});
