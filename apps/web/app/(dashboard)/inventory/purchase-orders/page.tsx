"use client";

import { ChevronRight, ClipboardList, Coins, PackageOpen, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreatePoDialog } from "@/components/inventory/create-po-dialog";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { PO_STATUS_TONE } from "@/components/inventory/status-tones";
import { TABLE_CARD } from "@/components/reports/table-styles";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
import { useBranch } from "@/hooks/use-branch";
import { usePurchaseOrders } from "@/hooks/use-inventory";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { branchId } = useBranch();
  const { data: orders, isLoading } = usePurchaseOrders(branchId);

  const open = orders?.filter((o) => o.status === "DRAFT" || o.status === "SENT" || o.status === "PARTIALLY_RECEIVED") ?? [];
  const awaiting = open.filter((o) => o.status !== "DRAFT");
  const openValue = open.reduce((s, o) => s + Number(o.totalAmount), 0);

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader actions={<CreatePoDialog branchId={branchId} />} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label={t("inventory.po.stats.open")}
          value={isLoading ? "…" : formatNumber(open.length)}
          icon={ClipboardList}
        />
        <StatCard
          label={t("inventory.po.stats.awaiting")}
          value={isLoading ? "…" : formatNumber(awaiting.length)}
          icon={Send}
          tone={awaiting.length > 0 ? "info" : "neutral"}
        />
        <StatCard
          className="col-span-2 lg:col-span-1"
          label={t("inventory.po.stats.openValue")}
          value={isLoading ? "…" : formatCurrency(openValue)}
          icon={Coins}
          tone="gold"
        />
      </div>

      {isLoading ? (
        <Card className="gap-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </Card>
      ) : orders && orders.length > 0 ? (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {orders.map((po) => (
              <li key={po.id}>
                <Link
                  href={`/inventory/purchase-orders/${po.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">{po.poNumber}</span>
                      <StatusPill tone={PO_STATUS_TONE[po.status]}>{t(`inventory.poStatus.${po.status}`)}</StatusPill>
                    </div>
                    <span className="truncate text-sm text-muted-foreground">{po.supplier.name}</span>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDate(po.createdAt)} · {t("inventory.po.itemCount", { n: formatNumber(po.items.length) })}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(po.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <Card className={cn(TABLE_CARD, "hidden md:flex")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.po.number")}</TableHead>
                  <TableHead>{t("inventory.supplier")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-end">{t("common.items")}</TableHead>
                  <TableHead className="text-end">{t("common.total")}</TableHead>
                  <TableHead>{t("common.createdAt")}</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">{t("common.view")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer"
                    data-href={po.id}
                    onClick={() => router.push(`/inventory/purchase-orders/${po.id}`)}
                  >
                    <TableCell>
                      <Link
                        href={`/inventory/purchase-orders/${po.id}`}
                        className="font-medium text-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {po.poNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{po.supplier.name}</TableCell>
                    <TableCell>
                      <StatusPill tone={PO_STATUS_TONE[po.status]}>{t(`inventory.poStatus.${po.status}`)}</StatusPill>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{formatNumber(po.items.length)}</TableCell>
                    <TableCell className="text-end font-medium tabular-nums">{formatCurrency(po.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(po.createdAt)}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground rtl:-scale-x-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title={t("inventory.po.emptyTitle")}
          description={t("inventory.po.emptyDescription")}
          action={<CreatePoDialog branchId={branchId} />}
        />
      )}
    </div>
  );
}
