"use client";

import { Copy, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import {
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useTwoFactorActions, useTwoFactorStatus } from "@/hooks/use-two-factor";
import { ApiError } from "@/lib/api";
import { translate, useI18n } from "@/lib/i18n/context";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));

export default function SecurityPage() {
  const { t } = useI18n();
  const { data: status, isLoading } = useTwoFactorStatus();
  const { setup, enable, disable } = useTwoFactorActions();
  const [pending, setPending] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [password, setPassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  const isOn = !!status?.enabled || !!recoveryCodes;

  return (
    <SettingsSection
      icon={LockKeyhole}
      title={t("settings.security.title")}
      description={t("settings.security.description")}
      actions={
        status ? (
          <StatusPill tone={isOn ? "success" : "neutral"}>
            {isOn ? t("settings.security.statusOn") : t("settings.security.statusOff")}
          </StatusPill>
        ) : null
      }
    >
      {isLoading ? (
        <SettingsBody divided={false}>
          <Skeleton className="h-16 rounded-xl" />
        </SettingsBody>
      ) : recoveryCodes ? (
        <>
          <SettingsBody divided={false}>
            <SettingsCallout icon={ShieldCheck} tone="success" title={t("settings.security.isOn")}>
              <p>{t("settings.security.recoveryHelp")}</p>
            </SettingsCallout>
            <div
              dir="ltr"
              className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-3 font-mono text-sm ring-1 ring-border/70 sm:grid-cols-3 sm:p-4"
            >
              {recoveryCodes.map((c) => (
                <span key={c} className="rounded-lg bg-card px-2.5 py-1.5 text-center tracking-wide ring-1 ring-border/60">
                  {c}
                </span>
              ))}
            </div>
          </SettingsBody>
          <SaveBar className="static">
            <Button
              variant="outline"
              onClick={() =>
                navigator.clipboard.writeText(recoveryCodes.join("\n")).then(() => toast.success(t("common.copied")))
              }
            >
              <Copy className="size-4" />
              {t("common.copy")}
            </Button>
            <Button onClick={() => setRecoveryCodes(null)}>{t("settings.security.savedThem")}</Button>
          </SaveBar>
        </>
      ) : status?.enabled ? (
        <>
          <SettingsBody divided={false}>
            <div className="flex items-center gap-3 rounded-xl bg-status-success-soft p-3.5 ring-1 ring-status-success/20">
              <ShieldCheck className="size-5 shrink-0 text-status-success" />
              <p className="text-sm font-medium text-foreground">
                {status.recoveryCodesLeft === 1
                  ? t("settings.security.onOneCode")
                  : t("settings.security.onCodes", { n: status.recoveryCodesLeft })}
              </p>
            </div>
            {confirmingDisable && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pw">{t("settings.security.yourPassword")}</Label>
                  <PasswordInput
                    id="pw"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dc">{t("settings.security.codeOrRecovery")}</Label>
                  <Input
                    id="dc"
                    dir="ltr"
                    className="font-mono"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </SettingsBody>
          <SaveBar className="static">
            {!confirmingDisable ? (
              <Button variant="outline" onClick={() => setConfirmingDisable(true)}>
                {t("settings.security.turnOff")}
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setConfirmingDisable(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={!password || !disableCode || disable.isPending}
                  onClick={() =>
                    disable.mutate(
                      { password, code: disableCode },
                      {
                        onSuccess: () => {
                          toast.success(t("settings.security.turnedOff"));
                          setConfirmingDisable(false);
                          setPassword("");
                          setDisableCode("");
                        },
                        onError: (e) => toast.error(errMsg(e)),
                      },
                    )
                  }
                >
                  {t("settings.security.turnOff")}
                </Button>
              </>
            )}
          </SaveBar>
        </>
      ) : pending ? (
        <>
          <SettingsBody divided={false}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="w-fit shrink-0 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border/70">
                <QRCodeSVG value={pending.otpauthUrl} size={168} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t("settings.security.scanHelp")}</p>
                <div className="flex flex-col gap-1.5 rounded-xl bg-surface-2 p-3 ring-1 ring-border/70">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <KeyRound className="size-3.5" />
                    {t("settings.security.manualKey")}
                  </p>
                  <bdi dir="ltr" className="font-mono text-sm break-all text-foreground select-all">
                    {pending.secret}
                  </bdi>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="otp">{t("settings.security.codeLabel")}</Label>
                  <Input
                    id="otp"
                    className="h-11 w-44 text-center font-mono text-lg tracking-[0.3em]"
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SettingsBody>
          <SaveBar className="static">
            <Button variant="ghost" onClick={() => setPending(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={code.trim().length !== 6 || enable.isPending}
              onClick={() =>
                enable.mutate(code.trim(), {
                  onSuccess: (r) => {
                    setRecoveryCodes(r.recoveryCodes);
                    setPending(null);
                    setCode("");
                  },
                  onError: (e) => toast.error(errMsg(e)),
                })
              }
            >
              {t("settings.security.turnOn")}
            </Button>
          </SaveBar>
        </>
      ) : (
        <>
          <SettingsBody divided={false}>
            <SettingsCallout icon={ShieldAlert} tone="warning" title={t("settings.security.offTitle")}>
              <p>{t("settings.security.offBody")}</p>
            </SettingsCallout>
          </SettingsBody>
          <SaveBar className="static">
            <Button
              disabled={setup.isPending}
              onClick={() => setup.mutate(undefined, { onSuccess: setPending, onError: (e) => toast.error(errMsg(e)) })}
            >
              <ShieldCheck className="size-4" />
              {t("settings.security.setUp")}
            </Button>
          </SaveBar>
        </>
      )}
    </SettingsSection>
  );
}
