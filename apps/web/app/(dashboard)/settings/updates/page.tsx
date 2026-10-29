"use client";

import { CloudDownload, ExternalLink, Info, Rocket } from "lucide-react";
import { SettingsBody, SettingsCallout, SettingsSection } from "@/components/settings/settings-section";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useUpdateCheck } from "@/hooks/use-updates";
import { useI18n } from "@/lib/i18n/context";

// Cloudflare edition: there is no Docker/CasaOS updater sidecar to drive.
// New versions ship as Cloudflare deployments (Workers + Pages), so this
// screen only shows the running version and explains how updates arrive.
export default function UpdatesPage() {
  const { t } = useI18n();
  const { data, isLoading } = useUpdateCheck();

  return (
    <SettingsSection
      icon={CloudDownload}
      title={t("settings.updates.title")}
      description={t("settings.updates.cloudflareNote")}
    >
      <SettingsBody divided={false}>
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : data ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-2/60 p-4 ring-1 ring-border/60 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground ring-1 ring-primary/10">
                <Rocket className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{t("settings.updates.running")}</p>
                <p className="font-mono text-lg font-semibold text-foreground tabular-nums">
                  <bdi dir="ltr">{data.currentVersion}</bdi>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="success">{t("settings.updates.autoUpdated")}</StatusPill>
              {data.releaseUrl && (
                <a
                  href={data.releaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("settings.updates.releaseNotes")}
                  <ExternalLink className="size-3.5 rtl:-scale-x-100" />
                </a>
              )}
            </div>
          </div>
        ) : null}

        <SettingsCallout icon={Info}>
          <p>{t("settings.updates.noAction")}</p>
        </SettingsCallout>
      </SettingsBody>
    </SettingsSection>
  );
}
