import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/site/blog";
import { SOLUTIONS } from "@/content/site/solutions";
import { SITE_LOCALES, absoluteUrl, sitePath, type SiteLocale } from "@/lib/site/config";

// Public marketing pages only, with their real language alternates. The
// restaurant app (/dashboard, /pos, /login, …), guest QR/kiosk pages and the
// API are deliberately absent (and disallowed or noindexed).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    locales: readonly SiteLocale[],
    priority: number,
    lastModified: Date = now,
  ): MetadataRoute.Sitemap =>
    locales.map((lang) => ({
      url: absoluteUrl(sitePath(lang, path)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(sitePath(l, path))])),
      },
    }));

  return [
    ...entry("", SITE_LOCALES, 1),
    ...SOLUTIONS.flatMap((s) => entry(`/${s.slug}`, s.locales, 0.8)),
    ...entry("/blog", SITE_LOCALES, 0.6),
    ...ARTICLES.flatMap((a) => entry(`/blog/${a.slug}`, a.locales, 0.6, new Date(a.updated ?? a.published))),
    ...entry("/privacy", SITE_LOCALES, 0.2),
    ...entry("/terms", SITE_LOCALES, 0.2),
  ];
}
