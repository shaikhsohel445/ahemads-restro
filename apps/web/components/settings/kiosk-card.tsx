"use client";

import { Copy, ExternalLink, KeyRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useSetKiosk,
  useUpdateBranchSettings,
  type BranchSettings,
} from "@/hooks/use-settings";
import { useI18n } from "@/lib/i18n/context";

// Settings > Customer kiosk. The URL's token is the only credential the public
// kiosk screen has: it can read the menu and place orders, nothing else.
export function KioskCard({
  branchId,
  branch,
}: {
  branchId: string | null;
  branch: BranchSettings;
}) {
  const { t } = useI18n();
  const setKiosk = useSetKiosk(branchId);
  const update = useUpdateBranchSettings(branchId);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const url =
    branch.kioskToken && typeof window !== "undefined"
      ? `${window.location.origin}/kiosk/${branch.kioskToken}`
      : null;

  const run = (action: "enable" | "rotate" | "disable", done: string) =>
    setKiosk.mutate(action, {
      onSuccess: () => {
        toast.success(done);
        setConfirmRotate(false);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : t("settings.kiosk.updateFailed")),
    });
  const save = (dto: { kioskDineInEnabled?: boolean; kioskTakeawayEnabled?: boolean }) =>
    update.mutate(dto, {
      onSuccess: () => toast.success(t("common.saved")),
      onError: (e) => toast.error(e instanceof Error ? e.message : t("settings.saveFailed")),
    });

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.kiosk.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.kiosk.description")}
        </p>
      </div>

      {!branch.kioskToken ? (
        <div>
          <Button onClick={() => run("enable", t("settings.kiosk.enabledToast"))} disabled={setKiosk.isPending}>
            {t("settings.kiosk.enable")}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Label htmlFor="kiosk-url">{t("settings.kiosk.addressLabel")}</Label>
              <div className="flex gap-2">
                <input
                  id="kiosk-url"
                  readOnly
                  dir="ltr"
                  value={url ?? ""}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs text-foreground"
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t("settings.kiosk.copyAddress")}
                  onClick={() =>
                    url &&
                    navigator.clipboard
                      .writeText(url)
                      .then(() => toast.success(t("common.copied")))
                      .catch(() => toast.error(t("settings.kiosk.copyFailed")))
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t("settings.kiosk.openNewTab")}
                  onClick={() => url && window.open(url, "_blank", "noopener")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.kiosk.addressHelp")}
              </p>
            </div>
            {url && (
              <div className="shrink-0 rounded-lg bg-white p-2" aria-label={t("settings.kiosk.qrLabel")}>
                <QRCodeSVG value={url} size={112} marginSize={1} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="kiosk-dine-in">{t("settings.kiosk.offerDineIn")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settings.kiosk.singleOptionHelp")}
              </p>
            </div>
            <Switch
              id="kiosk-dine-in"
              checked={branch.kioskDineInEnabled}
              disabled={update.isPending || (branch.kioskDineInEnabled && !branch.kioskTakeawayEnabled)}
              onCheckedChange={(v) => save({ kioskDineInEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <Label htmlFor="kiosk-takeaway">{t("settings.kiosk.offerTakeaway")}</Label>
            <Switch
              id="kiosk-takeaway"
              checked={branch.kioskTakeawayEnabled}
              disabled={update.isPending || (branch.kioskTakeawayEnabled && !branch.kioskDineInEnabled)}
              onCheckedChange={(v) => save({ kioskTakeawayEnabled: v })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {confirmRotate ? (
              <>
                <span className="text-sm text-foreground">
                  {t("settings.kiosk.rotateConfirm")}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={setKiosk.isPending}
                  onClick={() => run("rotate", t("settings.kiosk.rotatedToast"))}
                >
                  {t("settings.kiosk.rotateYes")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmRotate(false)}>
                  {t("common.cancel")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setConfirmRotate(true)}>
                  <KeyRound className="h-4 w-4" /> {t("settings.kiosk.rotate")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={setKiosk.isPending}
                  onClick={() => run("disable", t("settings.kiosk.disabledToast"))}
                >
                  {t("settings.kiosk.disable")}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
