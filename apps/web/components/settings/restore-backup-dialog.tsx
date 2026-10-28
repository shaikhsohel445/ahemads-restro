"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestoreBackup, type BackupEntry } from "@/hooks/use-backups";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const CONFIRM_WORD = "RESTORE";

// Mounted only while a specific backup is targeted for restore (see
// BackupPage) — conditional mount, not an open-prop + reset-effect, so the
// typed confirmation text always starts empty on a fresh open, same
// pattern as CreateRoleDialog/EditRoleDialog. Mirrors zulivio's actual
// type-"RESTORE"-to-confirm interaction (~/zulivio/apps/web/src/app/(app)/
// settings/page.tsx) rather than reinventing the confirmation UX.
export function RestoreBackupDialog({
  backup,
  onClose,
}: {
  backup: BackupEntry;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState("");
  const restoreBackup = useRestoreBackup();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== CONFIRM_WORD) return;
    restoreBackup.mutate(
      { id: backup.id, dto: { confirm: CONFIRM_WORD } },
      {
        onSuccess: () => {
          toast.success(t("settings.backup.restoreDone"));
          onClose();
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("settings.backup.restoreFailed")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("settings.backup.restoreTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>
              {t("settings.backup.restoreWarning", { date: formatDateTime(backup.createdAt) })}
            </p>
            <p>
              {t("settings.backup.restoreTypeBefore")}{" "}
              <code dir="ltr" className="rounded bg-background/50 px-1 font-mono">
                {CONFIRM_WORD}
              </code>{" "}
              {t("settings.backup.restoreTypeAfter")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restore-confirm">{t("settings.backup.confirmation")}</Label>
            <Input
              id="restore-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              dir="ltr"
              autoFocus
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={restoreBackup.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmText !== CONFIRM_WORD || restoreBackup.isPending}
            >
              {restoreBackup.isPending ? t("settings.backup.restoring") : t("settings.backup.confirmRestore")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
