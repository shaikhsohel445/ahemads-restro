"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PosMockup } from "@/components/marketing/pos-mockup";
import { useI18n } from "@/lib/i18n/context";

export function Hero() {
  const { t } = useI18n();
  // The headline animates in word by word; the accent phrase is a separate
  // key so each language can choose which words get the brand color.
  const lead = t("landing.hero.titleLead").split(" ").filter(Boolean);
  const accent = t("landing.hero.titleAccent").split(" ").filter(Boolean);
  const words = [
    ...lead.map((w) => ({ w, accent: false })),
    ...accent.map((w) => ({ w, accent: true })),
  ];

  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-28">
      {/* Ambient gradient glow — transform/opacity only, no layout cost */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-success" />
          {t("landing.hero.badge")}
        </motion.div>

        <h1 className="flex flex-wrap justify-center gap-x-3 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          {words.map(({ w, accent: isAccent }, i) => (
            <motion.span
              key={`${i}-${w}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={isAccent ? "text-primary" : undefined}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          {t("landing.hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" className="h-11 px-6 text-[15px]" render={<Link href="/signup" />}>
            {t("landing.cta.createAccount")}
            <ArrowRight className="rtl:-scale-x-100 size-4" data-icon="inline-end" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6 text-[15px]"
            render={<a href="#features" />}
          >
            {t("landing.hero.exploreFeatures")}
          </Button>
        </motion.div>
      </div>

      <div className="mt-16 sm:mt-20">
        <PosMockup />
      </div>
    </section>
  );
}
