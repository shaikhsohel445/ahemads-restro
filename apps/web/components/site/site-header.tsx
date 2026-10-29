import Link from "next/link";
import { BRAND } from "@ahemads-restro/types";
import { COMMON } from "@/content/site/common";
import { sitePath, type SiteLocale } from "@/lib/site/config";
import { MobileNav } from "./mobile-nav";
import { TrackedLink } from "./analytics";

/**
 * Public site header. `alternatePath` is the same page in the other
 * language (null when that page exists in one language only, e.g. the
 * India page) — the switch then goes to the other language's home.
 */
export function SiteHeader({ lang, alternatePath }: { lang: SiteLocale; alternatePath: string | null }) {
  const c = COMMON[lang];
  const other: SiteLocale = lang === "en" ? "ar" : "en";
  const home = sitePath(lang);
  const links = [
    { href: `${home}#features`, label: c.nav.features },
    { href: `${home}#how-it-works`, label: c.nav.howItWorks },
    { href: `${home}#screenshots`, label: c.nav.screenshots },
    { href: `${home}#pricing`, label: c.nav.pricing },
    { href: sitePath(lang, "/blog"), label: c.nav.blog },
    { href: `${home}#faq`, label: c.nav.faq },
  ];
  const switchHref = alternatePath ?? sitePath(other);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        {c.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href={home} className="flex shrink-0 items-center gap-2.5" aria-label={BRAND.productName}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG brand mark */}
          <img src={BRAND.assets.mark} alt="" width={36} height={36} className="size-9" />
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Ahemad&apos;s <span className="text-primary">Restro</span>
          </span>
        </Link>
        <nav aria-label={c.menu} className="ms-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <Link
            href={switchHref}
            hrefLang={other}
            lang={other}
            aria-label={c.switchLanguageLabel}
            className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            {c.switchLanguage}
          </Link>
          <Link href="/login" className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted md:inline-flex">
            {c.cta.signIn}
          </Link>
          <TrackedLink
            href={`${home}#demo`}
            event="header_demo"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {c.cta.demo}
          </TrackedLink>
          <MobileNav
            links={links}
            label={c.menu}
            switchHref={switchHref}
            switchLabel={c.switchLanguage}
            switchLang={other}
            signIn={c.cta.signIn}
          />
        </div>
      </div>
    </header>
  );
}
