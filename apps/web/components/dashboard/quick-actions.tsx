"use client";

import { CalendarPlus, ChefHat, LayoutGrid, ShoppingCart, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Labels are message keys, translated at render time.
const ACTIONS = [
  { href: "/pos", labelKey: "dashboard.quick.newOrder", icon: ShoppingCart, primary: true },
  { href: "/tables", labelKey: "dashboard.quick.tables", icon: LayoutGrid },
  { href: "/reservations", labelKey: "dashboard.quick.newReservation", icon: CalendarPlus },
  { href: "/kds", labelKey: "dashboard.quick.kds", icon: ChefHat },
  { href: "/menu", labelKey: "dashboard.quick.menu", icon: UtensilsCrossed },
];

// One-tap jumps into the flows staff reach for most during service — icon
// tiles that sit right under the header so they're the first thing visible.
export function QuickActions() {
  const { t } = useI18n();
  return (
    <nav
      aria-label={t("dashboard.quickActions")}
      className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 sm:gap-3"
    >
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "group flex min-h-[5.25rem] flex-col items-start justify-between gap-3 rounded-2xl border p-3.5 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-4",
            action.primary
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border/80 bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
          )}
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-xl transition-colors",
              action.primary
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            <action.icon className="size-[18px]" />
          </span>
          <span className="leading-tight">{t(action.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}
