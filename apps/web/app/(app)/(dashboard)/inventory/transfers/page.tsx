"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { FIELD_LABEL, SELECT_CLASS, TABLE_CARD, TABLE_CARD_HEAD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
import { useIngredients } from "@/hooks/use-inventory";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface TransferView {
  branches: { id: string; name: string }[];
  history: {
    id: string;
    createdAt: string;
    fromBranchId: string;
    fromBranchName: string;
    toBranchName: string;
    ingredientName: string;
    unit: string;
    quantity: string;
    unitCost: string;
    note: string | null;
  }[];
}

export default function TransfersPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const qc = useQueryClient();
  const { data: ingredients } = useIngredients(branchId);
  const { data, isLoading } = useQuery({
    queryKey: ["transfers", branchId],
    queryFn: () => api.get<TransferView>(`/inventory/transfers?branchId=${branchId}`),
    enabled: !!branchId,
  });
  const [toBranchId, setTo] = useState("");
  const [ingredientId, setIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const ingredient = ingredients?.find((i) => i.id === ingredientId);
  const send = useMutation({
    mutationFn: () =>
      api.post(`/inventory/transfers?branchId=${branchId}`, {
        toBranchId,
        ingredientId,
        quantity: Number(quantity),
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      setQuantity("");
      setNote("");
      toast.success(t("inventory.transfers.success"));
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : t("inventory.transfers.failed")),
  });

  const noOtherBranch = !!data && data.branches.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader description={t("inventory.transfers.subtitle")} />

      {noOtherBranch ? (
        <EmptyState compact icon={Building2} title={t("inventory.transfers.noOtherBranch")} />
      ) : (
        <Card className="px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ArrowLeftRight className="size-4" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">{t("inventory.transfers.formTitle")}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.4fr)_auto] lg:items-end">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="tr-ing" className={FIELD_LABEL}>{t("inventory.transfers.ingredientThisBranch")}</label>
              <select id="tr-ing" className={SELECT_CLASS} value={ingredientId} onChange={(e) => setIngredient(e.target.value)}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {ingredients?.map((i) => <option key={i.id} value={i.id}>{i.name} ({formatNumber(i.currentStock, { maximumFractionDigits: 3 })} {t(`inventory.unit.${i.unit}`)})</option>)}
              </select>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="tr-qty" className={FIELD_LABEL}>
                {t("common.quantity")}
                {ingredient ? <bdi>{` (${t(`inventory.unit.${ingredient.unit}`)})`}</bdi> : ""}
              </label>
              <Input id="tr-qty" type="number" min="0" step="0.001" className="tabular-nums" value={quantity} onChange={(e) => setQuantity(e.target.value)} dir="ltr" />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="tr-to" className={FIELD_LABEL}>{t("inventory.transfers.toBranch")}</label>
              <select id="tr-to" className={SELECT_CLASS} value={toBranchId} onChange={(e) => setTo(e.target.value)}>
                <option value="">{t("common.selectPlaceholder")}</option>
                {data?.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="tr-note" className={FIELD_LABEL}>{t("common.note")}</label>
              <Input id="tr-note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="h-10 sm:col-span-2 lg:col-span-1" disabled={!ingredientId || !toBranchId || !(Number(quantity) > 0) || send.isPending} onClick={() => send.mutate()}>
              <ArrowLeftRight className="size-4" />
              {send.isPending ? t("inventory.transfers.moving") : t("inventory.transfers.transfer")}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="gap-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </Card>
      ) : data && data.history.length > 0 ? (
        <Card className={TABLE_CARD}>
          <div className={TABLE_CARD_HEAD}>
            <h2 className="text-sm font-semibold text-foreground">{t("inventory.transfers.historyTitle")}</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.transfers.when")}</TableHead>
                <TableHead>{t("inventory.ingredient")}</TableHead>
                <TableHead className="text-end">{t("common.quantity")}</TableHead>
                <TableHead>{t("inventory.transfers.route")}</TableHead>
                <TableHead className="text-end">{t("inventory.costPerUnit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.history.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{formatDateTime(tr.createdAt)}</TableCell>
                  <TableCell className="whitespace-normal">
                    <span className="font-medium text-foreground">{tr.ingredientName}</span>
                    {tr.note ? <span className="block text-xs text-muted-foreground">{tr.note}</span> : null}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    <bdi>
                      {formatNumber(tr.quantity, { maximumFractionDigits: 3 })} {t(`inventory.unit.${tr.unit}`)}
                    </bdi>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("rounded-lg bg-surface-2 px-2 py-0.5 text-xs", tr.fromBranchId === branchId && "bg-accent text-accent-foreground")}>{tr.fromBranchName}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground rtl:-scale-x-100" />
                      <span className={cn("rounded-lg bg-surface-2 px-2 py-0.5 text-xs", tr.fromBranchId !== branchId && "bg-accent text-accent-foreground")}>{tr.toBranchName}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{formatCurrency(Number(tr.unitCost))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState compact icon={ArrowLeftRight} title={t("inventory.transfers.empty")} />
      )}
    </div>
  );
}
