"use client";

import { Check, MessageCircle, NotebookPen, Pencil, Phone, User, X } from "lucide-react";
import { useState } from "react";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChannelBadge, TypeBadge } from "@/components/orders/channel-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tone } from "@/components/ui/stat-card";
import { KOT_STATUS_TONE, ORDER_STATUS_TONE, StatusPill } from "@/components/ui/status-pill";
import { CancelOrderDialog, useCanCancelOrders } from "@/components/orders/cancel-order-dialog";
import { EditBillDialog } from "@/components/orders/edit-bill-dialog";
import { ReasonDialog } from "@/components/orders/reason-dialog";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useAcceptOrder, useOrder, useRejectOrder, type OrderDetail } from "@/hooks/use-orders";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Labels: orders.detail.cancelSource.<SOURCE>, translated at render time.
const CANCEL_SOURCES = new Set(["STAFF", "CUSTOMER", "KITCHEN_REJECTED", "ONLINE_DECLINED"]);
const KNOWN_METHODS = new Set([
  "APPLE_PAY",
  "BANK_TRANSFER",
  "CARD",
  "CASH",
  "GIFT_CARD",
  "MADA",
  "OTHER",
  "STC_PAY",
  "STORE_CREDIT",
  "UPI",
  "WALLET",
]);

type T = (key: string, vars?: Record<string, string | number>) => string;
type StepState = "done" | "current" | "todo" | "failed";

/** Progress of the order, read only from fields the order already carries. */
function timeline(order: OrderDetail, t: T): { key: string; label: string; at?: string | null; state: StepState }[] {
  const steps: { key: string; label: string; at?: string | null; state: StepState }[] = [
    { key: "placed", label: t("orders.timeline.placed"), at: order.createdAt, state: "done" },
  ];
  if (order.acceptance !== "NOT_REQUIRED") {
    steps.push({
      key: "accepted",
      label: order.acceptance === "REJECTED" ? t("orders.rejected") : t("orders.timeline.accepted"),
      state: order.acceptance === "ACCEPTED" ? "done" : order.acceptance === "REJECTED" ? "failed" : "current",
    });
  }
  if (order.status === "CANCELLED") {
    if (order.acceptance !== "REJECTED") {
      steps.push({ key: "cancelled", label: t("common.orderStatus.CANCELLED"), state: "failed" });
    }
    return steps;
  }
  const paid = order.status === "PAID";
  const billed = paid || order.status === "BILLED" || !!order.billedAt;
  const lastPayment = order.payments?.length ? order.payments[order.payments.length - 1].createdAt : null;
  const waiting = order.acceptance === "PENDING";
  steps.push({
    key: "billed",
    label: t("orders.timeline.billed"),
    at: order.billedAt,
    state: billed ? "done" : waiting ? "todo" : "current",
  });
  steps.push({
    key: "paid",
    label: t("common.orderStatus.PAID"),
    at: paid ? lastPayment : null,
    state: paid ? "done" : billed ? "current" : "todo",
  });
  return steps;
}

const DOT: Record<StepState, string> = {
  done: "bg-primary border-primary",
  current: "bg-card border-primary ring-4 ring-primary/15",
  todo: "bg-card border-border",
  failed: "bg-status-danger border-status-danger",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</h3>;
}

function Line({
  label,
  value,
  strong,
  muted,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3",
        strong ? "text-base font-semibold text-foreground" : muted ? "text-muted-foreground" : "text-foreground",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

const positive = (v: string | null | undefined) => Number(v ?? 0) > 0;

export function OrderDetailDialog({
  branchId,
  orderId,
  open,
  onOpenChange,
}: {
  branchId: string | null;
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { data: order, isLoading } = useOrder(branchId, open ? orderId : null);
  const accept = useAcceptOrder(branchId);
  const reject = useRejectOrder(branchId);
  const { note, clear: clearNote, toast } = useNoteToast();
  const canCancelRole = useCanCancelOrders();
  const { data: me } = useCurrentUser();
  const canEditRole = hasPermission(me?.user, "orders.edit");
  const canAnswer = hasPermission(me?.user, "orders.accept");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const customerName = order?.guestName ?? order?.customer?.name ?? t("orders.walkIn");
  const pending = order?.status === "OPEN" && order?.acceptance === "PENDING";
  const canCancel = order?.status === "OPEN" && !pending;
  const run = (fn: () => Promise<unknown>, done: string) =>
    fn().then(
      () => {
        toast.success(done);
        onOpenChange(false);
      },
      (err: unknown) => toast.error(err instanceof Error ? err.message : t("common.error")),
    );
  const phone = order?.customer?.phone ?? null;
  const waHref = phone
    ? `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        t("orders.detail.whatsappText", { number: order?.orderNumber ?? "" }),
      )}`
    : null;

  const status: { tone: Tone; label: string } | null = order
    ? pending
      ? { tone: "gold", label: t("orders.detail.awaiting") }
      : order.acceptance === "REJECTED"
        ? { tone: "danger", label: t("orders.rejected") }
        : { tone: ORDER_STATUS_TONE[order.status] ?? "neutral", label: t(`common.orderStatus.${order.status}`) }
    : null;
  const hasActions = !!order && ((pending && canAnswer) || canCancel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        {/* Receipt head */}
        <DialogHeader className="gap-3 border-b border-dashed border-border bg-surface-2/70 px-5 pt-5 pb-4 pe-12">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
            {order ? (
              <span className="font-semibold">
                {t("common.order")} <bdi className="tabular-nums">#{order.orderNumber}</bdi>
              </span>
            ) : (
              t("orders.detail.title")
            )}
            {status && (
              <StatusPill tone={status.tone} pulse={pending}>
                {status.label}
              </StatusPill>
            )}
          </DialogTitle>
          {order && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <ChannelBadge channel={order.channel} />
              <TypeBadge type={order.type} />
              {order.table && (
                <span className="inline-flex h-6 items-center rounded-full bg-accent px-2.5 font-medium text-accent-foreground">
                  {order.table.name ?? t("orders.edit.tableN", { n: order.table.number })}
                </span>
              )}
              {order.guestCount ? (
                <span className="text-muted-foreground">
                  · {t("common.guests")} <span className="tabular-nums">{order.guestCount}</span>
                </span>
              ) : null}
              <span className="text-muted-foreground">· {formatDateTime(order.createdAt)}</span>
            </div>
          )}
        </DialogHeader>
        <div className="px-5 pt-3 empty:hidden">
          <StatusNote note={note} onClear={clearNote} />
        </div>

        {isLoading || !order ? (
          <div className="flex flex-col gap-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-5 py-4 text-sm">
            {/* Timeline */}
            <section aria-label={t("orders.detail.timeline")} className="flex flex-col gap-2">
              <SectionTitle>{t("orders.detail.timeline")}</SectionTitle>
              <ol className="flex items-start">
                {timeline(order, t).map((step, i, all) => (
                  <li key={step.key} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
                    {i < all.length - 1 && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-[7px] start-1/2 h-0.5 w-full",
                          step.state === "done" ? "bg-primary/60" : "bg-border",
                        )}
                      />
                    )}
                    <span
                      aria-hidden
                      className={cn("relative z-[1] flex size-4 items-center justify-center rounded-full border-2", DOT[step.state])}
                    >
                      {step.state === "done" && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                      {step.state === "failed" && <X className="size-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        step.state === "todo" ? "text-muted-foreground" : step.state === "failed" ? "text-status-danger" : "text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {step.at && <span className="text-[11px] tabular-nums text-muted-foreground">{formatTime(step.at)}</span>}
                  </li>
                ))}
              </ol>
              {order.kots.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">{t("orders.detail.kitchen")}</span>
                  {order.kots.map((k) => (
                    <StatusPill key={k.id} tone={KOT_STATUS_TONE[k.status] ?? "neutral"}>
                      {t(`common.kotStatus.${k.status}`)}
                    </StatusPill>
                  ))}
                </div>
              )}
            </section>

            {/* Items */}
            <section className="flex flex-col gap-2">
              <SectionTitle>{t("common.items")}</SectionTitle>
              <ul className="flex flex-col divide-y divide-dashed divide-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0">
                    <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 px-1 text-sm font-semibold tabular-nums text-foreground">
                      {item.quantity}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                      <span className="font-medium text-foreground">{item.nameSnapshot}</span>
                      {item.modifiers.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {item.modifiers.map((m) => m.nameSnapshot).join(", ")}
                        </span>
                      )}
                      {item.kitchenNote && <span className="text-xs text-status-warning">{item.kitchenNote}</span>}
                    </div>
                    <span className="pt-0.5 font-medium tabular-nums text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Totals */}
            <section className="flex flex-col gap-1.5 rounded-2xl bg-surface-2 px-4 py-3">
              <Line muted label={t("common.subtotal")} value={formatCurrency(order.subtotal)} />
              {positive(order.discountAmount) && (
                <Line muted label={t("common.discount")} value={`−${formatCurrency(order.discountAmount)}`} />
              )}
              {positive(order.loyaltyDiscountAmount) && (
                <Line muted label={t("orders.detail.loyalty")} value={`−${formatCurrency(order.loyaltyDiscountAmount)}`} />
              )}
              {positive(order.deliveryFee) && (
                <Line muted label={t("orders.detail.deliveryFee")} value={formatCurrency(order.deliveryFee ?? 0)} />
              )}
              <Line muted label={t("common.vat")} value={formatCurrency(order.taxAmount)} />
              {positive(order.tipAmount) && <Line muted label={t("common.tip")} value={formatCurrency(order.tipAmount)} />}
              <div className="my-1 border-t border-dashed border-border" />
              <Line strong label={t("common.total")} value={formatCurrency(order.totalAmount)} />
            </section>

            {/* Payments */}
            {(order.payments ?? []).length > 0 && (
              <section className="flex flex-col gap-2">
                <SectionTitle>{t("orders.detail.payments")}</SectionTitle>
                <ul className="flex flex-col gap-1.5">
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/80 px-3 py-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-foreground">
                          {KNOWN_METHODS.has(p.method) ? t(`common.paymentMethod.${p.method}`) : p.method}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatTime(p.createdAt)}
                          {positive(p.tendered) && ` · ${t("orders.detail.tendered", { amount: formatCurrency(p.tendered ?? 0) })}`}
                          {positive(p.changeGiven) && ` · ${t("common.change")} ${formatCurrency(p.changeGiven ?? 0)}`}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums text-foreground">{formatCurrency(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Customer */}
            <section className="flex flex-col gap-2">
              <SectionTitle>{t("common.customer")}</SectionTitle>
              <div className="flex flex-col gap-3 rounded-2xl border border-border/80 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <User className="size-4" aria-hidden />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">{customerName}</span>
                    {phone ? (
                      <bdi dir="ltr" className="text-xs text-muted-foreground tabular-nums">
                        {phone}
                      </bdi>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("orders.detail.noPhone")}</span>
                    )}
                  </div>
                </div>
                {phone && (
                  <div className="flex gap-2">
                    <a href={`tel:${phone}`} className={cn(buttonVariants({ variant: "outline" }), "h-10 flex-1")}>
                      <Phone className="size-4" aria-hidden /> {t("orders.detail.call")}
                    </a>
                    <a
                      href={waHref ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }), "h-10 flex-1")}
                    >
                      <MessageCircle className="size-4" aria-hidden /> WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </section>

            {order.notes && (
              <p className="flex items-start gap-2 rounded-xl bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
                <NotebookPen className="mt-px size-3.5 shrink-0" aria-hidden />
                {t("orders.detail.note", { note: order.notes })}
              </p>
            )}

            {pending && !canAnswer && (
              <p className="rounded-xl bg-status-gold-soft px-3 py-2 text-xs text-status-gold">
                {t("orders.detail.waitingPermission")}
              </p>
            )}
            {order.status === "CANCELLED" && (
              <p className="rounded-xl bg-status-neutral-soft px-3 py-2 text-xs text-status-neutral">
                {t(`orders.detail.cancelSource.${CANCEL_SOURCES.has(order.cancelSource ?? "") ? order.cancelSource : "STAFF"}`)}
                {order.cancelReason ? `: ${order.cancelReason}` : ""}
              </p>
            )}
            {order.status === "PAID" && (
              <p className="rounded-xl bg-status-success-soft px-3 py-2 text-xs text-status-success">
                {t("orders.detail.paidHint")}
              </p>
            )}

            <CancelOrderDialog
              branchId={branchId}
              orderId={order.id}
              orderNumber={order.orderNumber}
              open={cancelOpen}
              onOpenChange={setCancelOpen}
            />
            <EditBillDialog branchId={branchId} orderId={order.id} open={editOpen} onOpenChange={setEditOpen} />
            <ReasonDialog
              open={declineOpen}
              onOpenChange={setDeclineOpen}
              title={t("orders.detail.declineTitle", { number: order.orderNumber })}
              description={t("orders.detail.declineDescription")}
              reasons={[
                t("orders.detail.declineReason.closingSoon"),
                t("orders.cancel.reason.outOfStock"),
                t("orders.detail.declineReason.tooBusy"),
                t("orders.detail.declineReason.outsideArea"),
              ]}
              confirmLabel={t("orders.detail.declineConfirm")}
              keepLabel={t("orders.detail.goBack")}
              onSubmit={(reason) =>
                reject.mutateAsync({ orderId: order.id, reason }).then(() => {
                  toast.success(t("orders.detail.declined"));
                  onOpenChange(false);
                })
              }
            />
          </div>
        )}

        {/* Actions, pinned to the bottom of the scrolling dialog */}
        {hasActions && order && (
          <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border/80 bg-popover px-5 py-3 sm:flex-row">
            {pending && canAnswer && (
              <>
                <Button
                  className="h-11 flex-1"
                  disabled={accept.isPending}
                  onClick={() => run(() => accept.mutateAsync(order.id), t("orders.detail.accepted"))}
                >
                  <Check className="size-4" aria-hidden /> {t("orders.detail.accept")}
                </Button>
                <Button variant="destructive" className="h-11 flex-1" onClick={() => setDeclineOpen(true)}>
                  <X className="size-4" aria-hidden /> {t("orders.detail.decline")}
                </Button>
              </>
            )}
            {canCancel && (
              <>
                {canEditRole && (
                  <Button variant="outline" className="h-11 flex-1" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" aria-hidden /> {t("orders.edit.title")}
                  </Button>
                )}
                {canCancelRole ? (
                  <Button variant="destructive" className="h-11 flex-1" onClick={() => setCancelOpen(true)}>
                    <X className="size-4" aria-hidden /> {t("orders.cancel.confirm")}
                  </Button>
                ) : (
                  <p className="flex-1 self-center text-xs text-muted-foreground">{t("orders.detail.needsManager")}</p>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
