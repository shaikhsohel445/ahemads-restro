"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, Boxes, ClipboardList, FileStack, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// labelKey is translated at render time (module scope runs before the locale is known).
const TABS: { labelKey: string; href: string; icon: LucideIcon }[] = [
  { labelKey: "inventory.tabs.ingredients", href: "/inventory", icon: Boxes },
  { labelKey: "inventory.tabs.suppliers", href: "/inventory/suppliers", icon: Truck },
  { labelKey: "inventory.tabs.purchaseOrders", href: "/inventory/purchase-orders", icon: ClipboardList },
  { labelKey: "inventory.tabs.procurement", href: "/inventory/procurement", icon: FileStack },
  { labelKey: "inventory.tabs.transfers", href: "/inventory/transfers", icon: ArrowLeftRight },
  { labelKey: "inventory.tabs.waste", href: "/inventory/waste", icon: Trash2 },
];

/** Section navigation shared by every inventory page — a pill bar that scrolls sideways on phones. */
export function InventoryTabs({ className }: { className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("inventory.title")}
      className={cn(
        "flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1 ring-1 ring-border/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/inventory" ? pathname === "/inventory" : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all",
              isActive
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "")} />
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
