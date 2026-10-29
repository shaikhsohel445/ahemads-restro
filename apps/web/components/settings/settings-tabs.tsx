"use client";

import {
  Bell,
  Building2,
  CloudDownload,
  DatabaseBackup,
  FileCheck2,
  Globe,
  KeyRound,
  LockKeyhole,
  Printer,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  TabletSmartphone,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useNavBadges } from "@/hooks/use-nav-badges";
import { useBranch } from "@/hooks/use-branch";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { NavDot } from "@/components/layout/nav-dot";
import { useI18n } from "@/lib/i18n/context";

interface SettingsTab {
  /** Message key in the `settings` namespace, translated at render time. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  group: "business" | "people" | "integrations" | "data" | "compliance";
  /** Omit to show the tab to anyone who can reach /settings at all. */
  permission?: string;
  /** Only shown for branches in this country (ISO code). */
  country?: string;
}

const TABS: SettingsTab[] = [
  { labelKey: "settings.tabs.general", href: "/settings", icon: SlidersHorizontal, group: "business" },
  { labelKey: "settings.tabs.staff", href: "/settings/staff", icon: Users, group: "people", permission: "users.manage" },
  { labelKey: "settings.tabs.roles", href: "/settings/roles", icon: ShieldCheck, group: "people", permission: "roles.manage" },
  { labelKey: "settings.tabs.security", href: "/settings/security", icon: LockKeyhole, group: "people" },
  { labelKey: "settings.tabs.apiKeys", href: "/settings/api-keys", icon: KeyRound, group: "integrations" },
  { labelKey: "settings.tabs.webhooks", href: "/settings/webhooks", icon: Webhook, group: "integrations", permission: "settings.manage" },
  { labelKey: "settings.tabs.backup", href: "/settings/backup", icon: DatabaseBackup, group: "data", permission: "backup.manage" },
  { labelKey: "settings.tabs.auditLog", href: "/settings/audit-log", icon: ScrollText, group: "data", permission: "audit_log.view" },
  { labelKey: "settings.tabs.sync", href: "/settings/sync", icon: RefreshCw, group: "data", permission: "settings.manage" },
  { labelKey: "settings.tabs.updates", href: "/settings/updates", icon: CloudDownload, group: "data", permission: "system.update" },
  { labelKey: "settings.tabs.verifactu", href: "/settings/verifactu", icon: FileCheck2, group: "compliance", permission: "settings.manage", country: "ES" },
];

const GROUPS: { id: SettingsTab["group"]; labelKey: string }[] = [
  { id: "business", labelKey: "settings.nav.groupBusiness" },
  { id: "people", labelKey: "settings.nav.groupPeople" },
  { id: "integrations", labelKey: "settings.nav.groupIntegrations" },
  { id: "data", labelKey: "settings.nav.groupData" },
  { id: "compliance", labelKey: "settings.nav.groupCompliance" },
];

/** Sections of the General page (`/settings`), linked as in-page anchors on desktop. */
export const GENERAL_SECTIONS: { id: string; labelKey: string; icon: LucideIcon }[] = [
  { id: "restaurant", labelKey: "settings.nav.restaurant", icon: Store },
  { id: "branch", labelKey: "settings.nav.branchTax", icon: Building2 },
  { id: "online", labelKey: "settings.nav.online", icon: Globe },
  { id: "kiosk", labelKey: "settings.nav.kiosk", icon: TabletSmartphone },
  { id: "notifications", labelKey: "settings.nav.notifications", icon: Bell },
  { id: "printer", labelKey: "settings.nav.printer", icon: Printer },
];

function useVisibleTabs() {
  const { data } = useCurrentUser();
  const user = data?.user;
  const { branchId } = useBranch();
  const branchCountry = useSettings(branchId).data?.branch.country;
  return TABS.filter(
    (tab) =>
      (!tab.permission || hasPermission(user, tab.permission)) &&
      (!tab.country || branchCountry === tab.country),
  );
}

const isActiveTab = (pathname: string | null, href: string) =>
  href === "/settings" ? pathname === "/settings" : !!pathname?.startsWith(href);

// Highlights the General-page section currently in view.
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>(GENERAL_SECTIONS[0].id);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    // Sections mount after settings load; observe whatever is there now and
    // re-scan for a few seconds so late arrivals are picked up too.
    const scan = () =>
      GENERAL_SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    scan();
    const timer = window.setInterval(scan, 1000);
    const stop = window.setTimeout(() => window.clearInterval(timer), 6000);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [enabled]);
  return active;
}

/**
 * Settings sub-navigation. Phones/tablets: a horizontally scrolling pill bar
 * (the active pill scrolls into view). Desktop (lg+): a grouped vertical list
 * for the sticky inline-start column, with the General page's sections as
 * in-page anchors.
 */
export function SettingsNav({ className }: { className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const badges = useNavBadges();
  const visibleTabs = useVisibleTabs();
  const onGeneral = pathname === "/settings";
  const activeSection = useActiveSection(onGeneral);
  const activePillRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activePillRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label={t("settings.nav.label")} className={cn("min-w-0", className)}>
      {/* Phones & tablets */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-center gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-border/70">
          {visibleTabs.map((tab) => {
            const active = isActiveTab(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                ref={active ? activePillRef : undefined}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active && "text-primary")} />
                {t(tab.labelKey)}
                {badges.settingsTabs[tab.href] ? <NavDot className="ms-0" /> : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-5 lg:flex">
        {GROUPS.map((group) => {
          const tabs = visibleTabs.filter((tab) => tab.group === group.id);
          if (tabs.length === 0) return null;
          return (
            <div key={group.id} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                {t(group.labelKey)}
              </p>
              {tabs.map((tab) => {
                const active = isActiveTab(pathname, tab.href);
                const Icon = tab.icon;
                return (
                  <div key={tab.href} className="flex flex-col">
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" aria-hidden />
                      )}
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{t(tab.labelKey)}</span>
                      {badges.settingsTabs[tab.href] ? <NavDot className="ms-0" /> : null}
                    </Link>
                    {tab.href === "/settings" && onGeneral && (
                      <ul className="ms-5 mt-1 mb-1 flex flex-col border-s border-border/80 ps-2">
                        {GENERAL_SECTIONS.map((section) => (
                          <li key={section.id}>
                            <a
                              href={`#${section.id}`}
                              aria-current={activeSection === section.id ? "location" : undefined}
                              className={cn(
                                "flex h-8 items-center rounded-lg px-2.5 text-[13px] transition-colors",
                                activeSection === section.id
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {t(section.labelKey)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/** @deprecated The settings layout renders the navigation; kept for backward compatibility. */
export const SettingsTabs = SettingsNav;
