"use client";

import { Building2, FileCheck2, KeyRound, Lock, ScrollText, ServerCog } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { useI18n } from "@/lib/i18n/context";

export function SecuritySection() {
  const { t } = useI18n();

  const points = [
    { id: "signin", icon: Lock, title: t("landing.security.signin.title"), description: t("landing.security.signin.description") },
    { id: "rbac", icon: KeyRound, title: t("landing.security.rbac.title"), description: t("landing.security.rbac.description") },
    { id: "isolation", icon: Building2, title: t("landing.security.isolation.title"), description: t("landing.security.isolation.description") },
    { id: "audit", icon: ScrollText, title: t("landing.security.audit.title"), description: t("landing.security.audit.description") },
    { id: "money", icon: ServerCog, title: t("landing.security.money.title"), description: t("landing.security.money.description") },
    { id: "docs", icon: FileCheck2, title: t("landing.security.docs.title"), description: t("landing.security.docs.description") },
  ];

  return (
    <section id="security" className="border-y border-border/60 bg-muted/30 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("landing.security.heading")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("landing.security.subheading")}</p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p) => (
            <RevealItem
              key={p.id}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card p-6"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="size-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/accessibility"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {t("landing.security.readAccessibility")}
          </Link>
          <span aria-hidden className="text-sm text-muted-foreground">·</span>
          <Link
            href="/docs/compliance-india"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {t("landing.security.readCompliance")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
