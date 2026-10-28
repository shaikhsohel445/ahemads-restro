"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@nodedr-restaurant/types";
import { hasPermission } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useNavBadges } from "@/hooks/use-nav-badges";
import { NavDot } from "./nav-dot";
import { NAV_GROUPS, NAV_ITEMS } from "./nav-items";

// Grouped navigation on the dark emerald rail. `collapsed` shows icons only
// (labels move into the native tooltip), which gives POS and kitchen
// screens more room on tablets.
export function SidebarNav({
  user,
  onNavigate,
  collapsed = false,
}: {
  user?: SessionUser;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const badges = useNavBadges();
  const allowed = NAV_ITEMS.filter((item) => !item.permission || hasPermission(user, item.permission));

  return (
    <nav className="flex flex-col gap-5 px-3">
      {NAV_GROUPS.map((group) => {
        const items = allowed.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <div key={group} className="flex flex-col gap-0.5">
            {collapsed ? (
              <div className="mx-auto mb-1 h-px w-6 bg-sidebar-border" />
            ) : (
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
                {t(`layout.group.${group}`)}
              </p>
            )}
            {items.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
                    collapsed ? "mx-auto size-11 justify-center" : "h-10 px-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-sidebar-primary" aria-hidden />
                  )}
                  <Icon
                    className={cn("size-[18px] shrink-0", isActive && "text-sidebar-primary")}
                    strokeWidth={isActive ? 2.25 : 2}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {badges.nav[item.href] && !isActive ? (
                    <NavDot className={collapsed ? "absolute top-1.5 end-1.5" : undefined} />
                  ) : null}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
