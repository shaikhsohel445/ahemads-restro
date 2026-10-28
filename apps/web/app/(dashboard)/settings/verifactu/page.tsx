"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useBranch } from "@/hooks/use-branch";
import { useSettings } from "@/hooks/use-settings";
import {
  useVerifactuActions,
  useVerifactuRecords,
  useVerifactuSettings,
  type VerifactuEnvironment,
  type VerifactuRecordRow,
  type VerifactuSettings,
} from "@/hooks/use-verifactu";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
// VERI*FACTU is Spain-only, so amounts are always euros.
const euro = (cents: number) => formatCurrency(cents / 100, "EUR");

// Message key per record status (settings.verifactu.status.<STATUS>).
const statusKey = (status: VerifactuRecordRow["status"] | string) => `settings.verifactu.status.${status}`;

function SettingsForm({ branchId, s }: { branchId: string; s: VerifactuSettings }) {
  const { t } = useI18n();
  const { save, certificate } = useVerifactuActions(branchId);
  const [enabled, setEnabled] = useState(s.enabled);
  const [environment, setEnvironment] = useState<VerifactuEnvironment>(s.environment);
  const [series, setSeries] = useState(s.seriesPrefix);
  const [password, setPassword] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const hasRecords = Object.values(s.counts).some((n) => n > 0);

  return (
    <Card className="flex max-w-3xl flex-col gap-5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("settings.verifactu.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.verifactu.description")}
        </p>
      </div>

      <div role="note" className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <strong>{t("settings.verifactu.notCertifiedTitle")}</strong> {t("settings.verifactu.notCertifiedBody")}
      </div>

      {s.problems.length > 0 && (
        <ul className="list-disc rounded-xl border border-destructive/30 bg-destructive/5 p-4 ps-8 text-sm text-destructive">
          {s.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="vf-enabled">{t("settings.verifactu.enable")}</Label>
          <p className="text-xs text-muted-foreground">{t("settings.verifactu.enableHelp")}</p>
        </div>
        <Switch id="vf-enabled" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vf-env">{t("settings.verifactu.environment")}</Label>
          <select
            id="vf-env"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as VerifactuEnvironment)}
          >
            <option value="TEST">{t("settings.verifactu.envTest")}</option>
            <option value="PRODUCTION">{t("settings.verifactu.envProduction")}</option>
          </select>
          <p className="text-xs text-muted-foreground">{t("settings.verifactu.envHelp")}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vf-series">{t("settings.verifactu.series")}</Label>
          <Input id="vf-series" dir="ltr" value={series} maxLength={12} disabled={hasRecords} onChange={(e) => setSeries(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            {t("settings.verifactu.nextNumber")}{" "}
            <bdi>
              {s.seriesPrefix}-{String(s.nextNumber).padStart(6, "0")}
            </bdi>
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={save.isPending}
          onClick={() =>
            save.mutate(
              { enabled, environment, seriesPrefix: series },
              { onSuccess: () => toast.success(t("common.saved")), onError: (e) => toast.error(errMsg(e)) },
            )
          }
        >
          {t("common.save")}
        </Button>
      </div>

      <hr className="border-border" />

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-medium text-foreground">{t("settings.verifactu.certTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("settings.verifactu.certDescription")}
          </p>
        </div>
        {s.hasCertificate ? (
          <p className="text-sm">
            {t("settings.verifactu.certLoaded")} <bdi className="font-mono text-xs">{s.certSubject}</bdi>
            {s.certExpiresAt && (
              <> · {t("settings.verifactu.certExpires", { date: formatDate(s.certExpiresAt) })}</>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("settings.verifactu.certNone")}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vf-cert">{t("settings.verifactu.certFile")}</Label>
            <input id="vf-cert" ref={file} type="file" accept=".p12,.pfx" className="text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vf-pass">{t("settings.verifactu.certPassword")}</Label>
            <Input id="vf-pass" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            variant="outline"
            disabled={certificate.isPending}
            onClick={() => {
              const f = file.current?.files?.[0];
              if (!f) return toast.error(t("settings.verifactu.certChooseFile"));
              certificate.mutate(
                { file: f, password },
                {
                  onSuccess: () => {
                    setPassword("");
                    if (file.current) file.current.value = "";
                    toast.success(t("settings.verifactu.certSaved"));
                  },
                  onError: (e) => toast.error(errMsg(e)),
                },
              );
            }}
          >
            {t("common.upload")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Records({ branchId, s }: { branchId: string; s: VerifactuSettings }) {
  const { t } = useI18n();
  const { data, isLoading } = useVerifactuRecords(branchId);
  const { send, verify } = useVerifactuActions(branchId);
  const [result, setResult] = useState<string | null>(null);

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("settings.verifactu.recordsTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {Object.entries(s.counts)
              .map(([k, n]) => `${n} ${t(statusKey(k)) === statusKey(k) ? k : t(statusKey(k))}`)
              .join(" · ") || t("settings.verifactu.noRecords")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={verify.isPending}
            onClick={() =>
              verify.mutate(undefined, {
                onSuccess: (r) =>
                  setResult(
                    r.ok
                      ? t("settings.verifactu.chainIntact", { n: r.checked })
                      : t("settings.verifactu.chainBroken", {
                          n: r.brokenAt,
                          env: t(`settings.verifactu.env.${r.environment}`),
                          reason: r.reason,
                        }),
                  ),
                onError: (e) => toast.error(errMsg(e)),
              })
            }
          >
            {t("settings.verifactu.checkChain")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={send.isPending}
            onClick={() =>
              send.mutate(undefined, {
                onSuccess: (r) => toast.success(
                    r.sent
                      ? t("settings.verifactu.sent", { n: r.sent })
                      : t("settings.verifactu.nothingToSend"),
                  ),
                onError: (e) => toast.error(errMsg(e)),
              })
            }
          >
            {t("settings.verifactu.sendNow")}
          </Button>
          <Button variant="outline" size="sm" render={<a href={`/api/v1/verifactu/export.xml?branchId=${encodeURIComponent(branchId)}`} />}>
            {t("settings.verifactu.exportXml")}
          </Button>
        </div>
      </div>
      {result && (
        <p role="status" className="text-sm text-foreground">
          {result}
        </p>
      )}
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("settings.verifactu.recordsEmpty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pe-4">{t("settings.verifactu.colInvoice")}</th>
                <th className="py-2 pe-4">{t("common.date")}</th>
                <th className="py-2 pe-4 text-end">{t("common.total")}</th>
                <th className="py-2 pe-4">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="py-2 pe-4 font-mono text-xs">
                    <bdi>{r.invoiceNumber}</bdi> <span className="text-muted-foreground">{r.invoiceType}</span>
                  </td>
                  <td className="py-2 pe-4">
                    <bdi>{r.issueDate}</bdi>
                  </td>
                  <td className="py-2 pe-4 text-end tabular-nums">{euro(r.totalCents)}</td>
                  <td className={cn("py-2 pe-4", r.status === "REJECTED" && "text-destructive")}>
                    {t(statusKey(r.status))}
                    {r.errorText && <span className="block text-xs text-muted-foreground">{r.errorCode ? `${r.errorCode}: ` : ""}{r.errorText}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function VerifactuPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data, isLoading } = useVerifactuSettings(branchId);
  const country = useSettings(branchId).data?.branch.country;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>
      <SettingsTabs />
      {country && country !== "ES" ? (
        <Card className="max-w-3xl p-6 text-sm">
          {t("settings.verifactu.spainOnly")}
        </Card>
      ) : isLoading || !data || !branchId ? (
        <Skeleton className="h-72 max-w-3xl rounded-xl" />
      ) : (
        <>
          <SettingsForm key={`${branchId}|${data.enabled}|${data.environment}|${data.seriesPrefix}`} branchId={branchId} s={data} />
          <Records branchId={branchId} s={data} />
        </>
      )}
    </div>
  );
}
