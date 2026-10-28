// Locale-aware formatting. Values stay numbers everywhere; only presentation
// goes through here.
//
// Defaults follow the Saudi edition (SAR, Asia/Riyadh) until the signed-in
// restaurant's own settings load (RegionSync in the dashboard layout calls
// setFormatRegion) and the UI language is known (I18nProvider calls
// setFormatLocale). Pass explicit arguments to override per call, e.g. the
// public kiosk/QR pages pass the currency that came with the menu.

let defaults = {
  currency: "SAR",
  locale: "en-SA",
  timeZone: "Asia/Riyadh",
};

export function setFormatLocale(locale: string) {
  defaults = { ...defaults, locale };
}

export function setFormatRegion(region: { currency?: string; timeZone?: string }) {
  defaults = {
    ...defaults,
    ...(region.currency ? { currency: region.currency } : {}),
    ...(region.timeZone ? { timeZone: region.timeZone } : {}),
  };
}

export function formatDefaults() {
  return defaults;
}

export function formatCurrency(
  value: number | string,
  currency: string = defaults.currency,
  locale: string = defaults.locale,
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value: number | string, options?: Intl.NumberFormatOptions): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(defaults.locale, options).format(Number.isFinite(n) ? n : 0);
}

/** Date and time in the restaurant's time zone (not the browser's). */
export function formatDateTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  return new Intl.DateTimeFormat(defaults.locale, { timeZone: defaults.timeZone, ...options }).format(
    new Date(value),
  );
}

export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return formatDateTime(value, options);
}

export function formatTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { timeStyle: "short" },
): string {
  return formatDateTime(value, options);
}
