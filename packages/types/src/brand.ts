// Product and developer identity in ONE place. Shared by the API (PDF
// metadata, e-mails, Swagger, webhooks) and the web app (shell, marketing
// site, SEO, structured data).
//
// This is the SOFTWARE's identity. Each restaurant's own name, logo, phone,
// address and invoice details are separate per-restaurant settings stored in
// the database and are never replaced by anything here.

export const BRAND = {
  productName: "Ahemad's Restro",
  shortName: "Ahemad's Restro",
  /** Used for URLs, package names and file names. */
  slug: "ahemads-restro",
  tagline: "Restaurant management software",
  taglineAr: "برنامج إدارة المطاعم",
  description:
    "Restaurant management software for POS, orders, tables, kitchen display, QR ordering, billing and reports — in English and Arabic.",
  descriptionAr:
    "برنامج لإدارة المطاعم يشمل نقاط البيع والطلبات والطاولات وشاشة المطبخ والطلب عبر رمز QR والفواتير والتقارير، باللغتين العربية والإنجليزية.",
  colors: {
    emerald: "#0B5D4A",
    emeraldDark: "#0A3D31",
    gold: "#C9A35A",
    charcoal: "#1F2328",
    sand: "#FAF7F2",
  },
  assets: {
    logo: "/brand/logo.svg",
    logoDark: "/brand/logo-dark.svg",
    mark: "/brand/mark.svg",
    markPng: "/brand/mark-512.png",
    ogImage: "/images/product/marketing/og-default.png",
  },
  developer: {
    name: "Wem Studios",
    url: "https://wemstudios.in/",
    phone: "+91 8308042362",
    phoneHref: "tel:+918308042362",
    /** No public e-mail was provided; NEXT_PUBLIC_SUPPORT_EMAIL shows one when set. */
    email: null as string | null,
  },
  /**
   * The open-source project this product is built on. Its AGPL-3.0 licence
   * requires keeping the copyright notice and offering the corresponding
   * source code to users who interact with the software over a network.
   */
  upstream: {
    name: "Nodedr OrderRestro",
    url: "https://github.com/Raktim94/nodedr-restaurant-pos",
    license: "AGPL-3.0-only",
    copyright: "Nodedr Infotech Private Limited and Raktim Ranjit",
  },
  locales: ["en", "ar"] as const,
  defaultLocale: "en" as const,
  defaultCurrency: "SAR",
} as const;

export type SiteLocale = (typeof BRAND.locales)[number];
