import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/site/article-body";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TERMS } from "@/content/site/legal/terms";
import { isSiteLocale, sitePath, type SiteLocale } from "@/lib/site/config";
import { pageMetadata } from "@/lib/site/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isSiteLocale(lang)) return {};
  const d = TERMS[lang];
  return pageMetadata({ lang, path: "/terms", title: d.title, description: d.description });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  if (!isSiteLocale(l)) notFound();
  const lang: SiteLocale = l;
  const d = TERMS[lang];
  return (
    <>
      <SiteHeader lang={lang} alternatePath={sitePath(lang === "en" ? "ar" : "en", "/terms")} />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={[{ name: "Ahemad's Restro", href: sitePath(lang) }, { name: d.title }]} />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">{d.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{d.updated}</p>
        <div className="mt-8"><ArticleBody blocks={d.body} /></div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
