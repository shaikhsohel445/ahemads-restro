"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// labelKey is translated at render time (module scope runs before the locale is known).
const TABS = [
  { labelKey: "inventory.tabs.ingredients", href: "/inventory" },
  { labelKey: "inventory.tabs.suppliers", href: "/inventory/suppliers" },
  { labelKey: "inventory.tabs.purchaseOrders", href: "/inventory/purchase-orders" },
  { labelKey: "inventory.tabs.procurement", href: "/inventory/procurement" },
  { labelKey: "inventory.tabs.transfers", href: "/inventory/transfers" },
  { labelKey: "inventory.tabs.waste", href: "/inventory/waste" },
];

export function InventoryTabs() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/inventory" ? pathname === "/inventory" : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
