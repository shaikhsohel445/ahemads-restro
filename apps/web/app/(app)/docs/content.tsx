"use client";

import Link from "next/link";
import { DocPage, DocSection } from "@/components/marketing/doc-page";
import { linkTo, rich } from "@/components/marketing/rich-text";
import { downloadHref } from "@/lib/downloads";
import { useI18n } from "@/lib/i18n/context";

export function DocsIndexContent() {
  const { t } = useI18n();

  const docs = [
    { href: "/docs/api", title: t("docs.index.api.title"), description: t("docs.index.api.description") },
    {
      href: "/docs/accessibility",
      title: t("docs.index.accessibility.title"),
      description: t("docs.index.accessibility.description"),
    },
    {
      href: "/docs/compliance-india",
      title: t("docs.index.compliance.title"),
      description: t("docs.index.compliance.description"),
    },
  ];

  return (
    <DocPage title={t("docs.index.title")} updated="2026-10-29">
      <DocSection heading={t("docs.index.guides")}>
        <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60">
          {docs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="flex flex-col gap-1 p-4 transition-colors hover:bg-secondary"
            >
              <span className="text-sm font-medium text-foreground">{doc.title}</span>
              <span className="text-sm text-muted-foreground">{doc.description}</span>
            </Link>
          ))}
        </div>
      </DocSection>

      <DocSection heading={t("docs.index.hosting.heading")}>
        <p>{t("docs.index.hosting.body")}</p>
      </DocSection>

      <DocSection heading={t("docs.index.source.heading")}>
        <p>{rich(t("docs.index.source.body"), { link: linkTo(downloadHref("github"), true) })}</p>
      </DocSection>
    </DocPage>
  );
}
