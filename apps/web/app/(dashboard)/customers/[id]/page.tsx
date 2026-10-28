"use client";

import { ArrowLeft, CreditCard, Gift, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { branchId } = useBranch();
  const { data: customer, isLoading } = useCustomer(branchId, id);
  const router = useRouter();
  const deleteCustomer = useDeleteCustomer(branchId);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useI18n();

  if (isLoading || !customer) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  const onDelete = () => {
    if (!confirm(t("customers.confirmDelete", { name: customer.name ?? t("customers.thisCustomer") }))) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => {
        toast.success(t("customers.deleted", { name: customer.name ?? t("common.customer") }));
        router.replace("/customers");
      },
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("customers.deleteError")),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/customers"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="rtl:-scale-x-100 h-3.5 w-3.5" />
            {t("customers.title")}
          </Link>
          <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-foreground">
            {customer.name ?? t("customers.unnamed")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[customer.phone, customer.email, customer.address].filter(Boolean).join(" · ") ||
              t("customers.noContactOnFile")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
            {t("common.edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("customers.loyaltyPoints")}</p>
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {formatNumber(customer.loyaltyPoints)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("common.paymentMethod.STORE_CREDIT")}</p>
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {formatCurrency(customer.walletBalance)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("customers.giftCards")}</p>
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {customer.giftCards.length}
            </p>
          </div>
        </Card>
      </div>

      {customer.allergies && (
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("customers.allergies")}
          </p>
          <p className="mt-1 text-sm text-destructive">{customer.allergies}</p>
        </Card>
      )}

      {customer.giftCards.length > 0 && (
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-[18px] font-medium text-foreground">{t("customers.giftCards")}</h2>
          <div className="flex flex-col divide-y divide-border">
            {customer.giftCards.map((gc) => (
              <div key={gc.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-mono text-muted-foreground" dir="ltr">{gc.code}</span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCurrency(gc.balance)} / {formatCurrency(gc.initialValue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-[18px] font-medium text-foreground">{t("customers.orderHistory")}</h2>
        {customer.orders.length > 0 ? (
          <div className="flex flex-col divide-y divide-border">
            {customer.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground"><bdi>#{o.orderNumber}</bdi></span>
                  <Badge variant="secondary" className="mt-0.5 w-fit text-[11px] font-normal">
                    {formatDate(o.billedAt)}
                  </Badge>
                </div>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCurrency(o.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">{t("customers.noOrders")}</p>
        )}
      </Card>

      {isEditing && (
        <EditCustomerDialog
          branchId={branchId}
          customer={customer}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
