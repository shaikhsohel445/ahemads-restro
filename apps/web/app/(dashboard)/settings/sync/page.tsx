"use client";

import { CloudOff } from "lucide-react";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="flex flex-col gap-6">
      <SettingsTabs />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-medium text-foreground">{t("settings.sync.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.sync.description")}</p>
          </div>
          {data ? (
            <Badge variant="outline">
              {unavailable ? t("settings.sync.unavailableBadge") : t("common.enabled")}
            </Badge>
          ) : null}
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-4">
            <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-foreground">{t("settings.sync.unavailableTitle")}</p>
              <p className="text-muted-foreground">{t("settings.sync.unavailableBody")}</p>
              <p className="text-muted-foreground">{t("settings.sync.unavailableOffline")}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
