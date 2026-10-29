import type { SiteLocale } from "@/lib/site/config";
import type { FeatureIcon } from "../home";

/** One SEO landing page in one language. */
export interface SolutionCopy {
  /** <title>, 50–60 characters, primary keyword first. */
  metaTitle: string;
  /** Meta description, 140–160 characters, with a reason to click. */
  metaDescription: string;
  keywords: string[];
  /** Short label for nav/footer/breadcrumbs. */
  navLabel: string;
  h1: string;
  intro: string;
  /** "Why it matters" paragraph(s) for this search intent. */
  problem: { title: string; paragraphs: string[] };
  capabilities: { title: string; items: { icon: FeatureIcon; title: string; body: string }[] };
  /** Optional market-specific facts (Saudi/India pages). */
  local?: { title: string; points: string[]; note?: string };
  /** Honest limits for this topic (what is NOT included). */
  limits?: { title: string; points: string[] };
  faq: { q: string; a: string }[];
  cta: { title: string; body: string };
  /** Screenshot shown on the page (real capture under /images/product/screens). */
  image: { src: string; alt: string };
}

export interface SolutionPage {
  slug: string;
  /** Languages this page genuinely exists in (drives hreflang and the sitemap). */
  locales: readonly SiteLocale[];
  copy: Partial<Record<SiteLocale, SolutionCopy>>;
  /** Related pages for internal linking. */
  related: string[];
}
