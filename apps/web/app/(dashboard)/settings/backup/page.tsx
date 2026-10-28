"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RestoreBackupDialog } from "@/components/settings/restore-backup-dialog";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  backupDownloadUrl,
  LOCAL_BACKUP_URL,
  useBackups,
  useBackupStatus,
  useClearBackupConfig,
  useSetBackupConfig,
  useTriggerBackup,
  type BackupEntry,
  type BackupStatusValue,
} from "@/hooks/use-backups";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const STATUS_VARIANT: Record<BackupStatusValue, "outline" | "secondary" | "destructive"> = {
  PENDING: "outline",
  VERIFIED: "secondary",
  FAILED: "destructive",
};

type Translate = (key: string, vars?: Record<string, string | number>) => string;

function formatBytes(t: Translate, bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) {
    return t("settings.backup.kb", { n: formatNumber(bytes / 1024, { maximumFractionDigits: 1 }) });
  }
  return t("settings.backup.mb", {
    n: formatNumber(bytes / (1024 * 1024), { maximumFractionDigits: 1 }),
  });
}

// Cloudflare edition: backups go to the deployment's own R2 bucket (a
// Worker binding), so there is nothing to connect — only the schedule is
// configurable. See apps/api/src/backup/backup.service.ts.
interface ScheduleFormState {
  intervalDays: string;
  retainCount: string;
}

export default function BackupPage() {
  const { t } = useI18n();
  const { data: me } = useCurrentUser();
  const isOwner = me?.user.roleName === "OWNER";
  const { data: status, isLoading: statusLoading } = useBackupStatus();
  const { data: backups, isLoading: backupsLoading } = useBackups();
  const setConfig = useSetBackupConfig();
  const clearConfig = useClearBackupConfig();
  const triggerBackup = useTriggerBackup();

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null);

  const openScheduleForm = () => {
    setScheduleForm({
      intervalDays: String(status?.intervalDays ?? 3),
      retainCount: String(status?.retainCount ?? 2),
    });
  };

  const onSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm) return;
    setConfig.mutate(
      {
        intervalDays: Number(scheduleForm.intervalDays) || undefined,
        retainCount: Number(scheduleForm.retainCount) || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("settings.backup.scheduleSaved"));
          setScheduleForm(null);
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("settings.backup.scheduleSaveFailed")),
      },
    );
  };

  const onResetSchedule = () => {
    if (!confirm(t("settings.backup.resetConfirm"))) return;
    clearConfig.mutate(undefined, {
      onSuccess: () => toast.success(t("settings.backup.resetDone")),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("settings.backup.resetFailed")),
    });
  };

  const onTrigger = () => {
    triggerBackup.mutate(undefined, {
      onSuccess: () => toast.success(t("settings.backup.started")),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("settings.backup.startFailed")),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <SettingsTabs />

      <Card className="flex flex-col gap-2 p-6">
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.backup.drTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.backup.drTimeTravel")}</p>
        <p className="text-sm text-muted-foreground">{t("settings.backup.drPortable")}</p>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-medium text-foreground">{t("settings.backup.downloadTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.backup.downloadDescription")}</p>
          </div>
          <Button render={<a href={LOCAL_BACKUP_URL} download />}>{t("settings.backup.downloadNow")}</Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-medium text-foreground">{t("settings.backup.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.backup.description")}</p>
          </div>
          {status ? <Badge variant="secondary">{t("settings.backup.r2Badge")}</Badge> : null}
        </div>

        {statusLoading || !status ? (
          <Skeleton className="h-32 rounded-lg" />
        ) : scheduleForm ? (
          <form onSubmit={onSaveSchedule} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t("settings.backup.scheduleHelp")}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="b-interval">{t("settings.backup.intervalLabel")}</Label>
                <Input
                  id="b-interval"
                  type="number"
                  min={1}
                  max={30}
                  value={scheduleForm.intervalDays}
                  onChange={(e) =>
                    setScheduleForm((f) => (f ? { ...f, intervalDays: e.target.value } : f))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="b-retain">{t("settings.backup.retainLabel")}</Label>
                <Input
                  id="b-retain"
                  type="number"
                  min={1}
                  max={10}
                  value={scheduleForm.retainCount}
                  onChange={(e) =>
                    setScheduleForm((f) => (f ? { ...f, retainCount: e.target.value } : f))
                  }
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={setConfig.isPending}>
                {setConfig.isPending ? t("common.saving") : t("settings.backup.saveSchedule")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setScheduleForm(null)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
              <div>
                <p className="text-foreground">{t("settings.backup.destination")}</p>
                <p className="text-xs text-muted-foreground">
                  {status.source === "environment"
                    ? t("settings.backup.sourceDefaults")
                    : t("settings.backup.sourceHere")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={openScheduleForm}>
                  {t("settings.backup.changeSchedule")}
                </Button>
                {status.source === "database" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={clearConfig.isPending}
                    onClick={onResetSchedule}
                  >
                    {t("settings.backup.resetSchedule")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat
                label={t("settings.backup.runsEvery")}
                value={t("settings.backup.days", { n: status.intervalDays })}
              />
              <Stat
                label={t("settings.backup.keeps")}
                value={t("settings.backup.backupsCount", { n: status.retainCount })}
              />
              <Stat
                label={t("settings.backup.lastBackup")}
                value={
                  status.lastBackup
                    ? formatDateTime(status.lastBackup.createdAt)
                    : t("settings.backup.never")
                }
              />
              <Stat
                label={t("settings.backup.nextScheduled")}
                value={status.nextScheduledAt ? formatDateTime(status.nextScheduledAt) : "—"}
              />
            </div>

            <div>
              <Button onClick={onTrigger} disabled={triggerBackup.isPending}>
                {triggerBackup.isPending ? t("settings.backup.starting") : t("settings.backup.backUpNow")}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="text-[18px] font-medium text-foreground">{t("settings.backup.history")}</h2>
          <p className="text-sm text-muted-foreground">
            {isOwner ? t("settings.backup.restoreHelp") : t("settings.backup.restoreOwnerOnly")}
          </p>
        </div>

        {backupsLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : backups && backups.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("settings.backup.colStarted")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("settings.backup.colSize")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-foreground">
                    {formatDateTime(b.createdAt)}
                    <div className="text-xs font-normal text-muted-foreground">
                      {b.triggeredById ? t("settings.backup.manual") : t("settings.backup.scheduled")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[b.status]}>
                      {t(`settings.backup.status.${b.status}`)}
                    </Badge>
                    {b.status === "FAILED" && b.failureReason ? (
                      <div className="mt-1 max-w-xs truncate text-xs text-destructive" title={b.failureReason}>
                        {b.failureReason}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBytes(t, b.sizeBytes)}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === "VERIFIED" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          render={<a href={backupDownloadUrl(b.id)} />}
                        >
                          {t("common.download")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          {t("common.download")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={b.status !== "VERIFIED" || !isOwner}
                        title={isOwner ? undefined : t("settings.backup.restoreOwnerOnly")}
                        onClick={() => setRestoreTarget(b)}
                      >
                        {t("settings.backup.restore")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("settings.backup.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.backup.emptyDescription")}</p>
          </div>
        )}
      </Card>

      {restoreTarget ? (
        <RestoreBackupDialog
          key={restoreTarget.id}
          backup={restoreTarget}
          onClose={() => setRestoreTarget(null)}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
