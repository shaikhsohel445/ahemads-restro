"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AddIngredientDialog } from "@/components/inventory/add-ingredient-dialog";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/hooks/use-branch";
import { useIngredients, useTrackingStatus } from "@/hooks/use-inventory";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function InventoryPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [search, setSearch] = useState("");
  const { data: ingredients, isLoading } = useIngredients(branchId);
  const { data: trackingStatus } = useTrackingStatus(branchId);

  const filtered = ingredients?.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("inventory.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("inventory.subtitle")}
          </p>
        </div>
        <AddIngredientDialog branchId={branchId} />
      </div>

      <InventoryTabs />

      {trackingStatus && trackingStatus.problems.length > 0 && (
        <div role="alert" className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="flex flex-col gap-1">
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

      <Input
        placeholder={t("inventory.ingredients.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.ingredient")}</TableHead>
                <TableHead>{t("inventory.unitLabel")}</TableHead>
                <TableHead className="text-end">{t("inventory.currentStock")}</TableHead>
                <TableHead className="text-end">{t("inventory.reorderLevel")}</TableHead>
                <TableHead className="text-end">{t("inventory.avgCostPerUnit")}</TableHead>
                <TableHead className="text-end">{t("inventory.stockValue")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => {
                const isLow = Number(i.currentStock) <= Number(i.reorderLevel);
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {i.name}
                        {isLow && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {t("inventory.lowStock")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(`inventory.unit.${i.unit}`)}</TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatNumber(i.currentStock, { maximumFractionDigits: 3 })}
                    </TableCell>
                    <TableCell className="text-end tabular-nums text-muted-foreground">
                      {formatNumber(i.reorderLevel, { maximumFractionDigits: 3 })}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCurrency(i.costPerUnit)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatCurrency(Number(i.currentStock) * Number(i.costPerUnit))}
                    </TableCell>
                    <TableCell>
                      <AdjustStockDialog branchId={branchId} ingredient={i} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("inventory.ingredients.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.ingredients.emptyDescription")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
