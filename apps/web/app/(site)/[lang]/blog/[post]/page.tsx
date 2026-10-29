import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArticleBody } from "@/components/site/article-body";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { COMMON } from "@/content/site/common";
import { ARTICLES, articleBySlug } from "@/content/site/blog";
import { BLOG_INDEX } from "@/content/site/blog/index-copy";
import { solutionBySlug } from "@/content/site/solutions";
import { isSiteLocale, sitePath, type SiteLocale } from "@/lib/site/config";
import { articleLd, breadcrumbLd } from "@/lib/site/jsonld";
import { pageMetadata } from "@/lib/site/seo";

export function generateStaticParams() {
  return ARTICLES.flatMap((a) => a.locales.map((lang) => ({ lang, post: a.slug })));
}
export const dynamicParams = false;

type Params = Promise<{ lang: string; post: string }>;

function resolve(lang: string, slug: string) {
  if (!isSiteLocale(lang)) return null;
  const article = articleBySlug(slug);
  const copy = article?.copy[lang];
  if (!article || !copy || !article.locales.includes(lang)) return null;
  return { article, copy, lang: lang as SiteLocale };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, post } = await params;
  const r = resolve(lang, post);
  if (!r) return {};
  return pageMetadata({
    lang: r.lang,
    path: `/blog/${post}`,
    title: r.copy.title,
    description: r.copy.description,
    keywords: r.copy.keywords,
    available: r.article.locales,
    type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { lang: l, post } = await params;
  const r = resolve(l, post);
  if (!r) notFound();
  const { article, copy, lang } = r;
  const b = BLOG_INDEX[lang];
  const other: SiteLocale = lang === "en" ? "ar" : "en";
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { dateStyle: "long" });
  const related = article.relatedSolutions.map((s) => solutionBySlug(s)).filter((s) => s && s.copy[lang] && s.locales.includes(lang));

  return (
    <>
      <JsonLd
        data={[
          articleLd({ lang, path: `/blog/${post}`, title: copy.title, description: copy.description, published: article.published, updated: article.updated }),
          breadcrumbLd([
            { name: "Ahemad's Restro", path: sitePath(lang) },
            { name: b.h1, path: sitePath(lang, "/blog") },
            { name: copy.title, path: sitePath(lang, `/blog/${post}`) },
          ]),
        ]}
      />
      <SiteHeader lang={lang} alternatePath={article.locales.includes(other) ? sitePath(other, `/blog/${post}`) : null} />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs items={[{ name: "Ahemad's Restro", href: sitePath(lang) }, { name: b.h1, href: sitePath(lang, "/blog") }, { name: copy.title }]} />
        <article className="mt-6">
          <header className="mb-8 flex flex-col gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">{copy.title}</h1>
            <p className="text-lg text-muted-foreground">{copy.description}</p>
            <p className="text-sm text-muted-foreground">
              {b.published} <time dateTime={article.published}>{fmt.format(new Date(article.published))}</time>
              {article.updated && <> · {b.updated} <time dateTime={article.updated}>{fmt.format(new Date(article.updated))}</time></>}
              {" · "}{b.minutes.replace("{n}", String(copy.minutes))}
            </p>
          </header>
          <ArticleBody blocks={copy.body} />
        </article>
        {related.length > 0 && (
          <aside className="mt-12 flex flex-wrap gap-2">
            {related.map((s) => (
              <Link key={s!.slug} href={sitePath(lang, `/${s!.slug}`)} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary/40">
                {s!.copy[lang]!.navLabel}
              </Link>
            ))}
          </aside>
        )}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl bg-[#0A3D31] p-8 text-white">
          <h2 className="text-2xl font-bold">{copy.cta.title}</h2>
          <p className="text-white/75">{copy.cta.body}</p>
          <Link href={`${sitePath(lang)}#demo`} className="inline-flex h-11 items-center rounded-xl bg-[#C9A35A] px-5 font-semibold text-[#1A1408] hover:bg-[#E2C487]">
            {COMMON[lang].cta.demo}
          </Link>
        </div>
        <Link href={sitePath(lang, "/blog")} className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          {b.back}
        </Link>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
