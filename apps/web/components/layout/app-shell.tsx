"use client";

import type { SessionUser } from "@nodedr-restaurant/types";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { EntityDialogHost } from "@/components/layout/entity-dialog-host";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useBranch } from "@/hooks/use-branch";
import { useSettings } from "@/hooks/use-settings";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { BrandFooter } from "./brand-footer";
import { BranchSwitcher } from "./branch-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { NAV_ITEMS } from "./nav-items";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

const COLLAPSE_KEY = "nodedr-sidebar-collapsed";
// Service screens used standing at a counter or on a kitchen tablet get the
// tighter page padding so their grids have the room.
const DENSE_ROUTES = ["/pos", "/kds", "/tables"];

// The restaurant's own logo + name lead the sidebar header (operator branding
// takes the prime spot); the product mark is only a fallback.
function RestaurantBrand({ collapsed = false }: { collapsed?: boolean }) {
  const { branchId } = useBranch();
  const { data } = useSettings(branchId);
  const restaurant = data?.restaurant;

  return (
    <>
      {restaurant?.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded asset served from R2, not a Next-optimizable remote source
        <img
          src={restaurant.logoUrl}
          alt={restaurant.name}
          className="size-9 shrink-0 rounded-xl bg-white object-contain p-0.5"
        />
      ) : (
        <Logo size={36} className="rounded-xl bg-white p-0.5" />
      )}
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            {restaurant?.name ?? "Nodedr OrderRestro"}
          </span>
          <span className="block truncate text-[11px] text-sidebar-foreground/55">OrderRestro</span>
        </span>
      )}
    </>
  );
}

export function AppShell({
  user,
  children,
}: {
  user?: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();
  const pathname = usePathname() ?? "";
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const dense = DENSE_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore a saved preference after hydration
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // storage unavailable: keep the expanded default
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        // not persisted; still toggles for this visit
      }
      return !c;
    });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center gap-2.5", collapsed ? "justify-center px-2" : "px-4")}>
          <RestaurantBrand collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="px-3 pb-3">
            <BranchSwitcher />
          </div>
        )}
        <div className="flex-1 overflow-y-auto py-2 [scrollbar-width:thin]">
          <SidebarNav user={user} collapsed={collapsed} />
        </div>
        <div className={cn("border-t border-sidebar-border p-3", collapsed && "flex justify-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={t(collapsed ? "layout.expandSidebar" : "layout.collapseSidebar")}
            title={t(collapsed ? "layout.expandSidebar" : "layout.collapseSidebar")}
            className={cn(
              "flex h-9 items-center gap-2 rounded-xl text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "w-11 justify-center" : "w-full px-3",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4 rtl:-scale-x-100" />
            ) : (
              <>
                <PanelLeftClose className="size-4 rtl:-scale-x-100" />
                {t("layout.collapseSidebar")}
              </>
            )}
          </button>
        </div>
        {!collapsed && <BrandFooter />}
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[18rem] flex-col border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">{t("layout.navigation")}</SheetTitle>
          <div className="flex h-16 shrink-0 items-center gap-2.5 px-4">
            <RestaurantBrand />
          </div>
          <div className="px-3 pb-3">
            <BranchSwitcher />
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav user={user} onNavigate={() => setMobileOpen(false)} />
          </div>
          <BrandFooter />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label={t("layout.openNavigation")}
          >
            <Menu className="size-5" />
          </button>
          {current && (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="hidden size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground sm:flex">
                <current.icon className="size-4" />
              </span>
              <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                {t(current.labelKey)}
              </span>
            </div>
          )}
          <div className="ms-auto flex items-center gap-1">
            <LanguageSwitcher compact />
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </header>
        <main
          className={cn(
            "flex-1 overflow-y-auto pb-28 lg:pb-8",
            dense ? "p-3 sm:p-4 lg:p-5" : "p-4 sm:p-6 lg:p-8",
          )}
        >
          <div className={cn("mx-auto w-full", !dense && "max-w-[1440px]")}>{children}</div>
        </main>
        <EntityDialogHost />
      </div>
      <MobileBottomNav user={user} onMore={() => setMobileOpen(true)} />
    </div>
  );
}
