import type { Metadata } from "next";
import { BRAND } from "@ahemads-restro/types";
import {
  GSC_VERIFICATION,
  HREFLANG,
  OG_LOCALE,
  SITE_LOCALES,
  SITE_URL,
  absoluteUrl,
  sitePath,
  type SiteLocale,
} from "./config";

/**
 * Metadata for one public page in one language:
 * - self-referencing canonical
 * - hreflang alternates ONLY for languages the page really exists in
 *   (`available`), plus x-default pointing at English (or the only version)
 * - Open Graph / Twitter cards with the page's own image
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  available = SITE_LOCALES,
  image,
  type = "website",
  keywords,
  noindex = false,
}: {
  lang: SiteLocale;
  /** Path without the locale prefix, e.g. "" for home or "/pricing". */
  path: string;
  title: string;
  description: string;
  available?: readonly SiteLocale[];
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  noindex?: boolean;
}): Metadata {
  const url = sitePath(lang, path);
  const languages: Record<string, string> = {};
  for (const l of available) languages[HREFLANG[l]] = absoluteUrl(sitePath(l, path));
  languages["x-default"] = absoluteUrl(sitePath(available.includes("en") ? "en" : available[0], path));
  // Share previews use PNG (WebP is not shown everywhere, e.g. WhatsApp);
  // every screenshot has a PNG twin. Only the default card is 1200x630.
  const ogImage = absoluteUrl(
    image ? image.replace(/\.webp$/, ".png") : lang === "ar" ? BRAND.assets.ogImageAr : BRAND.assets.ogImage,
  );

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: { canonical: absoluteUrl(url), languages },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type,
      url: absoluteUrl(url),
      siteName: BRAND.productName,
      title,
      description,
      locale: OG_LOCALE[lang],
      alternateLocale: available.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images: [image ? { url: ogImage, alt: title } : { url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    ...(GSC_VERIFICATION ? { verification: { google: GSC_VERIFICATION } } : {}),
  };
}
