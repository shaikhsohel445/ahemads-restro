"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { SessionUser } from "@ahemads-restro/types";
import { hasPermission } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useNavBadges } from "@/hooks/use-nav-badges";
import { NAV_ITEMS } from "./nav-items";

// The screens staff jump between all shift long, in priority order. Whatever
// the signed-in role can't open is skipped, so a kitchen-only login still gets
// a full bar. Everything else lives behind "More" (the existing drawer).
const PRIMARY_HREFS = ["/pos", "/orders", "/tables", "/kds", "/dashboard"];
const PRIMARY_COUNT = 4;

// Thumb-reach navigation for phones. Hidden from lg up, where the sidebar takes over.
export function MobileBottomNav({
  user,
  onMore,
}: {
  user?: SessionUser;
  onMore: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const badges = useNavBadges();

  const allowed = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );
  const primary = PRIMARY_HREFS.map((href) => allowed.find((i) => i.href === href))
    .filter((i): i is (typeof allowed)[number] => !!i)
    .slice(0, PRIMARY_COUNT);

  const itemClass =
    "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition-colors";

  // Floating bar: rounded, lifted off the screen edge, with a filled pill
  // behind the active tab.
  return (
    <nav
      aria-label={t("layout.primaryNav")}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex gap-1 rounded-3xl border border-border/70 bg-card/90 p-1.5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl lg:hidden"
    >
      {primary.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              itemClass,
              "h-14",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground active:bg-muted",
            )}
          >
            <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
            <span className="max-w-full truncate px-1">{t(item.labelKey)}</span>
            {badges.nav[item.href] && !isActive ? (
              <span className="absolute top-2 start-1/2 ms-2 size-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_2px_rgba(245,158,11,0.7)]" />
            ) : null}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onMore}
        className={cn(itemClass, "h-14 text-muted-foreground active:bg-muted")}
      >
        <MoreHorizontal className="size-5" />
        <span>{t("common.more")}</span>
      </button>
    </nav>
  );
}
