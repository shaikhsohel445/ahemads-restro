import { BRAND, type SiteLocale } from "@ahemads-restro/types";

// Public marketing site settings. Everything deployment-specific comes from
// NEXT_PUBLIC_* variables (inlined at build time), never hardcoded:
//   NEXT_PUBLIC_SITE_URL            canonical origin, e.g. https://www.example.com
//   NEXT_PUBLIC_GA_MEASUREMENT_ID   Google Analytics 4 id (optional, consent-gated)
//   NEXT_PUBLIC_GSC_VERIFICATION    Google Search Console verification token (optional)
//   NEXT_PUBLIC_SUPPORT_EMAIL       public e-mail address, if one is provided later
//   NEXT_PUBLIC_SOURCE_CODE_URL     public repository (AGPL-3.0 source offer)

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:1995").replace(/\/$/, "");
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? BRAND.developer.email ?? "";
export const SOURCE_CODE_URL = process.env.NEXT_PUBLIC_SOURCE_CODE_URL ?? BRAND.upstream.url;

export const SITE_LOCALES = BRAND.locales;
export type { SiteLocale };

export function isSiteLocale(value: string): value is SiteLocale {
  return (SITE_LOCALES as readonly string[]).includes(value);
}

export const DIR: Record<SiteLocale, "ltr" | "rtl"> = { en: "ltr", ar: "rtl" };
export const OG_LOCALE: Record<SiteLocale, string> = { en: "en_US", ar: "ar_SA" };
export const HREFLANG: Record<SiteLocale, string> = { en: "en", ar: "ar" };

/** Site path for a locale: sitePath("ar", "/pricing") -> "/ar/pricing". */
export function sitePath(lang: SiteLocale, path = ""): string {
  const clean = path === "/" ? "" : path;
  return `/${lang}${clean}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
