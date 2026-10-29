import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ARTICLES } from "@/content/site/blog";
import { BLOG_INDEX } from "@/content/site/blog/index-copy";
import { isSiteLocale, sitePath, type SiteLocale } from "@/lib/site/config";
import { breadcrumbLd, webPageLd } from "@/lib/site/jsonld";
import { pageMetadata } from "@/lib/site/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isSiteLocale(lang)) return {};
  const b = BLOG_INDEX[lang];
  return pageMetadata({ lang, path: "/blog", title: b.metaTitle, description: b.metaDescription });
}

export default async function BlogIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  if (!isSiteLocale(l)) notFound();
  const lang: SiteLocale = l;
  const b = BLOG_INDEX[lang];
  const posts = ARTICLES.filter((a) => a.locales.includes(lang) && a.copy[lang]).sort((x, y) => y.published.localeCompare(x.published));
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { dateStyle: "long" });

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ lang, path: "/blog", name: b.metaTitle, description: b.metaDescription }),
          breadcrumbLd([{ name: "Ahemad's Restro", path: sitePath(lang) }, { name: b.h1, path: sitePath(lang, "/blog") }]),
        ]}
      />
      <SiteHeader lang={lang} alternatePath={sitePath(lang === "en" ? "ar" : "en", "/blog")} />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={[{ name: "Ahemad's Restro", href: sitePath(lang) }, { name: b.h1 }]} />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">{b.h1}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{b.intro}</p>
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((a) => {
            const copy = a.copy[lang]!;
            return (
              <li key={a.slug}>
                <Link href={sitePath(lang, `/blog/${a.slug}`)} className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                  <p className="text-xs text-muted-foreground">
                    <time dateTime={a.published}>{fmt.format(new Date(a.published))}</time> · {b.minutes.replace("{n}", String(copy.minutes))}
                  </p>
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">{copy.title}</h2>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {b.read}
                    <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {posts.length === 0 && <p className="mt-10 text-muted-foreground">{b.empty}</p>}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
