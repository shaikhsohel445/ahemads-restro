"use client";

import { AlertTriangle, FileCheck2, FileCode2, Info, Link2, ListChecks, Send, ShieldCheck, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ListCard,
  ResponsiveList,
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsField,
  SettingsGroupTitle,
  SettingsListBody,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
// VERI*FACTU is Spain-only, so amounts are always euros.
const euro = (cents: number) => formatCurrency(cents / 100, "EUR");

// Message key per record status (settings.verifactu.status.<STATUS>).
const statusKey = (status: VerifactuRecordRow["status"] | string) => `settings.verifactu.status.${status}`;

const STATUS_TONE: Record<string, Tone> = {
  ACCEPTED: "success",
  ACCEPTED_WITH_ERRORS: "warning",
  ERROR: "warning",
  PENDING: "info",
  REJECTED: "danger",
};

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
    <SettingsSection
      icon={FileCheck2}
      title={t("settings.verifactu.title")}
      description={t("settings.verifactu.description")}
      actions={
        <StatusPill tone={s.enabled ? "success" : "neutral"}>
          {s.enabled ? t("common.enabled") : t("common.disabled")}
        </StatusPill>
      }
    >
      <SettingsBody divided={false}>
        <SettingsCallout icon={Info} role="note" title={t("settings.verifactu.notCertifiedTitle")}>
          <p>{t("settings.verifactu.notCertifiedBody")}</p>
        </SettingsCallout>

        {s.problems.length > 0 && (
          <SettingsCallout icon={AlertTriangle} tone="danger">
            <ul className="list-disc ps-4 text-status-danger">
              {s.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </SettingsCallout>
        )}
      </SettingsBody>

      <SettingsBody>
        <SettingsRow htmlFor="vf-enabled" label={t("settings.verifactu.enable")} help={t("settings.verifactu.enableHelp")}>
          <Switch id="vf-enabled" checked={enabled} onCheckedChange={setEnabled} />
        </SettingsRow>
        <SettingsField label={t("settings.verifactu.environment")} htmlFor="vf-env" help={t("settings.verifactu.envHelp")}>
          <select
            id="vf-env"
            className="h-9 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as VerifactuEnvironment)}
          >
            <option value="TEST">{t("settings.verifactu.envTest")}</option>
            <option value="PRODUCTION">{t("settings.verifactu.envProduction")}</option>
          </select>
        </SettingsField>
        <SettingsField
          label={t("settings.verifactu.series")}
          htmlFor="vf-series"
          help={
            <>
              {t("settings.verifactu.nextNumber")}{" "}
              <bdi className="font-mono text-foreground">
                {s.seriesPrefix}-{String(s.nextNumber).padStart(6, "0")}
              </bdi>
            </>
          }
        >
          <Input
            id="vf-series"
            dir="ltr"
            className="w-40 font-mono"
            value={series}
            maxLength={12}
            disabled={hasRecords}
            onChange={(e) => setSeries(e.target.value)}
          />
        </SettingsField>
      </SettingsBody>
      <SaveBar className="static rounded-none">
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
      </SaveBar>

      <SettingsBody>
        <SettingsGroupTitle title={t("settings.verifactu.certTitle")} description={t("settings.verifactu.certDescription")} />
        <div className="flex flex-col gap-4 py-4 @2xl:py-5">
          {s.hasCertificate ? (
            <div className="flex items-start gap-3 rounded-xl bg-status-success-soft p-3.5 text-sm ring-1 ring-status-success/20">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-status-success" />
              <p className="min-w-0 text-foreground">
                {t("settings.verifactu.certLoaded")} <bdi className="font-mono text-xs break-all">{s.certSubject}</bdi>
                {s.certExpiresAt && (
                  <span className="text-muted-foreground">
                    {" · "}
                    {t("settings.verifactu.certExpires", { date: formatDate(s.certExpiresAt) })}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("settings.verifactu.certNone")}</p>
          )}
          <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] @2xl:items-end">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="vf-cert" className="text-sm font-medium text-foreground">
                {t("settings.verifactu.certFile")}
              </label>
              <input
                id="vf-cert"
                ref={file}
                type="file"
                accept=".p12,.pfx"
                className="h-9 w-full min-w-0 rounded-xl border border-input bg-card text-sm text-muted-foreground file:me-3 file:h-full file:border-0 file:border-e file:border-border file:bg-surface-2 file:px-3 file:text-sm file:font-medium file:text-foreground"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="vf-pass" className="text-sm font-medium text-foreground">
                {t("settings.verifactu.certPassword")}
              </label>
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
              <Upload className="size-4" />
              {t("common.upload")}
            </Button>
          </div>
        </div>
      </SettingsBody>
    </SettingsSection>
  );
}

function Records({ branchId, s }: { branchId: string; s: VerifactuSettings }) {
  const { t } = useI18n();
  const { data, isLoading } = useVerifactuRecords(branchId);
  const { send, verify } = useVerifactuActions(branchId);
  const [result, setResult] = useState<string | null>(null);

  const statusLabel = (r: VerifactuRecordRow) => (
    <>
      <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>{t(statusKey(r.status))}</StatusPill>
      {r.errorText && (
        <span className="mt-1 block max-w-xs text-xs whitespace-normal text-muted-foreground">
          {r.errorCode ? `${r.errorCode}: ` : ""}
          {r.errorText}
        </span>
      )}
    </>
  );

  return (
    <SettingsSection
      icon={ListChecks}
      title={t("settings.verifactu.recordsTitle")}
      description={
        Object.entries(s.counts)
          .map(([k, n]) => `${n} ${t(statusKey(k)) === statusKey(k) ? k : t(statusKey(k))}`)
          .join(" · ") || t("settings.verifactu.noRecords")
      }
      actions={
        <>
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
            <Link2 className="size-3.5" />
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
            <Send className="size-3.5 rtl:-scale-x-100" />
            {t("settings.verifactu.sendNow")}
          </Button>
          <Button variant="outline" size="sm" render={<a href={`/api/v1/verifactu/export.xml?branchId=${encodeURIComponent(branchId)}`} />}>
            <FileCode2 className="size-3.5" />
            {t("settings.verifactu.exportXml")}
          </Button>
        </>
      }
    >
      {result && (
        <SettingsListBody className="py-3 sm:py-3">
          <p role="status" className="text-sm text-foreground">
            {result}
          </p>
        </SettingsListBody>
      )}
      {isLoading ? (
        <SettingsListBody>
          <Skeleton className="h-24 rounded-xl" />
        </SettingsListBody>
      ) : !data || data.items.length === 0 ? (
        <SettingsListBody>
          <EmptyState compact icon={ListChecks} title={t("settings.verifactu.recordsEmpty")} />
        </SettingsListBody>
      ) : (
        <ResponsiveList
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("settings.verifactu.colInvoice")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead className="text-end">{t("common.total")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((r) => (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="font-mono text-xs">
                      <bdi className="text-foreground">{r.invoiceNumber}</bdi>{" "}
                      <span className="text-muted-foreground">{r.invoiceType}</span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <bdi>{r.issueDate}</bdi>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{euro(r.totalCents)}</TableCell>
                    <TableCell>{statusLabel(r)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
          cards={data.items.map((r) => (
            <ListCard key={r.id} className="gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 font-mono text-xs">
                  <bdi className="text-foreground">{r.invoiceNumber}</bdi>{" "}
                  <span className="text-muted-foreground">{r.invoiceType}</span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">{euro(r.totalCents)}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">{statusLabel(r)}</div>
                <bdi className="shrink-0 text-xs text-muted-foreground tabular-nums">{r.issueDate}</bdi>
              </div>
            </ListCard>
          ))}
        />
      )}
    </SettingsSection>
  );
}

export default function VerifactuPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data, isLoading } = useVerifactuSettings(branchId);
  const country = useSettings(branchId).data?.branch.country;

  return country && country !== "ES" ? (
    <EmptyState icon={FileCheck2} title={t("settings.tabs.verifactu")} description={t("settings.verifactu.spainOnly")} />
  ) : isLoading || !data || !branchId ? (
    <Skeleton className="h-72 rounded-2xl" />
  ) : (
    <>
      <SettingsForm key={`${branchId}|${data.enabled}|${data.environment}|${data.seriesPrefix}`} branchId={branchId} s={data} />
      <Records branchId={branchId} s={data} />
    </>
  );
}
