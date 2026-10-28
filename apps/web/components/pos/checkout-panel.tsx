"use client";

import { kitchenProgress, type PaymentMethodDto } from "@nodedr-restaurant/types";
import { ArrowLeft, CheckCircle2, ChefHat, Pencil, Printer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-error";
import { PaymentMethodButtons } from "@/components/pos/payment-method-buttons";
import { CustomerPicker } from "@/components/pos/customer-picker";
import type { Customer } from "@/hooks/use-customers";
import { lookupGiftCard } from "@/hooks/use-gift-cards";
import { CancelOrderDialog, useCanCancelOrders } from "@/components/orders/cancel-order-dialog";
import { EditBillDialog } from "@/components/orders/edit-bill-dialog";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import {
  useBillPreview,
  useCheckoutOrder,
  useOrder,
  type BillPreview,
  type CheckoutResult,
  type CreatedOrder,
} from "@/hooks/use-orders";
import { usePrintKot, usePrintOrderUsb, type PrintJobResult } from "@/hooks/use-print";
import { useSettings } from "@/hooks/use-settings";
import { api, ApiError } from "@/lib/api";
import { discountSummary, parseMoney, planPayment } from "@/lib/bill";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { publishDisplay } from "@/lib/customer-display";
import { playPaymentReceived } from "@/lib/celebrate";
import { buildUpiUri } from "@/lib/upi";
import { QRCodeSVG } from "qrcode.react";
import { openKotPrint, openReceiptPrint } from "@/lib/print";
import { round2 } from "@/lib/pricing-preview";

// Saudi edition: cash, card and the local terminals/wallets first. UPI is only
// offered when the restaurant has a UPI id configured (see upiVpa below).
// Every method is recorded by staff after the terminal/wallet approves it.
const BASE_METHODS: PaymentMethodDto[] = ["CASH", "CARD", "MADA", "STC_PAY", "APPLE_PAY"];

// Translated at render time: pos.checkout.kitchen.<status>.
const KITCHEN_STATES = new Set(["NEW", "ACCEPTED", "PREPARING", "READY", "SERVED"]);

/** Re-evaluates a value after the user has stopped changing it for `ms`. */
function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function CheckoutPanel({
  order: orderSnapshot,
  branchId,
  initialCustomer = null,
  onDone,
}: {
  order: CreatedOrder;
  branchId: string | null;
  initialCustomer?: Customer | null;
  onDone: () => void;
}) {
  const { t } = useI18n();
  // The order passed in is a snapshot from when it was sent; the live copy
  // carries edits (removed lines, new totals), payments already taken, the
  // kitchen's progress, and a cancel/pay by someone else.
  const { data: live } = useOrder(branchId, orderSnapshot.id);
  const order: CreatedOrder = live
    ? {
        ...orderSnapshot,
        subtotal: live.subtotal,
        taxAmount: live.taxAmount,
        totalAmount: live.totalAmount,
        status: live.status,
      }
    : orderSnapshot;
  const [method, setMethod] = useState<PaymentMethodDto>("CASH");
  const [amountText, setAmountText] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [tipAmount, setTipAmount] = useState("0");
  const [pointsToRedeem, setPointsToRedeem] = useState("0");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null);
  const [checkingGiftCard, setCheckingGiftCard] = useState(false);
  const [splitCount, setSplitCount] = useState("1");
  const [customer, setCustomer] = useState<Customer | null>(initialCustomer);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const checkout = useCheckoutOrder(branchId);
  const { note, clear: clearNote, toast } = useNoteToast();
  const canCancelRole = useCanCancelOrders();
  const { data: me } = useCurrentUser();
  const canEditRole = hasPermission(me?.user, "orders.edit");
  const canDiscount = hasPermission(me?.user, "discounts.apply");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const printUsb = usePrintOrderUsb(branchId);
  const printKot = usePrintKot(branchId);
  const onPrinted = (r: PrintJobResult) =>
    r.unsupportedChars?.length
      ? toast.warning(t("pos.print.unsupportedChars", { chars: r.unsupportedChars.join(" ") }))
      : toast.success(t("pos.print.sentThermal"));
  // First print sends only tickets not yet printed. If they already went out
  // (e.g. a double tap or retry) the server refuses to print a duplicate and we
  // offer an explicit, REPRINT-stamped copy instead.
  const printKotNow = (reprint: boolean) =>
    printKot.mutate(
      { orderId: order.id, reprint },
      {
        onSuccess: (r) => {
          onPrinted(r);
          if (reprint) toast.success(t("pos.print.reprintSent"));
        },
        onError: (err) => {
          if (err instanceof ApiError && err.code === "ALREADY_PRINTED") {
            toast.info(t("pos.print.kotAlreadyPrinted"), {
              action: { label: t("pos.print.printReprint"), onClick: () => printKotNow(true) },
            });
            return;
          }
          toast.error(err instanceof ApiError ? err.message : t("pos.print.kotFailed"));
        },
      },
    );
  const [completed, setCompleted] = useState<CheckoutResult | null>(null);
  const { data: settings } = useSettings(branchId);

  // What the guest has typed in, as numbers. Once a payment has been taken the
  // server locks the figures, so these stop mattering (and are not sent).
  const adjustments = useMemo(
    () => ({
      discountPercent: Number(discountPercent) || 0,
      tipAmount: Number(tipAmount) || 0,
      loyaltyPointsToRedeem: Math.max(0, Math.floor(Number(pointsToRedeem) || 0)),
      couponCode: appliedCoupon || undefined,
    }),
    [discountPercent, tipAmount, pointsToRedeem, appliedCoupon],
  );
  const settled = useDebounced(adjustments);
  // Once any payment is on the bill the server fixes its figures and refuses
  // further adjustments, so none are sent from then on.
  const hasPayments = (live?.payments.length ?? 0) > 0;

  // The server prices the bill: this is the single source for the figures on
  // screen, on the printed bill, and at checkout.
  const billQuery = useBillPreview(
    branchId,
    order.id,
    hasPayments ? {} : settled,
    order.status === "OPEN",
  );
  const bill: BillPreview | undefined = billQuery.data;
  const locked = (bill?.locked ?? false) || hasPayments;
  const repricing = adjustments !== settled;

  // A coupon is checked when applied, so the bill above only ever sees a valid
  // code (or none) and never drops the happy-hour discount on an error.
  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return setAppliedCoupon("");
    try {
      // Validate this code on its own before adopting it.
      await api.post(`/orders/${order.id}/bill-preview?branchId=${branchId}`, { couponCode: code });
      setAppliedCoupon(code);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("pos.checkout.couponFailed"));
    }
  };

  const balance = bill?.balanceDue ?? 0;
  const giftCardApplied = giftCardBalance !== null ? round2(Math.min(giftCardBalance, balance)) : 0;
  const remainingDue = round2(balance - giftCardApplied);
  const entered = parseMoney(amountText);
  const plan = planPayment({ remaining: remainingDue, entered, method });
  const split = Math.max(1, Math.floor(Number(splitCount) || 1));

  const checkGiftCard = async () => {
    if (!giftCardCode) return;
    setCheckingGiftCard(true);
    try {
      const card = await lookupGiftCard(branchId, giftCardCode);
      if (!card) {
        toast.error(t("pos.checkout.giftCardNotFound"));
        setGiftCardBalance(null);
        return;
      }
      setGiftCardBalance(Number(card.balance));
    } finally {
      setCheckingGiftCard(false);
    }
  };

  // What the QR asks the guest to pay: the amount being recorded now.
  const upiAmount = plan.valid ? plan.applied : remainingDue;
  const upiVpa = settings?.restaurant.upiVpa;
  const methods: PaymentMethodDto[] = upiVpa ? [...BASE_METHODS, "UPI", "OTHER"] : [...BASE_METHODS, "OTHER"];
  const methodLabel = (m: string) => t(`common.paymentMethod.${m}`);
  const upiName = settings?.restaurant.upiPayeeName || settings?.restaurant.name;
  const upiUri =
    method !== "UPI" || !upiVpa || !(upiAmount > 0)
      ? null
      : buildUpiUri({
          vpa: upiVpa,
          name: upiName,
          amount: upiAmount,
          note: `Order ${order.id.slice(-6).toUpperCase()}`,
          ref: order.id,
        });

  // Mirror the QR to the customer-facing screen while UPI is selected, and
  // clear it again if the cashier switches method.
  useEffect(() => {
    if (completed) return;
    if (upiUri) {
      publishDisplay({ kind: "upi", total: upiAmount, uri: upiUri, payee: upiName || "" });
    }
  }, [upiUri, upiAmount, upiName, completed]);

  // One id per distinct attempt: a retry after a dropped connection (same
  // payload) reuses it, so the server records the payment once.
  const attempt = useRef<{ key: string; id: string } | null>(null);
  const requestIdFor = (payload: unknown) => {
    const key = JSON.stringify(payload);
    if (attempt.current?.key !== key) {
      attempt.current = { key, id: crypto.randomUUID() };
    }
    return attempt.current.id;
  };

  const handleCheckout = () => {
    if (!bill || repricing) return;
    const payments =
      plan.applied > 0
        ? [
            {
              method,
              amount: plan.applied,
              ...(plan.tendered ? { tendered: plan.tendered } : {}),
            },
          ]
        : [];
    const dto = {
      customerId: customer?.id,
      ...(locked ? {} : settled),
      giftCardCode: giftCardBalance !== null ? giftCardCode : undefined,
      payments,
      allowPartial: plan.partial || undefined,
    };
    checkout.mutate(
      { orderId: order.id, dto: { ...dto, requestId: requestIdFor(dto) } },
      {
        onSuccess: (result) => {
          attempt.current = null;
          setAmountText("");
          if (result.settlement.fullyPaid) {
            setCompleted(result);
            publishDisplay({ kind: "paid", total: Number(result.totalAmount), method });
            playPaymentReceived(formatCurrency(result.totalAmount));
            toast.success(t("pos.checkout.paymentRecorded"));
          } else {
            toast.success(
              t("pos.checkout.partPaymentRecorded", {
                paid: formatCurrency(result.settlement.amountPaid),
                due: formatCurrency(result.settlement.balanceDue),
              }),
            );
          }
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("pos.checkout.failed")),
      },
    );
  };

  const printBill = () => branchId && openReceiptPrint(order.id, branchId, locked ? {} : settled);
  const printBillThermal = () =>
    printUsb.mutate(
      { orderId: order.id, adjustments: locked ? {} : settled },
      {
        onSuccess: onPrinted,
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("pos.print.thermalFailed")),
      },
    );

  if (completed) {
    const { settlement } = completed;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <StatusNote note={note} onClear={clearNote} className="w-full text-start" />
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="text-lg font-semibold text-foreground">
          {t("pos.checkout.orderPaid")} <bdi>#{order.orderNumber}</bdi>
        </p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {formatCurrency(completed.totalAmount)}
        </p>
        {settlement.changeDue > 0 && (
          <p className="rounded-lg bg-success/10 px-4 py-2 text-lg font-semibold tabular-nums text-success">
            {t("pos.checkout.changeDue", { amount: formatCurrency(settlement.changeDue) })}
          </p>
        )}
        {Number(completed.loyaltyDiscountAmount) > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("pos.checkout.pointsRedeemed", { n: completed.loyaltyPointsRedeemed })}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => branchId && openReceiptPrint(completed.id, branchId)}
          >
            {t("pos.print.receiptBrowser")}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            disabled={printUsb.isPending}
            onClick={() =>
              printUsb.mutate({ orderId: completed.id, drawer: completed.payments?.some((p) => p.method === "CASH") }, {
                onSuccess: onPrinted,
                onError: (err) =>
                  toast.error(err instanceof ApiError ? err.message : t("pos.print.thermalFailed")),
              })
            }
          >
            {printUsb.isPending ? t("pos.print.printing") : t("pos.print.receiptThermal")}
          </Button>
          <Button className="h-11" onClick={onDone}>{t("pos.checkout.newOrder")}</Button>
        </div>
      </div>
    );
  }

  // Someone else (another terminal) already closed this bill.
  if (order.status === "CANCELLED" || (order.status === "PAID" && !completed)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <StatusNote note={note} onClear={clearNote} className="w-full text-start" />
        <p className="text-sm font-medium text-foreground">
          {order.status === "CANCELLED" ? t("pos.checkout.wasCancelled") : t("pos.checkout.wasAlreadyPaid")}{" "}
          <bdi>#{order.orderNumber}</bdi>
        </p>
        <p className="text-xs text-muted-foreground">
          {order.status === "CANCELLED"
            ? t("pos.checkout.cancelledHint")
            : t("pos.checkout.nothingMore")}
        </p>
        <Button className="h-11" onClick={onDone}>{t("common.done")}</Button>
      </div>
    );
  }

  const kitchen = live ? kitchenProgress(live.kots.map((k) => k.status)) : null;
  const paidSoFar = live?.payments ?? [];
  const partialLabel = t("pos.checkout.recordPartial", { amount: formatCurrency(plan.applied) });

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <StatusNote note={note} onClear={clearNote} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ms-2 shrink-0 text-muted-foreground"
          onClick={onDone}
        >
          <ArrowLeft className="rtl:-scale-x-100 h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          {canEditRole && !locked && (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {t("pos.checkout.editBill")}
            </Button>
          )}
          {canCancelRole && !locked && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              {t("pos.checkout.cancelOrder")}
            </Button>
          )}
        </div>
        <CancelOrderDialog
          branchId={branchId}
          orderId={order.id}
          orderNumber={order.orderNumber}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
        <EditBillDialog branchId={branchId} orderId={order.id} open={editOpen} onOpenChange={setEditOpen} />
      </div>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {t("pos.checkout.sentToKitchen")} <bdi>#{order.orderNumber}</bdi>
            </p>
            {kitchen && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <ChefHat className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {KITCHEN_STATES.has(kitchen) ? t(`pos.checkout.kitchen.${kitchen}`) : kitchen}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => branchId && openKotPrint(order.id, branchId)}
          >
            <Printer className="h-4 w-4" />
            {t("pos.print.kotBrowser")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={printKot.isPending}
            onClick={() => printKotNow(false)}
          >
            <Printer className="h-4 w-4" />
            {printKot.isPending ? t("pos.print.printing") : t("pos.print.kotThermal")}
          </Button>
          </div>
        </div>
        {!locked && (
          <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            {t("pos.checkout.payLaterHint")}
          </p>
        )}
      </div>

      {paidSoFar.length > 0 && (
        <div className="rounded-xl border border-border px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">{t("pos.checkout.paymentsSoFar")}</p>
          <ul className="mt-1 flex flex-col gap-0.5 text-sm">
            {paidSoFar.map((p) => (
              <li key={p.id} className="flex justify-between tabular-nums">
                <span>{methodLabel(p.method)}</span>
                <span>{formatCurrency(p.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pos.checkout.lockedHint")}
          </p>
        </div>
      )}

      <CustomerPicker branchId={branchId} customer={customer} onSelect={setCustomer} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="discount">{t("pos.checkout.discountPercent")}</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            dir="ltr"
            className="h-11"
            value={discountPercent}
            disabled={locked || !canDiscount}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
          {!canDiscount && (
            <p className="text-[11px] text-muted-foreground">{t("pos.checkout.noDiscountRole")}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tip">{t("common.tip")}</Label>
          <Input
            id="tip"
            type="number"
            min="0"
            dir="ltr"
            className="h-11"
            value={tipAmount}
            disabled={locked}
            onChange={(e) => setTipAmount(e.target.value)}
          />
        </div>
      </div>

      {customer && customer.loyaltyPoints > 0 && !locked && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="points">{t("pos.checkout.redeemPoints")}</Label>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() =>
                setPointsToRedeem(String(Math.min(customer.loyaltyPoints, Math.floor(bill?.totalDue ?? 0))))
              }
            >
              {t("pos.checkout.maxPoints", { n: customer.loyaltyPoints })}
            </button>
          </div>
          <Input
            id="points"
            type="number"
            min="0"
            max={customer.loyaltyPoints}
            dir="ltr"
            className="h-11"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
          />
        </div>
      )}

      {canDiscount && !locked && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon">{t("pos.checkout.couponCode")}</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              className="h-11"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={t("pos.checkout.couponPlaceholder")}
              dir="ltr"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={!couponInput.trim() && !appliedCoupon}
              onClick={applyCoupon}
            >
              {t("common.apply")}
            </Button>
          </div>
        </div>
      )}

      {!locked && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="gift-card">{t("pos.checkout.giftCardCode")}</Label>
          <div className="flex gap-2">
            <Input
              id="gift-card"
              className="h-11"
              value={giftCardCode}
              onChange={(e) => {
                setGiftCardCode(e.target.value);
                setGiftCardBalance(null);
              }}
              placeholder={t("pos.checkout.giftCardPlaceholder")}
              dir="ltr"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={!giftCardCode || checkingGiftCard}
              onClick={checkGiftCard}
            >
              {checkingGiftCard ? "…" : t("pos.checkout.check")}
            </Button>
          </div>
          {giftCardBalance !== null && (
            <p className="text-xs text-success">
              {t("pos.checkout.giftCardBalance", {
                balance: formatCurrency(giftCardBalance),
                applied: formatCurrency(giftCardApplied),
              })}
            </p>
          )}
        </div>
      )}

      {billQuery.isError && !bill ? (
        <QueryError
          error={billQuery.error}
          what={t("pos.checkout.whatBill")}
          onRetry={() => void billQuery.refetch()}
          retrying={billQuery.isFetching}
        />
      ) : (
        <>
          {remainingDue > 0 && (
            <div className="flex flex-col gap-2">
              <Label>{t("pos.paymentMethod")}</Label>
              <PaymentMethodButtons methods={methods} value={method} onChange={setMethod} />
            </div>
          )}

          {remainingDue > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">{method === "CASH" ? t("pos.checkout.cashReceived") : t("pos.checkout.amountNow")}</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                dir="ltr"
                className="h-12 text-lg tabular-nums"
                value={amountText}
                placeholder={String(remainingDue)}
                onChange={(e) => setAmountText(e.target.value)}
              />
              {plan.valid && plan.change > 0 && (
                <p className="rounded-lg bg-success/10 px-3 py-2 text-base font-semibold tabular-nums text-success" role="status">
                  {t("pos.checkout.changeDue", { amount: formatCurrency(plan.change) })}
                </p>
              )}
              {plan.valid && plan.partial && (
                <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning" role="status">
                  {t("pos.checkout.partPaymentHint", { amount: formatCurrency(plan.balanceAfter) })}
                </p>
              )}
              {plan.clamped && (
                <p className="text-xs text-muted-foreground" role="status">
                  {t("pos.checkout.clampedHint", { method: methodLabel(method), amount: formatCurrency(remainingDue) })}
                </p>
              )}
            </div>
          )}

          {method === "UPI" && remainingDue > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4">
              {upiUri ? (
                <>
                  <QRCodeSVG value={upiUri} size={176} level="M" marginSize={1} />
                  <p className="text-xs font-medium text-[#17251d]">
                    {t("pos.checkout.upiScan", { amount: formatCurrency(upiAmount) })}
                  </p>
                  <p className="text-[11px] text-neutral-500">{t("pos.checkout.upiAlsoOnDisplay")}</p>
                </>
              ) : (
                <p className="text-center text-xs text-neutral-600">
                  {t("pos.checkout.upiMissing")}{" "}
                  <Link href="/settings" className="font-medium underline">
                    {t("pos.checkout.upiMissingLink")}
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <Label htmlFor="split" className="text-xs text-muted-foreground">
              {t("pos.checkout.splitBetween")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="split"
                type="number"
                min="1"
                dir="ltr"
                value={splitCount}
                onChange={(e) => setSplitCount(e.target.value)}
                className="h-8 w-16 text-center"
              />
              <span className="text-xs text-muted-foreground">{t("pos.checkout.guestsUnit")}</span>
            </div>
          </div>
          {split > 1 && bill && (
            <p className="-mt-2 text-center text-xs text-muted-foreground">
              {t("pos.checkout.splitHint", { amount: formatCurrency(round2(balance / split)) })}
            </p>
          )}
        </>
      )}

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <BillSummary bill={bill} giftCardApplied={giftCardApplied} pending={repricing || billQuery.isFetching} />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={!bill}
            onClick={printBill}
            title={t("pos.print.billTitle")}
          >
            <Printer className="h-4 w-4" />
            {t("pos.print.bill")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={!bill || printUsb.isPending}
            onClick={printBillThermal}
            title={t("pos.print.billThermalTitle")}
          >
            <Printer className="h-4 w-4" />
            {printUsb.isPending ? t("pos.print.printing") : t("pos.print.billThermal")}
          </Button>
        </div>

        <Button
          className="h-12 text-base"
          disabled={checkout.isPending || !bill || repricing || !plan.valid}
          onClick={handleCheckout}
        >
          {checkout.isPending
            ? t("pos.checkout.processing")
            : plan.partial
              ? partialLabel
              : plan.change > 0
                ? t("pos.checkout.completeWithChange", { amount: formatCurrency(plan.change) })
                : t("pos.checkout.complete")}
        </Button>
      </div>
    </div>
  );
}

// The settlement summary: every figure on the printed bill, in the same order.
function BillSummary({
  bill,
  giftCardApplied,
  pending,
}: {
  bill: BillPreview | undefined;
  giftCardApplied: number;
  pending: boolean;
}) {
  const { t } = useI18n();
  if (!bill) {
    return <p className="text-sm text-muted-foreground">{t("pos.checkout.pricing")}</p>;
  }
  const source = bill.couponCode
    ? t("pos.checkout.couponSource", { code: bill.couponCode })
    : bill.promotionName
      ? bill.promotionName
      : bill.discountType === "FIXED"
        ? t("pos.checkout.flatDiscount")
        : null;
  return (
    <div className={pending ? "opacity-70" : undefined} aria-busy={pending}>
      <dl className="flex flex-col gap-1 text-sm">
        <Row label={t("common.subtotal")} value={formatCurrency(bill.subtotal)} />
        {bill.discountAmount > 0 && (
          <Row
            label={source ? t("pos.checkout.discountWithSource", { source }) : t("common.discount")}
            value={`− ${discountSummary(bill.discountPercent, bill.discountAmount, formatCurrency)}`}
            accent
          />
        )}
        <Row label={t("pos.checkout.taxIncluded")} value={formatCurrency(bill.taxAmount)} muted />
        {bill.loyaltyDiscountAmount > 0 && (
          <Row
            label={t("pos.checkout.loyaltyPts", { n: bill.loyaltyPointsRedeemed })}
            value={`− ${formatCurrency(bill.loyaltyDiscountAmount)}`}
            accent
          />
        )}
        {bill.tipAmount > 0 && <Row label={t("common.tip")} value={formatCurrency(bill.tipAmount)} />}
        {bill.deliveryFee > 0 && <Row label={t("pos.checkout.deliveryFee")} value={formatCurrency(bill.deliveryFee)} />}
      </dl>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-medium text-foreground">{t("pos.checkout.totalDue")}</span>
        <span className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(bill.totalDue)}</span>
      </div>
      {bill.amountPaid > 0 && (
        <dl className="mt-1 flex flex-col gap-1 text-sm">
          <Row label={t("pos.checkout.paidSoFar")} value={formatCurrency(bill.amountPaid)} />
        </dl>
      )}
      {giftCardApplied > 0 && <Row label={t("common.paymentMethod.GIFT_CARD")} value={`− ${formatCurrency(giftCardApplied)}`} accent />}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("common.balanceDue")}</span>
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatCurrency(Math.max(round2(bill.balanceDue - giftCardApplied), 0))}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={muted ? "text-xs text-muted-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={`tabular-nums ${accent ? "text-success" : muted ? "text-xs text-muted-foreground" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
