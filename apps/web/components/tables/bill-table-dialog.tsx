"use client";

import { CheckoutPanel } from "@/components/pos/checkout-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpenOrdersForTable } from "@/hooks/use-orders";
import type { RestaurantTable } from "@/hooks/use-tables";
import { useI18n } from "@/lib/i18n/context";

export function BillTableDialog({
  branchId,
  table,
  open,
  onOpenChange,
}: {
  branchId: string | null;
  table: RestaurantTable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { data: orders, isLoading } = useOpenOrdersForTable(branchId, open ? table.id : null);
  const order = orders?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("tables.billTitle", { table: table.name ?? t("tables.tableN", { n: table.number }) })}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : !order ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("tables.noOpenOrder")}
          </p>
        ) : (
          <CheckoutPanel
            order={order}
            branchId={branchId}
            initialCustomer={order.customer}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
