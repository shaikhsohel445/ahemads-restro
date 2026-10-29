"use client";

import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { SettingsBody, SettingsSection } from "@/components/settings/settings-section";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useSyncStatus } from "@/hooks/use-sync";
import { useI18n } from "@/lib/i18n/context";

// Server sync linked a self-hosted (PostgreSQL) install to a hub. On the
// Cloudflare edition every terminal already talks to the one shared D1
// database, so the API reports `{ enabled: false, role: "unavailable",
// unavailable: true }` and answers 501 to every sync action. This screen
// only explains that; there is nothing to set up.
export default function SyncSettingsPage() {
  const { t } = useI18n();
  const { data, isLoading } = useSyncStatus();
  const unavailable = !data || data.unavailable || data.role === "unavailable";

  return (
    <SettingsSection
      icon={RefreshCw}
      title={t("settings.sync.title")}
      description={t("settings.sync.description")}
      actions={
        data ? (
          <StatusPill tone={unavailable ? "neutral" : "success"}>
            {unavailable ? t("settings.sync.unavailableBadge") : t("common.enabled")}
          </StatusPill>
        ) : null
      }
    >
      <SettingsBody divided={false}>
        {isLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-2xl bg-surface-2/60 p-4 ring-1 ring-border/60 sm:flex-row sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-muted-foreground ring-1 ring-border/70">
              <CloudOff className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-2 text-sm">
              <p className="font-semibold text-foreground">{t("settings.sync.unavailableTitle")}</p>
              <p className="text-pretty text-muted-foreground">{t("settings.sync.unavailableBody")}</p>
              <p className="flex items-start gap-2 text-muted-foreground">
                <Wifi className="mt-0.5 size-4 shrink-0" />
                {t("settings.sync.unavailableOffline")}
              </p>
            </div>
          </div>
        )}
      </SettingsBody>
    </SettingsSection>
  );
}
