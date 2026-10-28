import { z } from "zod";

// Multi-region tax support (2026-09-27; Saudi VAT added for the Cloudflare
// edition). A branch picks a TaxRegime, which
// supplies sensible defaults for how the receipt labels tax and whether
// menu item prices already have tax baked in. See ARCHITECTURE.md and
// apps/backend/src/modules/orders/pricing.ts for the pricing-math side of
// this — this file is only the shared preset table + branch tax-settings
// DTO, used by both the API and the web app so the two never drift.

export const TAX_MODES = ["INCLUSIVE", "EXCLUSIVE"] as const;
export type TaxMode = (typeof TAX_MODES)[number];

export const TAX_REGIMES = [
  "SA_VAT",
  "INDIA_GST",
  "US_SALES_TAX",
  "EU_VAT",
  "ES_IVA",
  "CUSTOM",
] as const;
export type TaxRegime = (typeof TAX_REGIMES)[number];

export interface TaxRegimePreset {
  regime: TaxRegime;
  /** Shown in the Settings picker. */
  displayName: string;
  /** Default menu-item pricing mode for this regime. */
  defaultMode: TaxMode;
  /** What the receipt/POS calls the tax line, e.g. "GST", "VAT", "Sales Tax". */
  taxLabel: string;
  /** Label for the branch's tax registration number field. */
  taxIdLabel: string;
  /** India-only: split the tax line into CGST/SGST halves on receipts. */
  splitCgstSgst: boolean;
  /** A couple of illustrative example rates — NOT prescriptive or legal advice. */
  exampleRates: string;
  /** Suggested default country (ISO 3166-1 alpha-2) when this regime is picked. */
  defaultCountry: string;
  /**
   * Rate pre-filled for new menu items when the client sends none. Every
   * item's rate stays editable (zero-rated/exempt items exist); this is a
   * starting point, not a rule.
   */
  defaultRatePercent: number;
  /** Receipt is a ZATCA simplified tax invoice (bilingual, with TLV QR). */
  zatcaSimplifiedInvoice: boolean;
}

export const TAX_REGIME_PRESETS: Record<TaxRegime, TaxRegimePreset> = {
  // Saudi Arabia: VAT administered by ZATCA. 15% standard rate since
  // 1 July 2020; consumer prices must be shown VAT-inclusive. Verify the
  // current rate and any item exemptions with ZATCA or a tax adviser before
  // going live — the rate is configurable per item for exactly that reason.
  SA_VAT: {
    regime: "SA_VAT",
    displayName: "Saudi Arabia — VAT (ضريبة القيمة المضافة)",
    defaultMode: "INCLUSIVE",
    taxLabel: "VAT",
    taxIdLabel: "VAT No.",
    splitCgstSgst: false,
    exampleRates: "15% standard rate (verify with ZATCA before going live)",
    defaultCountry: "SA",
    defaultRatePercent: 15,
    zatcaSimplifiedInvoice: true,
  },
  INDIA_GST: {
    regime: "INDIA_GST",
    displayName: "India — GST",
    defaultMode: "INCLUSIVE",
    taxLabel: "GST",
    taxIdLabel: "GSTIN",
    splitCgstSgst: true,
    exampleRates: "5% / 12% / 18% (typical restaurant slabs)",
    defaultCountry: "IN",
    defaultRatePercent: 0,
    zatcaSimplifiedInvoice: false,
  },
  US_SALES_TAX: {
    regime: "US_SALES_TAX",
    displayName: "United States — Sales Tax",
    defaultMode: "EXCLUSIVE",
    taxLabel: "Sales Tax",
    taxIdLabel: "Sales Tax / EIN",
    splitCgstSgst: false,
    exampleRates: "Varies by state/city — commonly 6–10%",
    defaultCountry: "US",
    defaultRatePercent: 0,
    zatcaSimplifiedInvoice: false,
  },
  EU_VAT: {
    regime: "EU_VAT",
    displayName: "European Union — VAT",
    defaultMode: "INCLUSIVE",
    taxLabel: "VAT",
    taxIdLabel: "VAT No.",
    splitCgstSgst: false,
    exampleRates: "Reduced rate often applies to dine-in food, e.g. 10% Germany / 10% Italy",
    defaultCountry: "DE",
    defaultRatePercent: 0,
    zatcaSimplifiedInvoice: false,
  },
  ES_IVA: {
    regime: "ES_IVA",
    displayName: "Spain — IVA",
    defaultMode: "INCLUSIVE",
    taxLabel: "IVA",
    taxIdLabel: "NIF/CIF",
    splitCgstSgst: false,
    exampleRates: "10% (hospitality reduced rate) / 21% (general rate)",
    defaultCountry: "ES",
    defaultRatePercent: 0,
    zatcaSimplifiedInvoice: false,
  },
  CUSTOM: {
    regime: "CUSTOM",
    displayName: "Custom",
    defaultMode: "INCLUSIVE",
    taxLabel: "Tax",
    taxIdLabel: "Tax ID",
    splitCgstSgst: false,
    exampleRates: "Set per menu item",
    defaultCountry: "SA",
    defaultRatePercent: 0,
    zatcaSimplifiedInvoice: false,
  },
};

/** Effective receipt label for a branch: explicit taxLabel override wins, else the regime preset's. */
export function resolveTaxLabel(taxRegime: TaxRegime, taxLabel?: string | null): string {
  return taxLabel?.trim() || TAX_REGIME_PRESETS[taxRegime].taxLabel;
}

/** Effective tax-id field label for a branch. */
export function resolveTaxIdLabel(taxRegime: TaxRegime): string {
  return TAX_REGIME_PRESETS[taxRegime].taxIdLabel;
}

export const branchTaxSettingsSchema = z.object({
  country: z.string().length(2).optional(),
  taxRegime: z.enum(TAX_REGIMES).optional(),
  taxMode: z.enum(TAX_MODES).optional(),
  taxLabel: z.string().max(30).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
});
export type BranchTaxSettingsDto = z.infer<typeof branchTaxSettingsSchema>;
