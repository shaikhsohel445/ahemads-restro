"use client";

import { ArrowRight, ClipboardList, Printer, UserPlus, UtensilsCrossed, Wifi } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { useI18n } from "@/lib/i18n/context";

// "Getting started" for the hosted edition: there is nothing to install —
// the old self-hosting channels (install script, Docker, CasaOS, Windows)
// don't apply to the Cloudflare-hosted service.
export function GettingStartedSection() {
  const { t } = useI18n();

  const steps = [
    { id: "signup", icon: UserPlus, title: t("landing.start.signup.title"), description: t("landing.start.signup.description") },
    { id: "setup", icon: ClipboardList, title: t("landing.start.setup.title"), description: t("landing.start.setup.description") },
    { id: "qr", icon: Printer, title: t("landing.start.qr.title"), description: t("landing.start.qr.description") },
    { id: "orders", icon: UtensilsCrossed, title: t("landing.start.orders.title"), description: t("landing.start.orders.description") },
  ];

  return (
    <section id="get-started" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("landing.start.heading")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("landing.start.subheading")}</p>
      </Reveal>

      <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <RevealItem
            key={s.id}
            className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                {t("landing.start.stepNumber", { n: i + 1 })}
              </span>
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {s.description}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal
        delay={0.1}
        className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-5 text-start"
      >
        <Wifi className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("landing.start.internetNote")}
        </p>
      </Reveal>

      <Reveal delay={0.15} className="mt-10 flex justify-center">
        <Button size="lg" className="h-11 px-6 text-[15px]" render={<Link href="/signup" />}>
          {t("landing.cta.createAccount")}
          <ArrowRight className="rtl:-scale-x-100 size-4" data-icon="inline-end" />
        </Button>
      </Reveal>
    </section>
  );
}
