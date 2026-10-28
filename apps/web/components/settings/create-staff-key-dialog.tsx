"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStaffApiKey } from "@/hooks/use-api-keys";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function CreateStaffKeyDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (token: string) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const createKey = useCreateStaffApiKey();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createKey.mutate(
      { name: name.trim() },
      {
        onSuccess: (created) => onCreated(created.token),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.apiKeys.createFailed")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("settings.apiKeys.newPersonalTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sk-name">{t("common.name")}</Label>
            <Input
              id="sk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.apiKeys.personalNamePlaceholder")}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.apiKeys.personalHelp")}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createKey.isPending}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createKey.isPending}>
              {createKey.isPending ? t("settings.creating") : t("settings.apiKeys.createKey")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
