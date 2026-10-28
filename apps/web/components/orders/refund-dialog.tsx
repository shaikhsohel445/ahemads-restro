"use client";

import { PaymentMethodButtons } from "@/components/pos/payment-method-buttons";
import type { PaymentMethodDto } from "@nodedr-restaurant/types";
import { RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRefundOrder } from "@/hooks/use-orders";
import { useSettings } from "@/hooks/use-settings";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

// Saudi edition: refund to cash, card, mada, STC Pay or Apple Pay; UPI only
// when the restaurant has a UPI id configured.
const BASE_METHODS: PaymentMethodDto[] = ["CASH", "CARD", "MADA", "STC_PAY", "APPLE_PAY"];

export function RefundDialog({
  branchId,
  orderId,
  orderNumber,
  maxAmount,
}: {
  branchId: string | null;
  orderId: string;
  orderNumber: string;
  maxAmount: number;
}) {
  const { t } = useI18n();
  const { data: settings } = useSettings(branchId);
  const methods: PaymentMethodDto[] = [
    ...BASE_METHODS,
    ...(settings?.restaurant.upiVpa ? (["UPI"] as const) : []),
    "OTHER",
    "STORE_CREDIT",
  ];
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(maxAmount));
  const [method, setMethod] = useState<PaymentMethodDto>("CASH");
  const [reason, setReason] = useState("");
  const refund = useRefundOrder(branchId);
  // Units physically handed back; only these go back into stock.
  const [returned, setReturned] = useState<Record<string, number>>({});
  const { data: order } = useQuery({
    queryKey: ["orders", "refund-items", branchId, orderId],
    queryFn: () => api.get<{ items: { id: string; nameSnapshot: string; quantity: number }[] }>(`/orders/${orderId}?branchId=${branchId}`),
    enabled: open && !!branchId,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refund.mutate(
      {
        orderId,
        dto: {
          amount: Number(amount),
          method,
          reason: reason || undefined,
          returnedItems: Object.entries(returned)
            .filter(([, quantity]) => quantity > 0)
            .map(([orderItemId, quantity]) => ({ orderItemId, quantity })),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("orders.refund.done", { amount: formatCurrency(Number(amount)), number: orderNumber }));
          setOpen(false);
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("orders.refund.failed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label={t("orders.refund.title")}
            title={t("orders.refund.title")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {t("orders.refund.title")} <bdi>#{orderNumber}</bdi>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="refund-amount">{t("orders.refund.amountMax", { max: formatCurrency(maxAmount) })}</Label>
            <Input
              id="refund-amount"
              type="number"
              min="0"
              max={maxAmount}
              step="0.01"
              dir="ltr"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("orders.refund.method")}</Label>
            <PaymentMethodButtons methods={methods} value={method} onChange={setMethod} label={t("orders.refund.method")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="refund-reason">{t("orders.refund.reason")}</Label>
            <Input id="refund-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {order && order.items.length > 0 && (
            <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-medium">{t("orders.refund.returned")}</legend>
              <p className="text-xs text-muted-foreground">
                {t("orders.refund.returnedHint")}
              </p>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <Label htmlFor={`ret-${item.id}`} className="min-w-0 flex-1 truncate">
                    {item.nameSnapshot} <span className="text-muted-foreground">{t("orders.refund.sold", { n: item.quantity })}</span>
                  </Label>
                  <Input
                    id={`ret-${item.id}`}
                    type="number"
                    min="0"
                    max={item.quantity}
                    step="1"
                    dir="ltr"
                    className="h-9 w-20"
                    value={returned[item.id] ?? 0}
                    onChange={(e) =>
                      setReturned({ ...returned, [item.id]: Math.max(0, Math.min(item.quantity, Math.floor(Number(e.target.value) || 0))) })
                    }
                  />
                </div>
              ))}
            </fieldset>
          )}
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={refund.isPending}>
              {refund.isPending ? t("orders.refund.refunding") : t("orders.refund.issue")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
