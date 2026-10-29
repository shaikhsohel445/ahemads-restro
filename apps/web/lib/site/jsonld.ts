import { BRAND } from "@ahemads-restro/types";
import { SITE_URL, absoluteUrl, sitePath, type SiteLocale } from "./config";

// Schema.org data describing the SOFTWARE and its developer — consistent with
// what the page shows. No ratings, reviews, prices or user counts: none exist.

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BRAND.developer.url}#organization`,
    name: BRAND.developer.name,
    url: BRAND.developer.url,
    telephone: BRAND.developer.phone,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND.developer.phone,
        contactType: "sales",
        availableLanguage: ["English", "Arabic"],
      },
    ],
  };
}

export function websiteLd(lang: SiteLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND.productName,
    url: absoluteUrl(sitePath(lang)),
    inLanguage: lang,
    publisher: { "@id": `${BRAND.developer.url}#organization` },
  };
}

export function softwareApplicationLd(lang: SiteLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: BRAND.productName,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Restaurant management software",
    operatingSystem: "Web browser (desktop, tablet, phone)",
    description: lang === "ar" ? BRAND.descriptionAr : BRAND.description,
    url: absoluteUrl(sitePath(lang)),
    image: absoluteUrl(BRAND.assets.markPng),
    screenshot: absoluteUrl("/images/product/screens/dashboard-en.png"),
    inLanguage: ["en", "ar"],
    availableLanguage: ["English", "Arabic"],
    featureList: [
      "Point of sale for dine-in, takeaway and delivery",
      "Kitchen display system with realtime updates",
      "Table and floor management",
      "QR code table ordering and self-service kiosk",
      "Menu, modifiers and combos",
      "Billing, discounts, coupons, loyalty and gift cards",
      "Inventory and procurement",
      "Reports with CSV, Excel and PDF export",
      "Staff roles and permissions",
      "Multi-branch management",
      "Arabic and English with right-to-left layout",
      "Saudi Riyal and VAT with ZATCA Phase 1 QR receipts",
    ],
    author: { "@id": `${BRAND.developer.url}#organization` },
    publisher: { "@id": `${BRAND.developer.url}#organization` },
  };
}

export function webPageLd({
  lang,
  path,
  name,
  description,
}: {
  lang: SiteLocale;
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: absoluteUrl(sitePath(lang, path)),
    name,
    description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#software` },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleLd({
  lang,
  path,
  title,
  description,
  published,
  updated,
  image,
}: {
  lang: SiteLocale;
  path: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: lang,
    datePublished: published,
    dateModified: updated ?? published,
    mainEntityOfPage: absoluteUrl(sitePath(lang, path)),
    image: absoluteUrl(image ?? BRAND.assets.ogImage),
    author: { "@id": `${BRAND.developer.url}#organization` },
    publisher: { "@id": `${BRAND.developer.url}#organization` },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
