"use client";

import { BRAND } from "@ahemads-restro/types";
import { LifeBuoy, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { SOURCE_CODE_URL } from "@/lib/site/config";

// Software support and credit at the bottom of the navigation rail. This is
// the product developer's contact, never the restaurant's own details.
export function BrandFooter() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-2 border-t border-sidebar-border px-4 py-3">
      <a
        href={BRAND.developer.phoneHref}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border px-3 py-1.5 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        {t("layout.contactSupport")}
        <Phone className="h-3 w-3 opacity-70" aria-hidden />
      </a>
      <a
        href={BRAND.developer.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-start text-[11px] leading-tight text-sidebar-foreground/60 hover:text-sidebar-foreground hover:underline"
      >
        {BRAND.productName} · {t("layout.byDeveloper", { name: BRAND.developer.name })}
      </a>
      {/* AGPL-3.0 section 13: users of the hosted app get a link to its source. */}
      <a
        href={SOURCE_CODE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-start text-[11px] leading-tight text-sidebar-foreground/50 hover:text-sidebar-foreground hover:underline"
      >
        {t("layout.sourceCode")}
      </a>
    </div>
  );
}
