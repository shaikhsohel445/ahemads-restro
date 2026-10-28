"use client";

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
import { PaymentMethodButtons } from "@/components/pos/payment-method-buttons";
import { Label } from "@/components/ui/label";
import { useRecordSupplierPayment, type SupplierInvoice } from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "WALLET", "OTHER"] as const;

export function RecordPaymentDialog({
  branchId,
  invoice,
}: {
  branchId: string | null;
  invoice: SupplierInvoice;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const remaining = Number(invoice.totalAmount) - Number(invoice.amountPaid);
  const [amount, setAmount] = useState(() => String(remaining));
  const [method, setMethod] = useState<(typeof METHODS)[number]>("CASH");
  const [reference, setReference] = useState("");
  const recordPayment = useRecordSupplierPayment(branchId);

  const canSubmit = Number(amount) > 0 && Number(amount) <= remaining;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    recordPayment.mutate(
      {
        invoiceId: invoice.id,
        dto: { amount: Number(amount), paymentMethod: method, reference: reference || undefined },
      },
      {
        onSuccess: () => {
          toast.success(t("inventory.payment.recorded"));
          setOpen(false);
          setReference("");
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("inventory.payment.recordFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline">{t("inventory.payment.record")}</Button>} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("inventory.payment.recordTitle")}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            <bdi>{invoice.invoiceNumber}</bdi> —{" "}
            {t("inventory.payment.remainingOf", {
              remaining: formatCurrency(remaining),
              total: formatCurrency(Number(invoice.totalAmount)),
            })}
          </p>

          <div className="flex flex-col gap-2">
            <Label>{t("common.amount")}</Label>
            <Input
              type="number"
              min="0"
              max={remaining}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("inventory.payment.method")}</Label>
            <PaymentMethodButtons methods={METHODS} value={method} onChange={setMethod} label={t("inventory.payment.paymentMethod")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("inventory.payment.reference")}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("inventory.payment.referencePlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit || recordPayment.isPending}>
              {recordPayment.isPending ? t("inventory.recording") : t("inventory.payment.record")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
