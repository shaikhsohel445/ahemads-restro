"use client";

import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateCheck } from "@/hooks/use-updates";
import { useI18n } from "@/lib/i18n/context";

// Cloudflare edition: there is no Docker/CasaOS updater sidecar to drive.
// New versions ship as Cloudflare deployments (Workers + Pages), so this
// screen only shows the running version and explains how updates arrive.
export default function UpdatesPage() {
  const { t } = useI18n();
  const { data, isLoading } = useUpdateCheck();

  return (
    <div className="flex flex-col gap-6">
      <SettingsTabs />

      <Card className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="text-base font-medium">{t("settings.updates.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.updates.cloudflareNote")}</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : data ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("settings.updates.running")}</span>
              <Badge variant="outline">
                <bdi>{data.currentVersion}</bdi>
              </Badge>
            </div>
            {data.releaseUrl && (
              <a
                href={data.releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="self-start text-sm text-muted-foreground underline underline-offset-3 hover:text-foreground"
              >
                {t("settings.updates.releaseNotes")}
              </a>
            )}
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">{t("settings.updates.noAction")}</p>
      </Card>
    </div>
  );
}
