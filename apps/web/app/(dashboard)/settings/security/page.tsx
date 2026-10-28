"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.security.subtitle")}</p>
      </div>
      <SettingsTabs />

      <Card className="flex max-w-xl flex-col gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("settings.security.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.security.description")}</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-10" />
        ) : recoveryCodes ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">{t("settings.security.isOn")}</p>
            <p className="text-sm text-muted-foreground">
              {t("settings.security.recoveryHelp")}
            </p>
            <div dir="ltr" className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-4 font-mono text-sm">
              {recoveryCodes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(recoveryCodes.join("\n")).then(() => toast.success(t("common.copied")))}>
                {t("common.copy")}
              </Button>
              <Button size="sm" onClick={() => setRecoveryCodes(null)}>{t("settings.security.savedThem")}</Button>
            </div>
          </div>
        ) : status?.enabled ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-foreground">
              {status.recoveryCodesLeft === 1
                ? t("settings.security.onOneCode")
                : t("settings.security.onCodes", { n: status.recoveryCodesLeft })}
            </p>
            {!confirmingDisable ? (
              <div>
                <Button variant="outline" onClick={() => setConfirmingDisable(true)}>{t("settings.security.turnOff")}</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pw">{t("settings.security.yourPassword")}</Label>
                  <PasswordInput id="pw" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dc">{t("settings.security.codeOrRecovery")}</Label>
                  <Input id="dc" dir="ltr" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button
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
                  <Button variant="outline" onClick={() => setConfirmingDisable(false)}>{t("common.cancel")}</Button>
                </div>
              </div>
            )}
          </div>
        ) : pending ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t("settings.security.scanHelp")}
            </p>
            <div className="w-fit rounded-xl bg-white p-3">
              <QRCodeSVG value={pending.otpauthUrl} size={168} />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settings.security.manualKey")}{" "}
              <bdi className="select-all font-mono text-foreground">{pending.secret}</bdi>
            </p>
            <div className="flex gap-2">
              <Input className="w-40" dir="ltr" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
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
              <Button variant="outline" onClick={() => setPending(null)}>{t("common.cancel")}</Button>
            </div>
          </div>
        ) : (
          <div>
            <Button disabled={setup.isPending} onClick={() => setup.mutate(undefined, { onSuccess: setPending, onError: (e) => toast.error(errMsg(e)) })}>
              {t("settings.security.setUp")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
