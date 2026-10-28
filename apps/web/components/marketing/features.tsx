"use client";

import {
  ChartColumn,
  ChefHat,
  Cloud,
  Gift,
  Languages,
  LayoutGrid,
  Package,
  Plug,
  QrCode,
  ReceiptText,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { useI18n } from "@/lib/i18n/context";

export function Features() {
  const { t } = useI18n();

  const features = [
    { id: "pos", icon: UtensilsCrossed, title: t("landing.features.pos.title"), description: t("landing.features.pos.description") },
    { id: "kds", icon: ChefHat, title: t("landing.features.kds.title"), description: t("landing.features.kds.description") },
    { id: "tables", icon: LayoutGrid, title: t("landing.features.tables.title"), description: t("landing.features.tables.description") },
    { id: "qr", icon: QrCode, title: t("landing.features.qr.title"), description: t("landing.features.qr.description") },
    { id: "vat", icon: ReceiptText, title: t("landing.features.vat.title"), description: t("landing.features.vat.description") },
    { id: "bilingual", icon: Languages, title: t("landing.features.bilingual.title"), description: t("landing.features.bilingual.description") },
    { id: "inventory", icon: Package, title: t("landing.features.inventory.title"), description: t("landing.features.inventory.description") },
    { id: "crm", icon: Gift, title: t("landing.features.crm.title"), description: t("landing.features.crm.description") },
    { id: "delivery", icon: Truck, title: t("landing.features.delivery.title"), description: t("landing.features.delivery.description") },
    { id: "reports", icon: ChartColumn, title: t("landing.features.reports.title"), description: t("landing.features.reports.description") },
    { id: "cloud", icon: Cloud, title: t("landing.features.cloud.title"), description: t("landing.features.cloud.description") },
    { id: "api", icon: Plug, title: t("landing.features.api.title"), description: t("landing.features.api.description") },
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("landing.features.heading")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("landing.features.subheading")}</p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <RevealItem
            key={f.id}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
