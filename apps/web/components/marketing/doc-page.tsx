"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { useI18n } from "@/lib/i18n/context";
import { intlLocaleTag } from "@/lib/i18n/locales";

export function DocPage({
  title,
  updated,
  children,
}: {
  title: string;
  /** ISO date (YYYY-MM-DD) the page content was last revised. */
  updated: string;
  children: ReactNode;
}) {
  const { t, locale } = useI18n();

  // Page metadata is static English (server-rendered); keep the tab title in
  // the reader's language once the client knows it.
  useEffect(() => {
    document.title = `${title} — ${t("docs.brandFull")}`;
  }, [title, t]);

  // Gregorian calendar explicitly: ar-SA would otherwise default to Hijri.
  const updatedLabel = new Intl.DateTimeFormat(intlLocaleTag(locale), {
    dateStyle: "long",
    calendar: "gregory",
    timeZone: "UTC",
  }).format(new Date(`${updated}T00:00:00Z`));

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-sm font-semibold text-foreground">{t("docs.brand")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
              {t("docs.backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("docs.lastUpdated", { date: updatedLabel })}
        </p>
        <div className="mt-10 flex flex-col gap-10">{children}</div>
      </main>
    </div>
  );
}

export function DocSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{heading}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function DocList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ms-5 flex list-disc flex-col gap-1.5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** Code sample: always left-to-right, even on an Arabic page. */
export function DocCode({ children }: { children: string }) {
  return (
    <pre
      dir="ltr"
      className="overflow-x-auto rounded-xl border border-border/60 bg-card p-4 text-start text-[13px] leading-relaxed text-foreground"
    >
      <code>{children}</code>
    </pre>
  );
}
