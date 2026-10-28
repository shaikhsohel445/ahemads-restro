"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { downloadHref } from "@/lib/downloads";
import { useI18n } from "@/lib/i18n/context";

export function MarketingFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t("landing.footer.product"),
      links: [
        { href: "#features", label: t("landing.nav.features") },
        { href: "#security", label: t("landing.nav.security") },
        { href: "#get-started", label: t("landing.nav.getStarted") },
      ],
    },
    {
      title: t("landing.footer.resources"),
      links: [
        { href: "/docs", label: t("landing.nav.docs") },
        { href: "/docs/api", label: t("landing.footer.api") },
        { href: "/docs/accessibility", label: t("landing.footer.accessibility") },
        { href: "/docs/compliance-india", label: t("landing.footer.compliance") },
        { href: downloadHref("github"), label: t("landing.footer.source") },
      ],
    },
    {
      title: t("landing.footer.account"),
      links: [
        { href: "/login", label: t("landing.cta.signIn") },
        { href: "/signup", label: t("landing.cta.createAccount") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/60 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-sm font-semibold text-foreground">{t("landing.brand")}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("landing.footer.tagline")}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {col.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("landing.footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground">{t("landing.footer.hosting")}</p>
        </div>
      </div>
    </footer>
  );
}
