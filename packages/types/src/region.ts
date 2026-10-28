// Regional defaults for the Saudi Arabia edition, in one place so nothing
// else hardcodes a currency, time zone or locale. A restaurant's own
// `currency` / `timezone` (and its branches' `country` / `taxRegime`) still
// win wherever they are set; these only seed new restaurants and fill gaps.

export const DEFAULT_REGION = {
  country: "SA",
  currency: "SAR",
  timezone: "Asia/Riyadh",
  taxRegime: "SA_VAT",
  /** BCP 47 locale used for number/currency/date formatting per UI language. */
  locales: { en: "en-SA", ar: "ar-SA" },
} as const;

/** ISO 4217 minor units for the currencies this app is used with. */
const MINOR_UNITS: Record<string, number> = {
  SAR: 2,
  INR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  KWD: 3,
  BHD: 3,
  OMR: 3,
};

export function currencyDecimals(currency: string): number {
  return MINOR_UNITS[currency.toUpperCase()] ?? 2;
}

/** Rounds to the currency's minor unit (half away from zero, as round2 did). */
export function roundMoney(amount: number, currency = "SAR"): number {
  const f = 10 ** currencyDecimals(currency);
  const sign = amount < 0 ? -1 : 1;
  return (sign * Math.round((Math.abs(amount) + Number.EPSILON) * f)) / f;
}

export type UiLanguage = "en" | "ar";

export function intlLocale(
  language: string | undefined,
  country: string = DEFAULT_REGION.country,
): string {
  const lang = language === "ar" ? "ar" : "en";
  return `${lang}-${country}`;
}

/**
 * Locale-aware money formatting. Values stay numbers everywhere else; only
 * presentation goes through here. Arabic uses Latin digits by default
 * (`-u-nu-latn`), the common choice for Saudi receipts and POS screens; pass
 * `arabicDigits: true` for Arabic-Indic digits.
 */
export function formatMoney(
  amount: number | string,
  currency: string = DEFAULT_REGION.currency,
  language: string = "en",
  opts: { arabicDigits?: boolean; country?: string } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const base = intlLocale(language, opts.country);
  const locale = language === "ar" && !opts.arabicDigits ? `${base}-u-nu-latn` : base;
  const digits = currencyDecimals(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Date-time in the restaurant's time zone (never the server's, which is UTC on Workers). */
export function formatDateTime(
  value: Date | string | number,
  timeZone: string = DEFAULT_REGION.timezone,
  language: string = "en",
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  const base = intlLocale(language);
  const locale = language === "ar" ? `${base}-u-nu-latn` : base;
  return new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(new Date(value));
}
