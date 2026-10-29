"use client";

import { ArrowLeft, Ban, Check, ClipboardList, PackageCheck, Send, X } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { ReceivePoDialog } from "@/components/inventory/receive-po-dialog";
import { PO_STATUS_TONE } from "@/components/inventory/status-tones";
import { TABLE_CARD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  usePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  type PurchaseOrderDetail,
} from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "todo" | "cancelled";

function Timeline({ po }: { po: PurchaseOrderDetail }) {
  const { t } = useI18n();
  const s = po.status;
  const sent = s === "SENT" || s === "PARTIALLY_RECEIVED" || s === "RECEIVED";
  const lastGrn = po.goodsReceipts[po.goodsReceipts.length - 1];
  const steps: { key: string; label: string; meta?: string; state: StepState }[] = [
    {
      key: "created",
      label: t("inventory.po.timeline.created"),
      meta: t("inventory.po.timeline.byOn", { name: po.createdBy.name, date: formatDate(po.createdAt) }),
      state: "done",
    },
    {
      key: "sent",
      label: t("inventory.po.timeline.sent"),
      state: sent ? "done" : s === "DRAFT" ? "current" : "todo",
    },
    {
      key: "receiving",
      label: t("inventory.po.timeline.receiving"),
      meta:
        po.goodsReceipts.length > 0
          ? t("inventory.po.timeline.receipts", { n: formatNumber(po.goodsReceipts.length) })
          : undefined,
      state: s === "RECEIVED" ? "done" : s === "PARTIALLY_RECEIVED" || s === "SENT" ? "current" : "todo",
    },
    {
      key: "received",
      label: t("inventory.po.timeline.received"),
      meta: s === "RECEIVED" && lastGrn ? formatDate(lastGrn.receivedAt) : undefined,
      state: s === "RECEIVED" ? "done" : "todo",
    },
  ];
  if (s === "CANCELLED") {
    // A cancelled order stops wherever it was; show the stop as the last step.
    const kept = steps.filter((st) => st.state === "done");
    kept.push({ key: "cancelled", label: t("inventory.po.timeline.cancelled"), state: "cancelled" });
    steps.splice(0, steps.length, ...kept);
  }

  return (
    <ol className="flex flex-col">
      {steps.map((st, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={st.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute start-[13px] top-7 bottom-0 w-px",
                  st.state === "done" ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center rounded-full text-xs ring-4 ring-card",
                st.state === "done" && "bg-primary text-primary-foreground",
                st.state === "current" && "bg-status-info-soft text-status-info ring-status-info/20",
                st.state === "todo" && "bg-surface-2 text-muted-foreground",
                st.state === "cancelled" && "bg-status-danger-soft text-status-danger",
              )}
            >
              {st.state === "done" ? (
                <Check className="size-3.5" />
              ) : st.state === "cancelled" ? (
                <X className="size-3.5" />
              ) : (
                <span className="tabular-nums">{i + 1}</span>
              )}
            </span>
            <div className="flex min-w-0 flex-col pt-0.5">
              <span
                className={cn(
                  "text-sm font-medium",
                  st.state === "todo" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {st.label}
              </span>
              {st.meta && <span className="text-xs text-muted-foreground">{st.meta}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const { branchId } = useBranch();
  const { data: po, isLoading } = usePurchaseOrder(branchId, id);
  const updateStatus = useUpdatePurchaseOrderStatus(branchId);

  if (isLoading || !po) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
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

  const actions = (
    <>
      {(po.status === "DRAFT" || po.status === "SENT") && (
        <Button variant="outline" onClick={cancel} disabled={updateStatus.isPending}>
          <Ban className="size-4" />
          {t("inventory.po.cancel")}
        </Button>
      )}
      {po.status === "DRAFT" && (
        <Button onClick={send} disabled={updateStatus.isPending}>
          <Send className="size-4 rtl:-scale-x-100" />
          {t("inventory.po.markSent")}
        </Button>
      )}
      {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
        <ReceivePoDialog branchId={branchId} po={po} />
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/inventory/purchase-orders"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t("inventory.tabs.purchaseOrders")}
        </Link>
        <PageHeader
          icon={ClipboardList}
          title={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <bdi>{po.poNumber}</bdi>
              <StatusPill tone={PO_STATUS_TONE[po.status]}>{t(`inventory.poStatus.${po.status}`)}</StatusPill>
            </span>
          }
          description={
            <>
              {po.supplier.name} ·{" "}
              {t("inventory.po.createdByOn", { name: po.createdBy.name, date: formatDate(po.createdAt) })}
            </>
          }
          actions={actions}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* The order itself, laid out like a printed purchase order. */}
        <Card className={cn(TABLE_CARD, "min-w-0")}>
          <div className="grid gap-4 border-b border-border/70 px-4 py-5 sm:grid-cols-3 sm:px-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("inventory.supplier")}
              </span>
              <span className="font-medium text-foreground">{po.supplier.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("inventory.po.issued")}
              </span>
              <span className="text-foreground tabular-nums">{formatDate(po.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("inventory.po.expected")}
              </span>
              <span className="text-foreground tabular-nums">
                {po.expectedDate ? formatDate(po.expectedDate) : "—"}
              </span>
            </div>
          </div>

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
              {po.items.map((item) => {
                const full = Number(item.quantityReceived) >= Number(item.quantityOrdered);
                return (
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
                    <TableCell
                      className={cn(
                        "text-end tabular-nums",
                        full ? "text-status-success" : Number(item.quantityReceived) > 0 ? "text-status-warning" : "text-muted-foreground",
                      )}
                    >
                      <bdi>
                        {formatNumber(item.quantityReceived, { maximumFractionDigits: 3 })}{" "}
                        {item.ingredient ? t(`inventory.unit.${item.ingredient.unit}`) : ""}
                      </bdi>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{formatCurrency(item.unitCost)}</TableCell>
                    <TableCell className="text-end font-medium tabular-nums">
                      {formatCurrency(Number(item.quantityOrdered) * Number(item.unitCost))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 border-t border-border/70 bg-surface-2/50 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
            {po.notes ? (
              <div className="flex max-w-md flex-col gap-1 text-sm">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("common.notes")}
                </span>
                <p className="whitespace-pre-wrap text-foreground">{po.notes}</p>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-baseline justify-between gap-6 sm:justify-end">
              <span className="text-sm text-muted-foreground">{t("common.total")}</span>
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(po.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="px-4 sm:px-5">
            <h2 className="text-sm font-semibold text-foreground">{t("inventory.po.timeline.title")}</h2>
            <Timeline po={po} />
          </Card>

          {po.goodsReceipts.length > 0 && (
            <Card className="px-4 sm:px-5">
              <h2 className="text-sm font-semibold text-foreground">{t("inventory.grn.title")}</h2>
              <ul className="flex flex-col gap-2">
                {po.goodsReceipts.map((grn: PurchaseOrderDetail["goodsReceipts"][number]) => (
                  <li
                    key={grn.id}
                    className="flex items-start gap-3 rounded-xl bg-surface-2/70 p-3 text-sm"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-success-soft text-status-success">
                      <PackageCheck className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium text-foreground">{grn.grnNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("inventory.grn.receivedByOn", {
                          name: grn.receivedBy.name,
                          date: formatDate(grn.receivedAt),
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("inventory.grn.lineItems", { n: formatNumber(grn.items.length) })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
