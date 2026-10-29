"use client";

import { Copy, ExternalLink, KeyRound, TabletSmartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { SaveBar, SettingsBody, SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/status-pill";
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
    <SettingsSection
      id="kiosk"
      icon={TabletSmartphone}
      title={t("settings.kiosk.title")}
      description={t("settings.kiosk.description")}
      actions={
        <StatusPill tone={branch.kioskToken ? "success" : "neutral"}>
          {branch.kioskToken ? t("common.enabled") : t("common.disabled")}
        </StatusPill>
      }
    >
      {!branch.kioskToken ? (
        <SaveBar className="static rounded-b-2xl">
          <Button onClick={() => run("enable", t("settings.kiosk.enabledToast"))} disabled={setKiosk.isPending}>
            {t("settings.kiosk.enable")}
          </Button>
        </SaveBar>
      ) : (
        <>
          <SettingsBody>
            <div className="flex flex-col gap-4 py-4 @2xl:py-5 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label htmlFor="kiosk-url">{t("settings.kiosk.addressLabel")}</Label>
                <div className="flex gap-2">
                  <input
                    id="kiosk-url"
                    readOnly
                    dir="ltr"
                    value={url ?? ""}
                    onFocus={(e) => e.currentTarget.select()}
                    className="h-9 min-w-0 flex-1 rounded-xl border border-input bg-surface-2/60 px-3 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t("settings.kiosk.openNewTab")}
                    onClick={() => url && window.open(url, "_blank", "noopener")}
                  >
                    <ExternalLink className="size-4 rtl:-scale-x-100" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("settings.kiosk.addressHelp")}</p>
              </div>
              {url && (
                <div
                  className="w-fit shrink-0 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-border/70"
                  aria-label={t("settings.kiosk.qrLabel")}
                >
                  <QRCodeSVG value={url} size={112} marginSize={1} />
                </div>
              )}
            </div>

            <SettingsRow
              htmlFor="kiosk-dine-in"
              label={t("settings.kiosk.offerDineIn")}
              help={t("settings.kiosk.singleOptionHelp")}
            >
              <Switch
                id="kiosk-dine-in"
                checked={branch.kioskDineInEnabled}
                disabled={update.isPending || (branch.kioskDineInEnabled && !branch.kioskTakeawayEnabled)}
                onCheckedChange={(v) => save({ kioskDineInEnabled: v })}
              />
            </SettingsRow>
            <SettingsRow htmlFor="kiosk-takeaway" label={t("settings.kiosk.offerTakeaway")}>
              <Switch
                id="kiosk-takeaway"
                checked={branch.kioskTakeawayEnabled}
                disabled={update.isPending || (branch.kioskTakeawayEnabled && !branch.kioskDineInEnabled)}
                onCheckedChange={(v) => save({ kioskTakeawayEnabled: v })}
              />
            </SettingsRow>
          </SettingsBody>

          <SaveBar className="static">
            {confirmRotate ? (
              <>
                <span className="me-auto text-sm text-foreground">{t("settings.kiosk.rotateConfirm")}</span>
                <Button variant="ghost" size="sm" onClick={() => setConfirmRotate(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={setKiosk.isPending}
                  onClick={() => run("rotate", t("settings.kiosk.rotatedToast"))}
                >
                  {t("settings.kiosk.rotateYes")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={setKiosk.isPending}
                  onClick={() => run("disable", t("settings.kiosk.disabledToast"))}
                >
                  {t("settings.kiosk.disable")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmRotate(true)}>
                  <KeyRound className="size-4" /> {t("settings.kiosk.rotate")}
                </Button>
              </>
            )}
          </SaveBar>
        </>
      )}
    </SettingsSection>
  );
}
