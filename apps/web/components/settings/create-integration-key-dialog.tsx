"use client";

import { useState } from "react";
import { toast } from "sonner";
import { INTEGRATION_SCOPES, type IntegrationScope } from "@ahemads-restro/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranch } from "@/hooks/use-branch";
import { useCreateIntegrationApiKey } from "@/hooks/use-api-keys";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

const ALL_LOCATIONS = "__all__";

// Conditional mount, not open-prop + reset-effect — same pattern as
// RestoreBackupDialog/CreateRoleDialog, so form state always starts fresh.
export function CreateIntegrationKeyDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (token: string) => void;
}) {
  const { t } = useI18n();
  const { branches } = useBranch();
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState<string>(ALL_LOCATIONS);
  const [scopes, setScopes] = useState<IntegrationScope[]>([]);
  const createKey = useCreateIntegrationApiKey();

  const toggleScope = (key: IntegrationScope) => {
    setScopes((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scopes.length === 0) {
      toast.error(t("settings.apiKeys.scopeRequired"));
      return;
    }
    createKey.mutate(
      { name: name.trim(), branchId: branchId === ALL_LOCATIONS ? undefined : branchId, scopes },
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
            <DialogTitle>{t("settings.apiKeys.newIntegrationTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ik-name">{t("common.name")}</Label>
            <Input
              id="ik-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.apiKeys.integrationNamePlaceholder")}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ik-branch">{t("settings.apiKeys.location")}</Label>
            <Select value={branchId} onValueChange={(v) => setBranchId(v ?? ALL_LOCATIONS)}>
              <SelectTrigger id="ik-branch">
                <SelectValue placeholder={t("settings.apiKeys.allLocations")}>
                  {(value: string | null) =>
                    !value || value === ALL_LOCATIONS
                      ? t("settings.apiKeys.allLocations")
                      : (branches.find((b) => b.id === value)?.name ?? t("settings.apiKeys.allLocations"))
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>{t("settings.apiKeys.allLocations")}</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.apiKeys.locationHelp")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("settings.roles.permissions")}</Label>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              {INTEGRATION_SCOPES.map((scope) => (
                <label key={scope.key} className="flex items-start gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={scopes.includes(scope.key)}
                    onCheckedChange={() => toggleScope(scope.key)}
                    className="mt-0.5"
                  />
                  <span>
                    {t(`settings.scope.${scope.key}.label`)}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t(`settings.scope.${scope.key}.description`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
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
