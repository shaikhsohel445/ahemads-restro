"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMergeOrder, useOpenOrders } from "@/hooks/use-orders";
import type { RestaurantTable } from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export function MergeTableDialog({
  branchId,
  table,
  allTables,
  open,
  onOpenChange,
}: {
  branchId: string | null;
  table: RestaurantTable;
  allTables: RestaurantTable[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { data: openOrders } = useOpenOrders(branchId);
  const tableLabel = table.name ?? t("tables.tableN", { n: table.number });
  const merge = useMergeOrder(branchId);

  const thisOrder = openOrders?.find((o) => o.tableId === table.id);
  const otherOccupiedTables = allTables.filter(
    (t) => t.id !== table.id && openOrders?.some((o) => o.tableId === t.id),
  );

  const handleMerge = (otherTableId: string) => {
    const otherOrder = openOrders?.find((o) => o.tableId === otherTableId);
    if (!thisOrder || !otherOrder) return;
    merge.mutate(
      { targetOrderId: thisOrder.id, sourceOrderId: otherOrder.id },
      {
        onSuccess: () => {
          toast.success(t("tables.mergedInto", { table: tableLabel }));
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("tables.mergeFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t("tables.mergeIntoTitle", { table: tableLabel })}
          </DialogTitle>
        </DialogHeader>

        {!thisOrder ? (
          <p className="py-4 text-sm text-muted-foreground">
            {t("tables.mergeNoOrder")}
          </p>
        ) : otherOccupiedTables.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            {t("tables.mergeNoOthers")}
          </p>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            {otherOccupiedTables.map((other) => {
              const order = openOrders?.find((o) => o.tableId === other.id);
              return (
                <Button
                  key={other.id}
                  variant="outline"
                  className="justify-between"
                  disabled={merge.isPending}
                  onClick={() => handleMerge(other.id)}
                >
                  <span>{other.name ?? t("tables.tableN", { n: other.number })}</span>
                  <span className="text-muted-foreground">
                    {order && formatCurrency(order.totalAmount)}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
