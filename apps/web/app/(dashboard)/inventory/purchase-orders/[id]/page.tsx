"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { ReceivePoDialog } from "@/components/inventory/receive-po-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  usePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  type PurchaseOrderDetail,
} from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const { branchId } = useBranch();
  const { data: po, isLoading } = usePurchaseOrder(branchId, id);
  const updateStatus = useUpdatePurchaseOrderStatus(branchId);

  if (isLoading || !po) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  const send = () =>
    updateStatus.mutate(
      { id: po.id, status: "SENT" },
      {
        onSuccess: () => toast.success(t("inventory.po.markedSent")),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("inventory.updateFailed")),
      },
    );

  const cancel = () =>
    updateStatus.mutate(
      { id: po.id, status: "CANCELLED" },
      {
        onSuccess: () => toast.success(t("inventory.po.cancelled")),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("inventory.updateFailed")),
      },
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/inventory/purchase-orders"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="rtl:-scale-x-100 h-3.5 w-3.5" />
          {t("inventory.tabs.purchaseOrders")}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{po.poNumber}</h1>
          <Badge>{t(`inventory.poStatus.${po.status}`)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {po.supplier.name} ·{" "}
          {t("inventory.po.createdByOn", { name: po.createdBy.name, date: formatDate(po.createdAt) })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {po.status === "DRAFT" && (
          <Button size="sm" onClick={send} disabled={updateStatus.isPending}>
            {t("inventory.po.markSent")}
          </Button>
        )}
        {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
          <ReceivePoDialog branchId={branchId} po={po} />
        )}
        {(po.status === "DRAFT" || po.status === "SENT") && (
          <Button size="sm" variant="outline" onClick={cancel} disabled={updateStatus.isPending}>
            {t("inventory.po.cancel")}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.ingredient")}</TableHead>
              <TableHead className="text-end">{t("inventory.po.ordered")}</TableHead>
              <TableHead className="text-end">{t("inventory.po.received")}</TableHead>
              <TableHead className="text-end">{t("inventory.costPerUnit")}</TableHead>
              <TableHead className="text-end">{t("inventory.po.lineTotal")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">
                  {item.ingredient?.name ?? item.ingredientId}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  <bdi>
                    {formatNumber(item.quantityOrdered, { maximumFractionDigits: 3 })}{" "}
                    {item.ingredient ? t(`inventory.unit.${item.ingredient.unit}`) : ""}
                  </bdi>
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  <bdi>
                    {formatNumber(item.quantityReceived, { maximumFractionDigits: 3 })}{" "}
                    {item.ingredient ? t(`inventory.unit.${item.ingredient.unit}`) : ""}
                  </bdi>
                </TableCell>
                <TableCell className="text-end tabular-nums">{formatCurrency(item.unitCost)}</TableCell>
                <TableCell className="text-end tabular-nums">
                  {formatCurrency(Number(item.quantityOrdered) * Number(item.unitCost))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t("common.total")}</span>
          <span className="font-semibold text-foreground">{formatCurrency(po.totalAmount)}</span>
        </div>
      </Card>

      {po.goodsReceipts.length > 0 && (
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-[18px] font-medium text-foreground">{t("inventory.grn.title")}</h2>
          <div className="flex flex-col divide-y divide-border">
            {po.goodsReceipts.map((grn: PurchaseOrderDetail["goodsReceipts"][number]) => (
              <div key={grn.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{grn.grnNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("inventory.grn.receivedByOn", {
                      name: grn.receivedBy.name,
                      date: formatDate(grn.receivedAt),
                    })}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {t("inventory.grn.lineItems", { n: formatNumber(grn.items.length) })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
