"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  /** Omit to show the tab to anyone who can reach /settings at all. */
  permission?: string;
  /** Only shown for branches in this country (ISO code). */
  country?: string;
}

const TABS: SettingsTab[] = [
  { labelKey: "settings.tabs.general", href: "/settings" },
  { labelKey: "settings.tabs.staff", href: "/settings/staff", permission: "users.manage" },
  { labelKey: "settings.tabs.roles", href: "/settings/roles", permission: "roles.manage" },
  { labelKey: "settings.tabs.auditLog", href: "/settings/audit-log", permission: "audit_log.view" },
  { labelKey: "settings.tabs.backup", href: "/settings/backup", permission: "backup.manage" },
  { labelKey: "settings.tabs.updates", href: "/settings/updates", permission: "system.update" },
  { labelKey: "settings.tabs.sync", href: "/settings/sync", permission: "settings.manage" },
  { labelKey: "settings.tabs.apiKeys", href: "/settings/api-keys" },
  { labelKey: "settings.tabs.security", href: "/settings/security" },
  { labelKey: "settings.tabs.webhooks", href: "/settings/webhooks", permission: "settings.manage" },
  { labelKey: "settings.tabs.verifactu", href: "/settings/verifactu", permission: "settings.manage", country: "ES" },
];

export function SettingsTabs() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const user = data?.user;
  const badges = useNavBadges();
  const { branchId } = useBranch();
  const branchCountry = useSettings(branchId).data?.branch.country;

  const visibleTabs = TABS.filter(
    (tab) =>
      (!tab.permission || hasPermission(user, tab.permission)) &&
      (!tab.country || branchCountry === tab.country),
  );

  return (
    <nav className="flex gap-1 border-b border-border">
      {visibleTabs.map((tab) => {
        const isActive =
          tab.href === "/settings" ? pathname === "/settings" : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
            {badges.settingsTabs[tab.href] ? <NavDot className="ms-0" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
