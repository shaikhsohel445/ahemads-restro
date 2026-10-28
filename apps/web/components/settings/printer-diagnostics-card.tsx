"use client";

import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import { useOpenCashDrawer, usePrintTestSlip, usePrinterDiagnostics } from "@/hooks/use-print";
import { useSettings, useUpdateBranchSettings } from "@/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

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

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("settings.printer.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.printer.description")}</p>
          <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {t("settings.printer.cloudNote")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label={t("settings.printer.recheck")}
        >
          <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </div>

      <StatusNote note={note} onClear={clearNote} />

      {isLoading || !data ? (
        <Skeleton className="h-16 rounded-lg" />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            {data.canPrint ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-foreground">
                  {data.connection === "NETWORK" && data.network
                    ? t("settings.printer.reachableAt", {
                        address: `${data.network.host}:${data.network.port}`,
                      })
                    : t("settings.printer.detected")}
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-foreground">
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

      {branch && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <div className="flex flex-col gap-1.5">
            <Label>{t("settings.printer.connection")}</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("settings.printer.connectionAria")}>
              {(["USB", "NETWORK"] as const).map((c) => (
                <Button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={branch.printerConnection === c}
                  variant={branch.printerConnection === c ? "default" : "outline"}
                  size="sm"
                  disabled={updateBranch.isPending}
                  onClick={() => save({ printerConnection: c })}
                >
                  {c === "USB" ? t("settings.printer.usb") : t("settings.printer.network")}
                </Button>
              ))}
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
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="printer-host">{t("settings.printer.address")}</Label>
              <Input
                id="printer-host"
                inputMode="url"
                autoComplete="off"
                dir="ltr"
                placeholder="printer.example.com"
                value={host ?? branch.printerHost ?? ""}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="printer-port">{t("settings.printer.port")}</Label>
              <Input
                id="printer-port"
                type="number"
                inputMode="numeric"
                min={1}
                max={65535}
                dir="ltr"
                value={port ?? String(branch.printerPort)}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>
          {(host !== null || port !== null) && (
            <Button
              type="button"
              size="sm"
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
          <div className="flex flex-col gap-1.5">
            <Label>{t("settings.printer.paperWidth")}</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("settings.printer.paperWidth")}>
              {([58, 80] as const).map((mm) => (
                <Button
                  key={mm}
                  type="button"
                  role="radio"
                  aria-checked={branch.printerPaperWidthMm === mm}
                  variant={branch.printerPaperWidthMm === mm ? "default" : "outline"}
                  size="sm"
                  disabled={updateBranch.isPending}
                  onClick={() => save({ printerPaperWidthMm: mm, printerColumns: null })}
                >
                  {t("settings.printer.mm", { n: mm })}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="printer-codepage">{t("settings.printer.charset")}</Label>
              <select
                id="printer-codepage"
                className="h-10 rounded-lg border border-border bg-background px-2 text-sm"
                value={branch.printerCodepage}
                disabled={updateBranch.isPending}
                onChange={(e) => save({ printerCodepage: e.target.value as typeof branch.printerCodepage })}
              >
                <option value="CP858">{t("settings.printer.cp858")}</option>
                <option value="CP850">{t("settings.printer.cp850")}</option>
                <option value="CP437">{t("settings.printer.cp437")}</option>
                <option value="CP1252">{t("settings.printer.cp1252")}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="printer-columns">
                {t("settings.printer.columns", { n: branch.printerPaperWidthMm === 58 ? 32 : 48 })}
              </Label>
              <Input
                id="printer-columns"
                type="number"
                min={20}
                max={64}
                inputMode="numeric"
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
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.printer.textHelp")}
          </p>
        </div>
      )}

      <div>
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
          {testPrint.isPending ? t("settings.printer.printing") : t("settings.printer.testPrint")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ms-2"
          disabled={testKot.isPending}
          onClick={() =>
            testKot.mutate(undefined, {
              onSuccess: () => toast.success(t("settings.printer.kotSent")),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : t("settings.printer.kotFailed")),
            })
          }
        >
          {testKot.isPending ? t("settings.printer.printing") : t("settings.printer.testKot")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ms-2"
          disabled={openDrawer.isPending}
          onClick={() =>
            openDrawer.mutate(branchId, {
              onSuccess: () => toast.success(t("settings.printer.drawerSent")),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : t("settings.printer.drawerFailed")),
            })
          }
        >
          {t("settings.printer.openDrawer")}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("settings.printer.drawerHelp")}
        </p>
      </div>
    </Card>
  );
}
