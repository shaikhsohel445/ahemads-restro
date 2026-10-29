import Link from "next/link";
import { BRAND } from "@ahemads-restro/types";
import { COMMON } from "@/content/site/common";
import { SOLUTIONS } from "@/content/site/solutions";
import { SOURCE_CODE_URL, SUPPORT_EMAIL, sitePath, type SiteLocale } from "@/lib/site/config";

export function SiteFooter({ lang }: { lang: SiteLocale }) {
  const c = COMMON[lang];
  const home = sitePath(lang);
  const year = new Date().getFullYear();
  const solutions = SOLUTIONS.filter((s) => s.locales.includes(lang)).slice(0, 8);

  return (
    <footer className="border-t border-border bg-[#0A3D31] text-[#E6EFEA]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Link href={home} className="flex items-center gap-2.5" aria-label={BRAND.productName}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG brand mark */}
            <img src={BRAND.assets.mark} alt="" width={40} height={40} className="size-10" />
            <span className="text-lg font-bold tracking-tight text-white">
              Ahemad&apos;s <span className="text-[#E2C487]">Restro</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">{c.footer.overview}</p>
          <a
            href={`${home}#demo`}
            className="inline-flex h-11 w-fit items-center rounded-xl bg-[#C9A35A] px-5 text-sm font-semibold text-[#1A1408] transition-colors hover:bg-[#E2C487]"
          >
            {c.cta.demo}
          </a>
        </div>

        <nav aria-label={c.footer.product} className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-white">{c.footer.product}</p>
          <a href={`${home}#features`} className="text-white/70 hover:text-white">{c.nav.features}</a>
          <a href={`${home}#how-it-works`} className="text-white/70 hover:text-white">{c.nav.howItWorks}</a>
          <a href={`${home}#screenshots`} className="text-white/70 hover:text-white">{c.nav.screenshots}</a>
          <a href={`${home}#pricing`} className="text-white/70 hover:text-white">{c.nav.pricing}</a>
          <Link href={sitePath(lang, "/blog")} className="text-white/70 hover:text-white">{c.nav.blog}</Link>
          <a href={`${home}#faq`} className="text-white/70 hover:text-white">{c.nav.faq}</a>
        </nav>

        <nav aria-label={c.footer.solutions} className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-white">{c.footer.solutions}</p>
          {solutions.map((s) => (
            <Link key={s.slug} href={sitePath(lang, `/${s.slug}`)} className="text-white/70 hover:text-white">
              {s.copy[lang]?.navLabel}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-white">{c.footer.contact}</p>
          <p className="text-white/70">{BRAND.developer.name}</p>
          <a href={BRAND.developer.phoneHref} className="text-white/90 hover:text-white">
            {c.footer.phone}: <bdi dir="ltr">{BRAND.developer.phone}</bdi>
          </a>
          <a href={BRAND.developer.url} target="_blank" rel="noopener" className="text-white/90 hover:text-white">
            {c.footer.website}: <bdi dir="ltr">wemstudios.in</bdi>
          </a>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white/90 hover:text-white">
              <bdi dir="ltr">{SUPPORT_EMAIL}</bdi>
            </a>
          )}
          <Link href={sitePath(lang, "/privacy")} className="mt-2 text-white/70 hover:text-white">{c.footer.privacy}</Link>
          <Link href={sitePath(lang, "/terms")} className="text-white/70 hover:text-white">{c.footer.terms}</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {BRAND.productName}. {c.footer.rights}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={BRAND.developer.url} target="_blank" rel="noopener" className="font-medium text-white/85 hover:text-white">
              {c.footer.attribution}
            </a>
            <span aria-hidden>·</span>
            <span>
              {c.footer.builtOn} ({c.footer.license}) —{" "}
              <a href={SOURCE_CODE_URL} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-white">
                {c.footer.sourceCode}
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
