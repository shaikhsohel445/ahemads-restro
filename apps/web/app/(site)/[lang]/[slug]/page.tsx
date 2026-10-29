import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BrowserFrame } from "@/components/site/browser-frame";
import { DemoForm } from "@/components/site/demo-form";
import { FeatureIcon } from "@/components/site/feature-icon";
import { JsonLd } from "@/components/site/json-ld";
import { Section } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { COMMON, DEMO_FORM } from "@/content/site/common";
import { SOLUTIONS, solutionBySlug } from "@/content/site/solutions";
import { isSiteLocale, sitePath, type SiteLocale } from "@/lib/site/config";
import { breadcrumbLd, faqLd, softwareApplicationLd, webPageLd } from "@/lib/site/jsonld";
import { pageMetadata } from "@/lib/site/seo";

// SEO landing pages (content/site/solutions). Only language/slug pairs that
// really exist are generated; everything else is a 404.
export function generateStaticParams() {
  return SOLUTIONS.flatMap((s) => s.locales.map((lang) => ({ lang, slug: s.slug })));
}
export const dynamicParams = false;

type Params = Promise<{ lang: string; slug: string }>;

function resolve(lang: string, slug: string) {
  if (!isSiteLocale(lang)) return null;
  const page = solutionBySlug(slug);
  const copy = page?.copy[lang];
  if (!page || !copy || !page.locales.includes(lang)) return null;
  return { page, copy, lang: lang as SiteLocale };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const r = resolve(lang, slug);
  if (!r) return {};
  return pageMetadata({
    lang: r.lang,
    path: `/${slug}`,
    title: r.copy.metaTitle,
    description: r.copy.metaDescription,
    keywords: r.copy.keywords,
    available: r.page.locales,
    image: r.copy.image.src,
  });
}

export default async function SolutionPage({ params }: { params: Params }) {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) notFound();
  const { page, copy, lang } = r;
  const c = COMMON[lang];
  const other: SiteLocale = lang === "en" ? "ar" : "en";
  const home = sitePath(lang);
  const related = page.related
    .map((s) => solutionBySlug(s))
    .filter((s) => s && s.locales.includes(lang) && s.copy[lang]);

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd(lang),
          webPageLd({ lang, path: `/${slug}`, name: copy.metaTitle, description: copy.metaDescription }),
          breadcrumbLd([
            { name: "Ahemad's Restro", path: home },
            { name: copy.navLabel, path: sitePath(lang, `/${slug}`) },
          ]),
          faqLd(copy.faq),
        ]}
      />
      <SiteHeader lang={lang} alternatePath={page.locales.includes(other) ? sitePath(other, `/${slug}`) : null} />
      <main id="main">
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_26rem_at_90%_-10%,rgb(11_93_74/0.12),transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-2 lg:pb-20">
            <div className="flex flex-col gap-5">
              <Breadcrumbs items={[{ name: "Ahemad's Restro", href: home }, { name: copy.navLabel }]} />
              <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">{copy.h1}</h1>
              <p className="text-lg leading-relaxed text-muted-foreground">{copy.intro}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#demo" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
                  {c.cta.demo}
                  <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                </a>
                <Link href={`${home}#features`} className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold hover:bg-muted">
                  {c.cta.features}
                </Link>
              </div>
            </div>
            <BrowserFrame src={copy.image.src} alt={copy.image.alt} priority />
          </div>
        </section>

        <Section align="start" title={copy.problem.title}>
          <div className="flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-muted-foreground">
            {copy.problem.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Section>

        <Section title={copy.capabilities.title} tone="muted">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {copy.capabilities.items.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <FeatureIcon name={f.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {(copy.local || copy.limits) && (
          <Section>
            <div className="grid gap-6 lg:grid-cols-2">
              {copy.local && (
                <div className="rounded-3xl bg-[#0A3D31] p-7 text-white">
                  <h2 className="text-2xl font-bold">{copy.local.title}</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {copy.local.points.map((p) => (
                      <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-[#E2C487]" aria-hidden />{p}</li>
                    ))}
                  </ul>
                  {copy.local.note && <p className="mt-5 text-sm text-white/60">{copy.local.note}</p>}
                </div>
              )}
              {copy.limits && (
                <div className="rounded-3xl border border-border bg-card p-7">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Info className="size-5 text-primary" aria-hidden />{copy.limits.title}</h2>
                  <ul className="mt-5 flex list-disc flex-col gap-2 ps-6 text-muted-foreground">
                    {copy.limits.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        <Section title={c.nav.faq} tone="muted">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {copy.faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold text-foreground">{f.q}</summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {related.length > 0 && (
          <Section title={c.nav.solutions}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <li key={s!.slug}>
                  <Link href={sitePath(lang, `/${s!.slug}`)} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 font-semibold hover:border-primary/40">
                    {s!.copy[lang]!.navLabel}
                    <ArrowRight className="size-4 text-primary rtl:-scale-x-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section id="demo" title={copy.cta.title} body={copy.cta.body} tone="muted">
          <div className="mx-auto max-w-3xl rounded-3xl bg-card p-6 shadow-[var(--shadow-card-hover)] sm:p-8">
            <DemoForm copy={DEMO_FORM[lang]} lang={lang} privacyHref={sitePath(lang, "/privacy")} />
          </div>
        </Section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
