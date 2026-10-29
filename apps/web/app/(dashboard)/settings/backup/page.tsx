"use client";

import {
  Archive,
  CalendarClock,
  CloudUpload,
  DatabaseBackup,
  Download,
  History,
  LifeBuoy,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RestoreBackupDialog } from "@/components/settings/restore-backup-dialog";
import {
  ListCard,
  ResponsiveList,
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsField,
  SettingsListBody,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
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

const STATUS_TONE: Record<BackupStatusValue, Tone> = {
  PENDING: "warning",
  VERIFIED: "success",
  FAILED: "danger",
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

  const downloadButton = (b: BackupEntry) =>
    b.status === "VERIFIED" ? (
      <Button size="sm" variant="ghost" render={<a href={backupDownloadUrl(b.id)} />}>
        <Download className="size-3.5" />
        {t("common.download")}
      </Button>
    ) : (
      <Button size="sm" variant="ghost" disabled>
        <Download className="size-3.5" />
        {t("common.download")}
      </Button>
    );

  const restoreButton = (b: BackupEntry) => (
    <Button
      size="sm"
      variant="destructive"
      disabled={b.status !== "VERIFIED" || !isOwner}
      title={isOwner ? undefined : t("settings.backup.restoreOwnerOnly")}
      onClick={() => setRestoreTarget(b)}
    >
      <RotateCcw className="size-3.5" />
      {t("settings.backup.restore")}
    </Button>
  );

  const statusCell = (b: BackupEntry) => (
    <>
      <StatusPill tone={STATUS_TONE[b.status]} pulse={b.status === "PENDING"}>
        {t(`settings.backup.status.${b.status}`)}
      </StatusPill>
      {b.status === "FAILED" && b.failureReason ? (
        <div className="mt-1 max-w-xs truncate text-xs text-destructive" title={b.failureReason}>
          {b.failureReason}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <SettingsSection icon={LifeBuoy} title={t("settings.backup.drTitle")}>
        <SettingsBody divided={false}>
          <SettingsCallout icon={History} tone="info">
            <p>{t("settings.backup.drTimeTravel")}</p>
          </SettingsCallout>
          <p className="text-sm text-muted-foreground">{t("settings.backup.drPortable")}</p>
        </SettingsBody>
      </SettingsSection>

      <SettingsSection
        icon={Download}
        title={t("settings.backup.downloadTitle")}
        description={t("settings.backup.downloadDescription")}
        actions={
          <Button render={<a href={LOCAL_BACKUP_URL} download />}>
            <Download className="size-4" />
            {t("settings.backup.downloadNow")}
          </Button>
        }
      />

      <SettingsSection
        icon={DatabaseBackup}
        title={t("settings.backup.title")}
        description={t("settings.backup.description")}
        actions={status ? <Badge variant="gold">{t("settings.backup.r2Badge")}</Badge> : null}
      >
        {statusLoading || !status ? (
          <SettingsBody divided={false}>
            <Skeleton className="h-32 rounded-xl" />
          </SettingsBody>
        ) : scheduleForm ? (
          <form onSubmit={onSaveSchedule}>
            <SettingsBody>
              <p className="py-4 text-sm text-muted-foreground">{t("settings.backup.scheduleHelp")}</p>
              <SettingsField label={t("settings.backup.intervalLabel")} htmlFor="b-interval">
                <Input
                  id="b-interval"
                  type="number"
                  min={1}
                  max={30}
                  className="w-32 tabular-nums"
                  value={scheduleForm.intervalDays}
                  onChange={(e) =>
                    setScheduleForm((f) => (f ? { ...f, intervalDays: e.target.value } : f))
                  }
                  required
                />
              </SettingsField>
              <SettingsField label={t("settings.backup.retainLabel")} htmlFor="b-retain">
                <Input
                  id="b-retain"
                  type="number"
                  min={1}
                  max={10}
                  className="w-32 tabular-nums"
                  value={scheduleForm.retainCount}
                  onChange={(e) =>
                    setScheduleForm((f) => (f ? { ...f, retainCount: e.target.value } : f))
                  }
                  required
                />
              </SettingsField>
            </SettingsBody>
            <SaveBar>
              <Button type="button" variant="ghost" onClick={() => setScheduleForm(null)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={setConfig.isPending}>
                {setConfig.isPending ? t("common.saving") : t("settings.backup.saveSchedule")}
              </Button>
            </SaveBar>
          </form>
        ) : (
          <>
            <SettingsBody divided={false}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2/60 p-3.5 ring-1 ring-border/60">
                <div className="flex min-w-0 items-start gap-3">
                  <CloudUpload className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{t("settings.backup.destination")}</p>
                    <p className="text-xs text-muted-foreground">
                      {status.source === "environment"
                        ? t("settings.backup.sourceDefaults")
                        : t("settings.backup.sourceHere")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
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
                  <Button size="sm" variant="outline" onClick={openScheduleForm}>
                    <CalendarClock className="size-3.5" />
                    {t("settings.backup.changeSchedule")}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-4">
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
            </SettingsBody>
            <SaveBar className="static">
              <Button onClick={onTrigger} disabled={triggerBackup.isPending}>
                <DatabaseBackup className="size-4" />
                {triggerBackup.isPending ? t("settings.backup.starting") : t("settings.backup.backUpNow")}
              </Button>
            </SaveBar>
          </>
        )}
      </SettingsSection>

      <SettingsSection
        icon={Archive}
        title={t("settings.backup.history")}
        description={isOwner ? t("settings.backup.restoreHelp") : t("settings.backup.restoreOwnerOnly")}
      >
        {backupsLoading ? (
          <SettingsListBody className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </SettingsListBody>
        ) : backups && backups.length > 0 ? (
          <ResponsiveList
            table={
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
                      <TableCell>
                        <p className="font-medium text-foreground tabular-nums">{formatDateTime(b.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.triggeredById ? t("settings.backup.manual") : t("settings.backup.scheduled")}
                        </p>
                      </TableCell>
                      <TableCell>{statusCell(b)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{formatBytes(t, b.sizeBytes)}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          {downloadButton(b)}
                          {restoreButton(b)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
            cards={backups.map((b) => (
              <ListCard key={b.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground tabular-nums">{formatDateTime(b.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.triggeredById ? t("settings.backup.manual") : t("settings.backup.scheduled")}
                      {" · "}
                      <span className="tabular-nums">{formatBytes(t, b.sizeBytes)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end">{statusCell(b)}</div>
                </div>
                <div className="flex items-center justify-end gap-1 border-t border-border/70 pt-2">
                  {downloadButton(b)}
                  {restoreButton(b)}
                </div>
              </ListCard>
            ))}
          />
        ) : (
          <SettingsListBody>
            <EmptyState
              compact
              icon={Archive}
              title={t("settings.backup.emptyTitle")}
              description={t("settings.backup.emptyDescription")}
            />
          </SettingsListBody>
        )}
      </SettingsSection>

      {restoreTarget ? (
        <RestoreBackupDialog
          key={restoreTarget.id}
          backup={restoreTarget}
          onClose={() => setRestoreTarget(null)}
        />
      ) : null}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl bg-card p-3 ring-1 ring-border/70">
      <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}
