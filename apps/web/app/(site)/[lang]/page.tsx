import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Info, Phone, Star } from "lucide-react";
import { BRAND } from "@ahemads-restro/types";
import { TrackedLink } from "@/components/site/analytics";
import { BrowserFrame } from "@/components/site/browser-frame";
import { DemoForm } from "@/components/site/demo-form";
import { FeatureIcon } from "@/components/site/feature-icon";
import { JsonLd } from "@/components/site/json-ld";
import { Section } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { COMMON, DEMO_FORM } from "@/content/site/common";
import { HOME } from "@/content/site/home";
import { PLANS } from "@/content/site/pricing";
import { isSiteLocale, sitePath, type SiteLocale } from "@/lib/site/config";
import { faqLd, softwareApplicationLd, webPageLd } from "@/lib/site/jsonld";
import { pageMetadata } from "@/lib/site/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isSiteLocale(lang)) return {};
  const h = HOME[lang];
  return pageMetadata({ lang, path: "", title: h.meta.title, description: h.meta.description, keywords: h.meta.keywords });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isSiteLocale(raw)) notFound();
  const lang: SiteLocale = raw;
  const h = HOME[lang];
  const c = COMMON[lang];
  const other: SiteLocale = lang === "en" ? "ar" : "en";

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd(lang),
          webPageLd({ lang, path: "", name: h.meta.title, description: h.meta.description }),
          faqLd(h.faq.items),
        ]}
      />
      <SiteHeader lang={lang} alternatePath={sitePath(other)} />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgb(11_93_74/0.14),transparent_60%),radial-gradient(40rem_24rem_at_0%_110%,rgb(201_163_90/0.12),transparent_60%)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pb-24">
            <div className="flex flex-col gap-6">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                <span className="size-1.5 rounded-full bg-[#C9A35A]" aria-hidden />
                {h.hero.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
                {h.hero.title} <span className="text-primary">{h.hero.titleAccent}</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{h.hero.body}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href="#demo"
                  event="hero_demo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_24px_-10px_rgb(11_93_74/0.7)] transition-colors hover:bg-primary/90"
                >
                  {c.cta.demo}
                  <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                </TrackedLink>
                <TrackedLink
                  href="#features"
                  event="hero_features"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {c.cta.features}
                </TrackedLink>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {h.hero.points.map((p) => (
                  <li key={p} className="flex items-center gap-1.5">
                    <Check className="size-4 text-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <BrowserFrame
                src={`/images/product/screens/dashboard-${lang}.png`}
                alt={h.hero.imageAlt}
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
              <div className="absolute -bottom-6 hidden w-[34%] overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:block ltr:-left-6 rtl:-right-6">
                <Image
                  src={`/images/product/screens/mobile-pos-${lang}.png`}
                  alt=""
                  width={390}
                  height={844}
                  sizes="20vw"
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>
          <div className="border-y border-border/70 bg-card/60">
            <ul className="mx-auto grid max-w-7xl gap-3 px-4 py-5 text-sm text-muted-foreground sm:grid-cols-3 sm:px-6">
              {h.trust.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <Section id="features" eyebrow={h.features.eyebrow} title={h.features.title} body={h.features.body}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {h.features.items.map((f) => (
              <li key={f.title} className="group flex gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
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

        {/* How it works */}
        <Section id="how-it-works" eyebrow={h.steps.eyebrow} title={h.steps.title} tone="muted">
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {h.steps.items.map((s, i) => (
              <li key={s.title} className="relative flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Screenshots */}
        <Section id="screenshots" eyebrow={h.screens.eyebrow} title={h.screens.title} body={h.screens.body}>
          <div className="grid gap-6 md:grid-cols-2">
            {h.screens.items.map((s) => (
              <div key={s.src} className={s.wide ? "md:col-span-2" : undefined}>
                <BrowserFrame src={s.src} alt={s.alt} sizes={s.wide ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"} />
                <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{s.caption}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4" aria-hidden />
            {h.screens.realNote}
          </p>
        </Section>

        {/* Audience */}
        <Section id="who-its-for" eyebrow={h.audience.eyebrow} title={h.audience.title} body={h.audience.body} tone="muted">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.audience.items.map((a) => (
              <li key={a.title} className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Saudi */}
        <Section tone="dark">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold tracking-wide text-[#E2C487] uppercase">{h.saudi.eyebrow}</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{h.saudi.title}</h2>
              <p className="text-lg text-white/75">{h.saudi.body}</p>
              <ul className="mt-2 flex flex-col gap-3">
                {h.saudi.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-[#E2C487]" aria-hidden />
                    <span className="text-white/90">{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-white/55">{h.saudi.note}</p>
            </div>
            <BrowserFrame
              src={`/images/product/screens/receipt-${lang}.png`}
              alt={lang === "ar" ? "إيصال فاتورة ضريبية مبسطة ثنائية اللغة مع رمز QR" : "Bilingual simplified tax invoice receipt with QR code"}
              width={1000}
              height={1100}
              className="mx-auto max-w-md"
              sizes="(min-width: 1024px) 28rem, 100vw"
            />
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing" eyebrow={h.pricing.eyebrow} title={h.pricing.title} body={h.pricing.body}>
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={
                  plan.highlighted
                    ? "relative flex flex-col gap-5 rounded-3xl border-2 border-primary bg-card p-7 shadow-[var(--shadow-card-hover)]"
                    : "relative flex flex-col gap-5 rounded-3xl border border-border bg-card p-7"
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 inline-flex items-center gap-1 rounded-full bg-[#C9A35A] px-3 py-1 text-xs font-semibold text-[#1A1408] ltr:left-7 rtl:right-7">
                    <Star className="size-3 fill-current" aria-hidden />
                    {h.pricing.popular}
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name[lang]}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.audience[lang]}</p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {plan.price === null ? h.pricing.contact : `${plan.price} ${plan.currency}`}
                </p>
                <ul className="flex flex-1 flex-col gap-2.5 text-sm">
                  {plan.features[lang].map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <TrackedLink
                  href="#demo"
                  event={`pricing_${plan.id}`}
                  className={
                    plan.highlighted
                      ? "inline-flex h-11 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                      : "inline-flex h-11 items-center justify-center rounded-xl border border-border font-semibold hover:bg-muted"
                  }
                >
                  {plan.cta[lang]}
                </TrackedLink>
              </article>
            ))}
          </div>
        </Section>

        {/* Demo */}
        <Section id="demo" tone="muted">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">{h.demo.eyebrow}</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{h.demo.title}</h2>
              <p className="text-lg text-muted-foreground">{h.demo.body}</p>
              <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
                <p className="text-sm text-muted-foreground">{h.demo.callUs}</p>
                <TrackedLink href={BRAND.developer.phoneHref} event="call_phone" className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Phone className="size-5 text-primary" aria-hidden />
                  <bdi dir="ltr">{BRAND.developer.phone}</bdi>
                </TrackedLink>
                <TrackedLink href={BRAND.developer.url} event="visit_wemstudios" external className="text-sm font-medium text-primary underline underline-offset-4">
                  {h.demo.visit} — wemstudios.in
                </TrackedLink>
              </div>
            </div>
            <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card-hover)] sm:p-8">
              <DemoForm copy={DEMO_FORM[lang]} lang={lang} privacyHref={sitePath(lang, "/privacy")} />
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" eyebrow={h.faq.eyebrow} title={h.faq.title}>
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {h.faq.items.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 open:shadow-[var(--shadow-card)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-3xl bg-[linear-gradient(135deg,#0F7259,#0A3D31)] px-6 py-14 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{h.finalCta.title}</h2>
            <p className="max-w-xl text-lg text-white/75">{h.finalCta.body}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="#demo" event="final_demo" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#C9A35A] px-6 font-semibold text-[#1A1408] hover:bg-[#E2C487]">
                {c.cta.demo}
              </TrackedLink>
              <TrackedLink href={BRAND.developer.url} event="final_contact" external className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-semibold text-white hover:bg-white/10">
                {c.cta.contact}
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
