"use client";

import { ClipboardList, Coins, PieChart, Trash2 } from "lucide-react";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { LogWasteDialog } from "@/components/inventory/log-waste-dialog";
import { TABLE_CARD } from "@/components/reports/table-styles";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/hooks/use-branch";
import { useWasteLogs } from "@/hooks/use-inventory";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const REASON_TONE: Record<string, Tone> = {
  SPOILED: "danger",
  EXPIRED: "warning",
  DAMAGED: "warning",
  PREP_ERROR: "info",
  OVER_PRODUCTION: "gold",
  OTHER: "neutral",
};

export default function WastePage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data: logs, isLoading } = useWasteLogs(branchId);

  const totalCost = logs?.reduce(
    (sum, l) => sum + Number(l.quantity) * Number(l.unitCostAtWaste),
    0,
  );
  const byReason = new Map<string, number>();
  logs?.forEach((l) =>
    byReason.set(l.reason, (byReason.get(l.reason) ?? 0) + Number(l.quantity) * Number(l.unitCostAtWaste)),
  );
  const topReason = [...byReason.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader actions={<LogWasteDialog branchId={branchId} />} />

      {typeof totalCost === "number" && logs && logs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatCard
            className="col-span-2 lg:col-span-1"
            label={t("inventory.waste.totalCost")}
            value={formatCurrency(totalCost)}
            icon={Coins}
            tone="danger"
          />
          <StatCard
            label={t("inventory.waste.entries")}
            value={formatNumber(logs.length)}
            icon={ClipboardList}
            tone="neutral"
          />
          <StatCard
            label={t("inventory.waste.topReason")}
            value={<span className="text-xl sm:text-2xl">{topReason ? t(`inventory.wasteReason.${topReason}`) : "—"}</span>}
            icon={PieChart}
            tone="warning"
          />
        </div>
      )}

      {isLoading ? (
        <Card className="gap-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </Card>
      ) : logs && logs.length > 0 ? (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{log.ingredient.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      <bdi>
                        {formatNumber(log.quantity, { maximumFractionDigits: 3 })}{" "}
                        {t(`inventory.unit.${log.ingredient.unit}`)}
                      </bdi>
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-status-danger">
                    {formatCurrency(Number(log.quantity) * Number(log.unitCostAtWaste))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <StatusPill tone={REASON_TONE[log.reason] ?? "neutral"}>
                    {t(`inventory.wasteReason.${log.reason}`)}
                  </StatusPill>
                  <span className="truncate">
                    {log.createdBy.name} · {formatDate(log.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Card className={cn(TABLE_CARD, "hidden md:flex")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.ingredient")}</TableHead>
                  <TableHead className="text-end">{t("common.quantity")}</TableHead>
                  <TableHead>{t("inventory.reason")}</TableHead>
                  <TableHead className="text-end">{t("inventory.cost")}</TableHead>
                  <TableHead>{t("inventory.waste.loggedBy")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-foreground">{log.ingredient.name}</TableCell>
                    <TableCell className="text-end tabular-nums">
                      <bdi>
                        {formatNumber(log.quantity, { maximumFractionDigits: 3 })}{" "}
                        {t(`inventory.unit.${log.ingredient.unit}`)}
                      </bdi>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={REASON_TONE[log.reason] ?? "neutral"}>
                        {t(`inventory.wasteReason.${log.reason}`)}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-end font-medium tabular-nums text-status-danger">
                      {formatCurrency(Number(log.quantity) * Number(log.unitCostAtWaste))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.createdBy.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Trash2}
          title={t("inventory.waste.emptyTitle")}
          description={t("inventory.waste.emptyDescription")}
          action={<LogWasteDialog branchId={branchId} />}
        />
      )}
    </div>
  );
}
