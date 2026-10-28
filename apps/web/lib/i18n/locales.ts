// Supported UI languages. English and Arabic are complete for the Saudi
// edition; Spanish and French are the partial translations carried over from
// the original app (anything they lack falls back to English).
//
// Adding a language: add its code here, add messages/<code>/*.json for every
// namespace in ./messages.ts, and it shows up in the language switcher.
export const LOCALES = ["en", "ar", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
};

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "nodedr-locale";

const RTL_LOCALES: ReadonlySet<Locale> = new Set(["ar"]);

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/**
 * BCP 47 tag for Intl formatting. Saudi region by default; Arabic keeps
 * Latin digits (`nu-latn`), as Saudi POS screens and receipts do.
 */
export function intlLocaleTag(locale: Locale, country = "SA"): string {
  switch (locale) {
    case "ar":
      return `ar-${country}-u-nu-latn`;
    case "en":
      return `en-${country}`;
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
  }
}

/**
 * Inline script for <head>: applies the saved language's `lang`/`dir` before
 * first paint, so an Arabic user never sees the layout flip after load.
 */
export const LOCALE_BOOTSTRAP_SCRIPT = `try{var l=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});if(!l){var n=(navigator.languages||[navigator.language])[0]||"";l=n.slice(0,2).toLowerCase()}if(["en","ar","es","fr"].indexOf(l)<0)l="en";document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr"}catch(e){}`;
