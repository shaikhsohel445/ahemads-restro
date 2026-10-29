"use client";

import {
  ChefHat,
  CheckCircle2,
  Cloud,
  Inbox,
  Network,
  Printer,
  ReceiptText,
  RefreshCw,
  Usb,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { StatusPill } from "@/components/ui/status-pill";
import {
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import { useOpenCashDrawer, usePrintTestSlip, usePrinterDiagnostics } from "@/hooks/use-print";
import { useSettings, useUpdateBranchSettings } from "@/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function PrinterDiagnosticsCard() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data, isLoading, isFetching, refetch } = usePrinterDiagnostics(branchId);
  const { data: settings } = useSettings(branchId);
  const updateBranch = useUpdateBranchSettings(branchId);
  const testPrint = usePrintTestSlip(branchId);
  const testKot = usePrintTestSlip(branchId, "kot");
  const { note, clear: clearNote, toast } = useNoteToast();
  const [host, setHost] = useState<string | null>(null);
  const [port, setPort] = useState<string | null>(null);
  const branch = settings?.branch;
  const [columns, setColumns] = useState<string | null>(null);
  const save = (dto: Parameters<typeof updateBranch.mutate>[0]) =>
    updateBranch.mutate(dto, {
      onSuccess: () => toast.success(t("settings.printer.savedToast")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.printer.saveFailed")),
    });
  const openDrawer = useOpenCashDrawer();

  const selectClass =
    "h-9 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

  return (
    <SettingsSection
      id="printer"
      icon={Printer}
      title={t("settings.printer.title")}
      description={t("settings.printer.description")}
      actions={
        <>
          {data && (
            <StatusPill tone={data.canPrint ? "success" : "danger"}>
              {data.canPrint ? t("settings.printer.statusReady") : t("settings.printer.statusOffline")}
            </StatusPill>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label={t("settings.printer.recheck")}
            title={t("settings.printer.recheck")}
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </>
      }
    >
      <SettingsBody>
        <div className="flex flex-col gap-3 py-4 @2xl:py-5">
          <SettingsCallout icon={Cloud} tone="info" className="text-xs">
            <p>{t("settings.printer.cloudNote")}</p>
          </SettingsCallout>

          <StatusNote note={note} onClear={clearNote} />

          {isLoading || !data ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : (
            <div className="flex flex-col gap-1.5 rounded-xl bg-surface-2/60 p-3.5 ring-1 ring-border/60">
              <div className="flex items-center gap-2 text-sm">
                {data.canPrint ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0 text-status-success" />
                    <span className="font-medium text-foreground">
                      {data.connection === "NETWORK" && data.network
                        ? t("settings.printer.reachableAt", {
                            address: `${data.network.host}:${data.network.port}`,
                          })
                        : t("settings.printer.detected")}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 shrink-0 text-status-danger" />
                    <span className="font-medium text-foreground">
                      {data.connection === "NETWORK"
                        ? t("settings.printer.notReachable")
                        : t("settings.printer.notDetected")}
                    </span>
                  </>
                )}
              </div>
              {data.lpDevices.length > 0 && (
                <p className="text-xs text-muted-foreground">{t("settings.printer.kernelDevices")} <bdi>{data.lpDevices.join(", ")}</bdi></p>
              )}
              {data.libusbPrinter && (
                <p className="text-xs text-muted-foreground">{t("settings.printer.usbDevice")} <bdi>{data.libusbPrinter.id}</bdi></p>
              )}
              {data.notes.map((note) => (
                <p key={note} className="text-xs text-muted-foreground">
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>

        {branch && (
          <>
            <SettingsField label={t("settings.printer.connection")}>
              <div className={cn(updateBranch.isPending && "pointer-events-none opacity-60")}>
                <Segmented
                  aria-label={t("settings.printer.connectionAria")}
                  stretch
                  value={branch.printerConnection}
                  onChange={(c) => c !== branch.printerConnection && save({ printerConnection: c })}
                  options={[
                    { value: "USB", label: t("settings.printer.usb"), icon: Usb },
                    { value: "NETWORK", label: t("settings.printer.network"), icon: Network },
                  ]}
                />
              </div>
              {branch.printerConnection === "USB" && (
                <p className="text-xs text-warning">{t("settings.printer.usbCloudWarning")}</p>
              )}
              {branch.printerConnection === "USB" && !branch.printerHost && (
                <p className="text-xs text-muted-foreground">{t("settings.printer.networkHint")}</p>
              )}
              {branch.printerConnection === "NETWORK" && (
                <p className="text-xs text-muted-foreground">{t("settings.printer.networkCloudHint")}</p>
              )}
            </SettingsField>

            <SettingsField label={t("settings.printer.address")} htmlFor="printer-host">
              <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
                <Input
                  id="printer-host"
                  inputMode="url"
                  autoComplete="off"
                  dir="ltr"
                  placeholder="printer.example.com"
                  value={host ?? branch.printerHost ?? ""}
                  onChange={(e) => setHost(e.target.value)}
                  className="font-mono"
                />
                <Input
                  id="printer-port"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={65535}
                  dir="ltr"
                  aria-label={t("settings.printer.port")}
                  placeholder={t("settings.printer.port")}
                  value={port ?? String(branch.printerPort)}
                  onChange={(e) => setPort(e.target.value)}
                  className="font-mono tabular-nums"
                />
              </div>
              {(host !== null || port !== null) && (
                <Button
                  type="button"
                  size="sm"
                  className="self-end"
                  disabled={updateBranch.isPending}
                  onClick={() => {
                    const dto: Parameters<typeof updateBranch.mutate>[0] = {};
                    if (host !== null) dto.printerHost = host.trim() || null;
                    if (port !== null) dto.printerPort = Number(port);
                    updateBranch.mutate(dto, {
                      onSuccess: () => {
                        toast.success(t("settings.printer.addressSaved"));
                        setHost(null);
                        setPort(null);
                        refetch();
                      },
                      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.printer.addressSaveFailed")),
                    });
                  }}
                >
                  {t("settings.printer.saveAddress")}
                </Button>
              )}
            </SettingsField>

            <SettingsField label={t("settings.printer.paperWidth")}>
              <div className={cn(updateBranch.isPending && "pointer-events-none opacity-60")}>
                <Segmented
                  aria-label={t("settings.printer.paperWidth")}
                  stretch
                  value={String(branch.printerPaperWidthMm) as "58" | "80"}
                  onChange={(v) => {
                    const mm = Number(v) as 58 | 80;
                    if (mm !== branch.printerPaperWidthMm) save({ printerPaperWidthMm: mm, printerColumns: null });
                  }}
                  options={([58, 80] as const).map((mm) => ({
                    value: String(mm) as "58" | "80",
                    label: t("settings.printer.mm", { n: mm }),
                  }))}
                />
              </div>
            </SettingsField>

            <SettingsField label={t("settings.printer.charset")} htmlFor="printer-codepage">
              <select
                id="printer-codepage"
                className={selectClass}
                value={branch.printerCodepage}
                disabled={updateBranch.isPending}
                onChange={(e) => save({ printerCodepage: e.target.value as typeof branch.printerCodepage })}
              >
                <option value="CP858">{t("settings.printer.cp858")}</option>
                <option value="CP850">{t("settings.printer.cp850")}</option>
                <option value="CP437">{t("settings.printer.cp437")}</option>
                <option value="CP1252">{t("settings.printer.cp1252")}</option>
              </select>
            </SettingsField>

            <SettingsField
              label={t("settings.printer.columns", { n: branch.printerPaperWidthMm === 58 ? 32 : 48 })}
              htmlFor="printer-columns"
              help={t("settings.printer.textHelp")}
            >
              <Input
                id="printer-columns"
                type="number"
                min={20}
                max={64}
                inputMode="numeric"
                className="w-28 tabular-nums"
                value={columns ?? (branch.printerColumns ?? "")}
                onChange={(e) => setColumns(e.target.value)}
                onBlur={() => {
                  if (columns === null) return;
                  const n = columns === "" ? null : Number(columns);
                  if (n !== null && (!Number.isInteger(n) || n < 20 || n > 64)) {
                    toast.error(t("settings.printer.columnsRange"));
                  } else if (n !== branch.printerColumns) {
                    save({ printerColumns: n });
                  }
                  setColumns(null);
                }}
              />
            </SettingsField>
          </>
        )}
      </SettingsBody>

      <SaveBar className="static" hint={t("settings.printer.drawerHelp")}>
        <Button
          variant="outline"
          size="sm"
          disabled={testPrint.isPending}
          onClick={() =>
            testPrint.mutate(undefined, {
              onSuccess: () => toast.success(t("settings.printer.testSent")),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : t("settings.printer.testFailed")),
            })
          }
        >
          <ReceiptText className="size-4" />
          {testPrint.isPending ? t("settings.printer.printing") : t("settings.printer.testPrint")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={testKot.isPending}
          onClick={() =>
            testKot.mutate(undefined, {
              onSuccess: () => toast.success(t("settings.printer.kotSent")),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : t("settings.printer.kotFailed")),
            })
          }
        >
          <ChefHat className="size-4" />
          {testKot.isPending ? t("settings.printer.printing") : t("settings.printer.testKot")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={openDrawer.isPending}
          onClick={() =>
            openDrawer.mutate(branchId, {
              onSuccess: () => toast.success(t("settings.printer.drawerSent")),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : t("settings.printer.drawerFailed")),
            })
          }
        >
          <Inbox className="size-4" />
          {t("settings.printer.openDrawer")}
        </Button>
      </SaveBar>
    </SettingsSection>
  );
}
