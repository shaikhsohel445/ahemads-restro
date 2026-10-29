"use client";

import { AlertTriangle, Boxes, Coins, PackageX, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { AddIngredientDialog } from "@/components/inventory/add-ingredient-dialog";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { TABLE_CARD } from "@/components/reports/table-styles";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput, Toolbar } from "@/components/ui/toolbar";
import { useBranch } from "@/hooks/use-branch";
import { useIngredients, useTrackingStatus } from "@/hooks/use-inventory";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type StockFilter = "all" | "low";

export default function InventoryPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const { data: ingredients, isLoading } = useIngredients(branchId);
  const { data: trackingStatus } = useTrackingStatus(branchId);

  const isLow = (i: { currentStock: string | number; reorderLevel: string | number }) =>
    Number(i.currentStock) <= Number(i.reorderLevel);
  const lowCount = ingredients?.filter(isLow).length ?? 0;
  const outCount = ingredients?.filter((i) => Number(i.currentStock) <= 0).length ?? 0;
  const stockValue =
    ingredients?.reduce((sum, i) => sum + Number(i.currentStock) * Number(i.costPerUnit), 0) ?? 0;

  const filtered = ingredients?.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) && (stockFilter === "all" || isLow(i)),
  );

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader actions={<AddIngredientDialog branchId={branchId} />} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t("inventory.overview.items")}
          value={isLoading ? "…" : formatNumber(ingredients?.length ?? 0)}
          icon={Boxes}
        />
        <StatCard
          label={t("inventory.lowStock")}
          value={isLoading ? "…" : formatNumber(lowCount)}
          icon={TriangleAlert}
          tone={lowCount > 0 ? "warning" : "success"}
          hint={t("inventory.overview.lowHint")}
          onClick={lowCount > 0 ? () => setStockFilter("low") : undefined}
        />
        <StatCard
          label={t("inventory.overview.outOfStock")}
          value={isLoading ? "…" : formatNumber(outCount)}
          icon={PackageX}
          tone={outCount > 0 ? "danger" : "neutral"}
        />
        <StatCard
          label={t("inventory.stockValue")}
          value={isLoading ? "…" : formatCurrency(stockValue)}
          icon={Coins}
          tone="gold"
        />
      </div>

      {trackingStatus && trackingStatus.problems.length > 0 && (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-status-warning/30 bg-status-warning-soft p-4 text-sm"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-status-warning">
            <AlertTriangle className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-medium text-foreground">
              {trackingStatus.problems.length === 1
                ? t("inventory.trackingProblems.one")
                : t("inventory.trackingProblems.other", { n: formatNumber(trackingStatus.problems.length) })}
            </p>
            <p className="text-muted-foreground">
              {t("inventory.trackingProblems.help")}{" "}
              {trackingStatus.problems.map((p) => p.name).join(t("inventory.listSeparator"))}
            </p>
          </div>
        </div>
      )}

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("inventory.ingredients.search")}
        />
        <Segmented<StockFilter>
          aria-label={t("inventory.overview.filter")}
          value={stockFilter}
          onChange={setStockFilter}
          options={[
            { value: "all", label: t("inventory.overview.all"), count: ingredients?.length },
            { value: "low", label: t("inventory.lowStock"), count: ingredients ? lowCount : undefined },
          ]}
        />
      </Toolbar>

      {isLoading ? (
        <Card className="gap-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </Card>
      ) : filtered && filtered.length > 0 ? (
        <>
          {/* Phones: one card per ingredient. */}
          <ul className="flex flex-col gap-2 md:hidden">
            {filtered.map((i) => {
              const low = isLow(i);
              return (
                <li
                  key={i.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border bg-card p-4",
                    low ? "border-status-warning/40" : "border-border/80",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{t(`inventory.unit.${i.unit}`)}</p>
                    </div>
                    {low && (
                      <StatusPill tone={Number(i.currentStock) <= 0 ? "danger" : "warning"}>
                        {t("inventory.lowStock")}
                      </StatusPill>
                    )}
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">{t("inventory.currentStock")}</dt>
                      <dd className={cn("text-sm font-semibold tabular-nums", low ? "text-status-warning" : "text-foreground")}>
                        {formatNumber(i.currentStock, { maximumFractionDigits: 3 })}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">{t("inventory.reorderLevel")}</dt>
                      <dd className="text-sm tabular-nums text-foreground">
                        {formatNumber(i.reorderLevel, { maximumFractionDigits: 3 })}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-muted-foreground">{t("inventory.stockValue")}</dt>
                      <dd className="text-sm tabular-nums text-foreground">
                        {formatCurrency(Number(i.currentStock) * Number(i.costPerUnit))}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <span className="text-xs text-muted-foreground">
                      {t("inventory.avgCostPerUnit")}{" "}
                      <span className="tabular-nums text-foreground">{formatCurrency(i.costPerUnit)}</span>
                    </span>
                    <AdjustStockDialog branchId={branchId} ingredient={i} />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Tablets and up: full table. */}
          <Card className={cn(TABLE_CARD, "hidden md:flex")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.ingredient")}</TableHead>
                  <TableHead>{t("inventory.unitLabel")}</TableHead>
                  <TableHead className="text-end">{t("inventory.currentStock")}</TableHead>
                  <TableHead className="text-end">{t("inventory.reorderLevel")}</TableHead>
                  <TableHead className="text-end">{t("inventory.avgCostPerUnit")}</TableHead>
                  <TableHead className="text-end">{t("inventory.stockValue")}</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">{t("common.actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => {
                  const low = isLow(i);
                  return (
                    <TableRow
                      key={i.id}
                      className={cn(low && "bg-status-warning-soft/50 hover:bg-status-warning-soft")}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{i.name}</span>
                          {low && (
                            <StatusPill tone={Number(i.currentStock) <= 0 ? "danger" : "warning"}>
                              {t("inventory.lowStock")}
                            </StatusPill>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t(`inventory.unit.${i.unit}`)}</TableCell>
                      <TableCell
                        className={cn("text-end font-medium tabular-nums", low ? "text-status-warning" : "text-foreground")}
                      >
                        {formatNumber(i.currentStock, { maximumFractionDigits: 3 })}
                      </TableCell>
                      <TableCell className="text-end tabular-nums text-muted-foreground">
                        {formatNumber(i.reorderLevel, { maximumFractionDigits: 3 })}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{formatCurrency(i.costPerUnit)}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatCurrency(Number(i.currentStock) * Number(i.costPerUnit))}
                      </TableCell>
                      <TableCell className="text-end">
                        <AdjustStockDialog branchId={branchId} ingredient={i} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={Boxes}
          title={
            search || stockFilter === "low"
              ? t("common.noResults")
              : t("inventory.ingredients.emptyTitle")
          }
          description={
            search || stockFilter === "low" ? undefined : t("inventory.ingredients.emptyDescription")
          }
          action={!search && stockFilter === "all" ? <AddIngredientDialog branchId={branchId} /> : undefined}
        />
      )}
    </div>
  );
}
