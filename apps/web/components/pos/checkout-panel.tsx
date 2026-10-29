"use client";

import { kitchenProgress, type PaymentMethodDto } from "@nodedr-restaurant/types";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Gift,
  Info,
  Loader2,
  Pencil,
  Percent,
  Printer,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryError } from "@/components/ui/query-error";
import { KOT_STATUS_TONE, StatusPill } from "@/components/ui/status-pill";
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
import { cn } from "@/lib/utils";

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
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto py-6 text-center">
        <StatusNote note={note} onClear={clearNote} className="w-full text-start" />
        <span className="flex size-16 items-center justify-center rounded-full bg-status-success-soft text-status-success ring-8 ring-status-success-soft/50">
          <CheckCircle2 className="size-8" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {t("pos.checkout.orderPaid")} <bdi className="text-foreground">#{order.orderNumber}</bdi>
          </p>
          <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatCurrency(completed.totalAmount)}
          </p>
        </div>
        {settlement.changeDue > 0 && (
          <p className="rounded-2xl bg-status-success-soft px-5 py-3 text-xl font-semibold text-status-success tabular-nums">
            {t("pos.checkout.changeDue", { amount: formatCurrency(settlement.changeDue) })}
          </p>
        )}
        {Number(completed.loyaltyDiscountAmount) > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("pos.checkout.pointsRedeemed", { n: completed.loyaltyPointsRedeemed })}
          </p>
        )}
        <div className="mt-2 grid w-full max-w-sm grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => branchId && openReceiptPrint(completed.id, branchId)}
          >
            <Printer className="size-4" />
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
            <Printer className="size-4" />
            {printUsb.isPending ? t("pos.print.printing") : t("pos.print.receiptThermal")}
          </Button>
          <Button className="col-span-2 h-14 rounded-2xl text-base font-semibold" onClick={onDone}>
            {t("pos.checkout.newOrder")}
          </Button>
        </div>
      </div>
    );
  }

  // Someone else (another terminal) already closed this bill.
  if (order.status === "CANCELLED" || (order.status === "PAID" && !completed)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
        <StatusNote note={note} onClear={clearNote} className="w-full text-start" />
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            order.status === "CANCELLED" ? "bg-status-neutral-soft text-status-neutral" : "bg-status-success-soft text-status-success",
          )}
        >
          {order.status === "CANCELLED" ? <XCircle className="size-7" /> : <CheckCircle2 className="size-7" />}
        </span>
        <p className="text-sm font-semibold text-foreground">
          {order.status === "CANCELLED" ? t("pos.checkout.wasCancelled") : t("pos.checkout.wasAlreadyPaid")}{" "}
          <bdi>#{order.orderNumber}</bdi>
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {order.status === "CANCELLED"
            ? t("pos.checkout.cancelledHint")
            : t("pos.checkout.nothingMore")}
        </p>
        <Button className="mt-2 h-11 min-w-40" onClick={onDone}>{t("common.done")}</Button>
      </div>
    );
  }

  const kitchen = live ? kitchenProgress(live.kots.map((k) => k.status)) : null;
  const paidSoFar = live?.payments ?? [];
  const partialLabel = t("pos.checkout.recordPartial", { amount: formatCurrency(plan.applied) });
  const amountDue = bill ? Math.max(round2(bill.balanceDue - giftCardApplied), 0) : null;

  // Cash shortcuts: the exact amount, then the next round notes above it.
  const quickCash =
    method === "CASH" && remainingDue > 0
      ? [remainingDue, ...[5, 10, 50, 100, 500].map((step) => Math.ceil(remainingDue / step) * step)]
          .map(round2)
          .filter((v, i, all) => all.indexOf(v) === i)
          .slice(0, 4)
      : [];

  const adjustmentsSummary = [
    Number(discountPercent) > 0 ? `−${Number(discountPercent)}%` : null,
    Number(tipAmount) > 0 ? `+${formatCurrency(Number(tipAmount))}` : null,
    appliedCoupon || null,
    Number(pointsToRedeem) > 0 ? t("pos.customer.points", { n: Math.floor(Number(pointsToRedeem)) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 pb-4 [scrollbar-width:thin]">
        <StatusNote note={note} onClear={clearNote} />

        {/* Header: back, order number, kitchen progress, order actions. */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="-ms-2 shrink-0 text-muted-foreground"
              onClick={onDone}
              aria-label={t("common.back")}
              title={t("common.back")}
            >
              <ArrowLeft className="size-5 rtl:-scale-x-100" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold tracking-tight text-foreground">
                <bdi>{t("pos.page.orderChip", { number: order.orderNumber })}</bdi>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t("pos.checkout.sentToKitchen")} <bdi>#{order.orderNumber}</bdi>
              </p>
            </div>
            {kitchen && (
              <StatusPill tone={KOT_STATUS_TONE[kitchen] ?? "neutral"} pulse={kitchen === "NEW"}>
                <ChefHat className="size-3" aria-hidden />
                {KITCHEN_STATES.has(kitchen) ? t(`pos.checkout.kitchen.${kitchen}`) : kitchen}
              </StatusPill>
            )}
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 shrink-0"
              onClick={() => branchId && openKotPrint(order.id, branchId)}
            >
              <Printer className="size-4" />
              {t("pos.print.kotBrowser")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 shrink-0"
              disabled={printKot.isPending}
              onClick={() => printKotNow(false)}
            >
              <Printer className="size-4" />
              {printKot.isPending ? t("pos.print.printing") : t("pos.print.kotThermal")}
            </Button>
            {canEditRole && !locked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                {t("pos.checkout.editBill")}
              </Button>
            )}
            {canCancelRole && !locked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0 text-destructive hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="size-4" />
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

        {/* Amount due hero + the full bill breakdown. */}
        <div className="rounded-2xl bg-surface-2 p-4 ring-1 ring-border/70">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("pos.checkout.amountDue")}
              </p>
              <p
                className={cn(
                  "mt-1 truncate text-[2rem] leading-none font-semibold tracking-tight text-foreground tabular-nums transition-opacity",
                  (repricing || billQuery.isFetching) && "opacity-60",
                )}
              >
                {amountDue !== null ? formatCurrency(amountDue) : "—"}
              </p>
            </div>
            {split > 1 && bill && (
              <span className="shrink-0 rounded-full bg-status-gold-soft px-2.5 py-1 text-xs font-semibold text-status-gold tabular-nums">
                {t("pos.checkout.perGuest", { amount: formatCurrency(round2(balance / split)), n: split })}
              </span>
            )}
          </div>
          <div className="mt-3 border-t border-dashed border-border pt-3">
            <BillSummary bill={bill} giftCardApplied={giftCardApplied} pending={repricing || billQuery.isFetching} />
          </div>
        </div>

        {!locked && (
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {t("pos.checkout.payLaterHint")}
          </p>
        )}

        {paidSoFar.length > 0 && (
          <div className="rounded-xl border border-border/80 bg-card px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">{t("pos.checkout.paymentsSoFar")}</p>
            <ul className="mt-1.5 flex flex-col gap-1 text-sm">
              {paidSoFar.map((p) => (
                <li key={p.id} className="flex justify-between tabular-nums">
                  <span>{methodLabel(p.method)}</span>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs text-muted-foreground">{t("pos.checkout.lockedHint")}</p>
          </div>
        )}

        <CustomerPicker branchId={branchId} customer={customer} onSelect={setCustomer} />

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
              <div className="@container flex flex-col gap-2">
                <Label>{t("pos.paymentMethod")}</Label>
                <PaymentMethodButtons methods={methods} value={method} onChange={setMethod} />
              </div>
            )}

            {remainingDue > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">
                  {method === "CASH" ? t("pos.checkout.cashReceived") : t("pos.checkout.amountNow")}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  dir="ltr"
                  className="h-14 rounded-xl bg-card text-2xl font-semibold tabular-nums"
                  value={amountText}
                  placeholder={String(remainingDue)}
                  onChange={(e) => setAmountText(e.target.value)}
                />
                {quickCash.length > 0 && (
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label={t("pos.checkout.quickCash")}>
                    {quickCash.map((v, i) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmountText(String(v))}
                        className={cn(
                          "flex h-11 min-w-0 items-center justify-center rounded-xl border px-1 text-sm font-semibold tabular-nums transition-colors active:scale-[0.97]",
                          parseMoney(amountText) === v
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border/80 bg-card text-foreground hover:bg-muted",
                        )}
                      >
                        <span className="truncate">{i === 0 ? t("pos.checkout.exact") : formatCurrency(v)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {plan.valid && plan.change > 0 && (
                  <p
                    className="flex items-center justify-between gap-3 rounded-xl bg-status-success-soft px-3.5 py-3 text-lg font-semibold text-status-success tabular-nums"
                    role="status"
                  >
                    {t("pos.checkout.changeDue", { amount: formatCurrency(plan.change) })}
                  </p>
                )}
                {plan.valid && plan.partial && (
                  <p className="rounded-xl bg-status-warning-soft px-3.5 py-2.5 text-sm text-status-warning" role="status">
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
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4">
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
          </>
        )}

        {/* Optional adjustments, folded away until needed. */}
        <div className="flex flex-col gap-2">
          <Collapsible icon={Percent} title={t("pos.checkout.adjustments")} summary={adjustmentsSummary}>
            <div className="grid grid-cols-2 gap-3">
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
                    className="inline-flex min-h-8 items-center text-xs font-medium text-primary hover:underline"
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
          </Collapsible>

          {!locked && (
            <Collapsible
              icon={Gift}
              title={t("pos.checkout.giftCard")}
              summary={giftCardApplied > 0 ? `−${formatCurrency(giftCardApplied)}` : undefined}
            >
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
                  <p className="text-xs text-status-success">
                    {t("pos.checkout.giftCardBalance", {
                      balance: formatCurrency(giftCardBalance),
                      applied: formatCurrency(giftCardApplied),
                    })}
                  </p>
                )}
              </div>
            </Collapsible>
          )}

          {!(billQuery.isError && !bill) && (
            <Collapsible
              icon={Users}
              title={t("pos.checkout.split")}
              summary={split > 1 ? t("pos.checkout.splitSummary", { n: split }) : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="split" className="text-sm text-muted-foreground">
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
                    className="h-11 w-20 text-center text-base tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">{t("pos.checkout.guestsUnit")}</span>
                </div>
              </div>
              {split > 1 && bill && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("pos.checkout.splitHint", { amount: formatCurrency(round2(balance / split)) })}
                </p>
              )}
            </Collapsible>
          )}
        </div>
      </div>

      {/* Sticky actions */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-border/80 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={!bill}
            onClick={printBill}
            title={t("pos.print.billTitle")}
          >
            <Printer className="size-4" />
            <span className="truncate">{t("pos.print.bill")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={!bill || printUsb.isPending}
            onClick={printBillThermal}
            title={t("pos.print.billThermalTitle")}
          >
            <Printer className="size-4" />
            <span className="truncate">
              {printUsb.isPending ? t("pos.print.printing") : t("pos.print.billThermal")}
            </span>
          </Button>
        </div>

        <Button
          className="h-14 w-full rounded-2xl text-base font-semibold whitespace-normal"
          disabled={checkout.isPending || !bill || repricing || !plan.valid}
          onClick={handleCheckout}
        >
          {checkout.isPending && <Loader2 className="size-5 animate-spin" />}
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

// A tappable row that folds an optional section (discount, gift card, split).
function Collapsible({
  icon: Icon,
  title,
  summary,
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 w-full items-center gap-3 px-3 text-start transition-colors hover:bg-muted/60"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</span>
        {summary && (
          <span className="max-w-[45%] shrink-0 truncate text-xs font-medium text-accent-foreground tabular-nums">
            {summary}
          </span>
        )}
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="flex flex-col gap-3 border-t border-border/70 p-3">
          {children}
        </div>
      )}
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
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("pos.checkout.pricing")}
      </p>
    );
  }
  const source = bill.couponCode
    ? t("pos.checkout.couponSource", { code: bill.couponCode })
    : bill.promotionName
      ? bill.promotionName
      : bill.discountType === "FIXED"
        ? t("pos.checkout.flatDiscount")
        : null;
  return (
    <div className={cn("transition-opacity", pending && "opacity-70")} aria-busy={pending}>
      <dl className="flex flex-col gap-1.5 text-sm">
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
      <div className="mt-2 flex items-center justify-between border-t border-border/80 pt-2">
        <span className="text-sm font-medium text-foreground">{t("pos.checkout.totalDue")}</span>
        <span className="text-base font-semibold text-foreground tabular-nums">{formatCurrency(bill.totalDue)}</span>
      </div>
      {bill.amountPaid > 0 && (
        <dl className="mt-1.5 flex flex-col gap-1 text-sm">
          <Row label={t("pos.checkout.paidSoFar")} value={formatCurrency(bill.amountPaid)} />
        </dl>
      )}
      {giftCardApplied > 0 && (
        <dl className="mt-1 text-sm">
          <Row label={t("common.paymentMethod.GIFT_CARD")} value={`− ${formatCurrency(giftCardApplied)}`} accent />
        </dl>
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("common.balanceDue")}</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
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
      <dd
        className={cn(
          "tabular-nums",
          accent ? "text-status-success" : muted ? "text-xs text-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
