import type { SiteLocale } from "@/lib/site/config";

/** A block of article body. Plain data so articles stay reviewable text. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export interface ArticleCopy {
  title: string;
  description: string;
  keywords: string[];
  /** Reading time in minutes (rounded). */
  minutes: number;
  body: Block[];
  /** Closing call to action tied to the article's topic. */
  cta: { title: string; body: string };
}

export interface Article {
  slug: string;
  /** ISO dates. */
  published: string;
  updated?: string;
  locales: readonly SiteLocale[];
  copy: Partial<Record<SiteLocale, ArticleCopy>>;
  /** Solution pages (slugs) this article links to. */
  relatedSolutions: string[];
}
