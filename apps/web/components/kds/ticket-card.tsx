"use client";

import { ApiError } from "@/lib/api";
import { ChevronRight, Flame, Globe, Printer, Star, Timer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Tone } from "@/components/ui/stat-card";
import { TONE_SOFT } from "@/components/ui/stat-card";
import { ContactDetailsDialog } from "@/components/contact-details-dialog";
import { ReasonDialog } from "@/components/orders/reason-dialog";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import {
  NEXT_STATUS,
  useRejectKot,
  useReprintKot,
  useSetKotPriority,
  useUpdateKotStatus,
  type KotTicket,
} from "@/hooks/use-kds";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

// Message keys; translated at render time.
const STATUS_LABEL: Record<string, string> = {
  NEW: "kds.action.accept",
  ACCEPTED: "kds.action.startPreparing",
  PREPARING: "kds.action.markReady",
  READY: "kds.action.markServed",
};

const REJECT_REASONS = [
  "kds.rejectReason.outOfStock",
  "kds.rejectReason.itemUnavailable",
  "kds.rejectReason.tooBusy",
  "kds.rejectReason.equipment",
];

// A ticket this young is new enough to draw the eye (and it stops on its own).
const FRESH_MINUTES = 2;
// Late (warning) is the long-standing 15-minute mark; twice that reads as overdue.
const LATE_MINUTES = 15;
const OVERDUE_MINUTES = LATE_MINUTES * 2;

const STRIP: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info",
  neutral: "bg-transparent",
  gold: "bg-status-gold",
};

function useElapsedMinutes(createdAt: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const compute = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000)));
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function customerDisplayName(order: KotTicket["order"]) {
  return order.customer?.name || order.guestName || null;
}

function customerPhone(order: KotTicket["order"]) {
  return order.customer?.phone || null;
}

export function TicketCard({ ticket, branchId }: { ticket: KotTicket; branchId: string | null }) {
  const { t } = useI18n();
  const elapsed = useElapsedMinutes(ticket.createdAt);
  const updateStatus = useUpdateKotStatus(branchId);
  const setPriority = useSetKotPriority(branchId);
  const reprint = useReprintKot(branchId);
  const { note, clear: clearNote, toast } = useNoteToast();
  const nextStatus = NEXT_STATUS[ticket.status];
  const isLate = elapsed >= LATE_MINUTES;
  const isOverdue = elapsed >= OVERDUE_MINUTES;
  const isFresh = ticket.status === "NEW" && elapsed < FRESH_MINUTES;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const reject = useRejectKot(branchId);
  const { data: me } = useCurrentUser();
  // Rejecting before cooking starts is for anyone on the kitchen screen; food
  // already on the stove is a manager's call (the server enforces the same).
  const started = ticket.status === "PREPARING";
  const canReject =
    (ticket.status === "NEW" || ticket.status === "ACCEPTED" || started) &&
    (!started || hasPermission(me?.user, "orders.cancel"));

  const timerTone: Tone = isOverdue ? "danger" : isLate ? "warning" : "neutral";
  const stripTone: Tone = isOverdue ? "danger" : isLate ? "warning" : ticket.isPriority ? "gold" : isFresh ? "primary" : "neutral";
  const customer = customerDisplayName(ticket.order);
  const where = ticket.order.table
    ? t("kds.tableN", { n: ticket.order.table.number })
    : t(`common.orderType.${ticket.order.type}`);

  return (
    <Card
      className={cn(
        "relative shrink-0 gap-3 p-3.5 shadow-sm sm:p-4",
        isOverdue && "border-status-danger/40",
        !isOverdue && (isLate || ticket.isPriority) && "border-status-warning/40",
        isFresh && "border-primary/60 ring-2 ring-primary/25",
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", STRIP[stripTone])} />
      <StatusNote note={note} onClear={clearNote} />
      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t("kds.rejectTitle", { n: ticket.order.orderNumber })}
        description={
          ticket.order.table
            ? t("kds.rejectDescriptionTable", { table: ticket.order.table.number })
            : t("kds.rejectDescriptionGuest")
        }
        warning={started ? t("kds.rejectStartedWarning") : undefined}
        reasons={REJECT_REASONS.map((key) => t(key))}
        confirmLabel={t("kds.rejectTicket")}
        keepLabel={t("kds.keepTicket")}
        onSubmit={(reason) =>
          reject.mutateAsync({ id: ticket.id, reason, confirmStarted: started ? true : undefined })
        }
      />
      <ContactDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={t("kds.orderN", { n: ticket.order.orderNumber })}
        name={customer}
        subtitle={where}
        phone={customerPhone(ticket.order)}
        waMessage={t("kds.waMessage", { name: customer ?? "", n: ticket.order.orderNumber })}
      />

      {/* Header: big order number, where it goes, and how long it has waited */}
      {/* Wraps: a long order number keeps its line and the timer drops below it. */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="group/head -m-1 flex min-w-0 flex-col items-start gap-1.5 rounded-xl p-1 text-start transition-colors hover:bg-muted/60"
          title={t("kds.viewCustomer")}
        >
          <span className="flex max-w-full min-w-0 items-center gap-1.5">
            <bdi className="text-xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums text-foreground xl:text-2xl">
              #{ticket.order.orderNumber}
            </bdi>
            <ChevronRight
              className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/head:opacity-100 rtl:-scale-x-100"
              aria-hidden
            />
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-6 items-center rounded-md bg-accent px-2 text-xs font-semibold text-accent-foreground">
              {where}
            </span>
            {ticket.order.channel === "ONLINE" && (
              <span
                className="inline-flex h-6 items-center gap-1 rounded-md bg-status-info-soft px-1.5 text-xs font-medium text-status-info"
                title={t("kds.onlineOrder")}
              >
                <Globe className="size-3.5" aria-label={t("kds.onlineOrder")} />
              </span>
            )}
            {ticket.isPriority && (
              <span className="inline-flex h-6 items-center gap-1 rounded-md bg-status-gold-soft px-2 text-xs font-semibold text-status-gold">
                <Star className="size-3 fill-current" aria-hidden />
                {t("kds.priority")}
              </span>
            )}
          </span>
          {(ticket.station || customer) && (
            <span className="truncate text-xs text-muted-foreground">
              {[ticket.station?.name, customer].filter(Boolean).join(" · ")}
            </span>
          )}
        </button>
        <span
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-semibold tabular-nums",
            TONE_SOFT[timerTone],
            isOverdue && "motion-safe:animate-pulse",
          )}
        >
          <Timer className="size-3.5" aria-hidden />
          {t("kds.minutesShort", { n: elapsed })}
        </span>
      </div>

      {ticket.order.notes && (
        <p className="flex items-start gap-1.5 rounded-xl bg-status-warning-soft px-2.5 py-2 text-sm font-medium text-status-warning">
          <Flame className="mt-0.5 size-4 shrink-0" aria-hidden /> {ticket.order.notes}
        </p>
      )}

      {/* Items: quantity first and large so it reads from across the pass */}
      <ul className="flex flex-col gap-2.5 border-t border-dashed border-border pt-3">
        {ticket.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 px-1.5 text-base font-bold tabular-nums text-foreground ring-1 ring-border/70">
              {item.orderItem.quantity}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <p className="text-[15px] leading-snug font-semibold text-foreground">
                {item.orderItem.nameSnapshot}
              </p>
              {item.orderItem.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.orderItem.modifiers.map((m, i) => (
                    <span
                      key={`${m.nameSnapshot}-${i}`}
                      className="rounded-md bg-status-info-soft px-1.5 py-0.5 text-xs font-medium text-status-info"
                    >
                      + {m.nameSnapshot}
                    </span>
                  ))}
                </div>
              )}
              {item.orderItem.kitchenNote && (
                <p className="flex items-start gap-1 rounded-lg bg-status-warning-soft px-2 py-1 text-xs font-medium text-status-warning">
                  <Flame className="mt-px size-3.5 shrink-0" aria-hidden /> {item.orderItem.kitchenNote}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* One big next step, then the secondary actions */}
      <div className="flex flex-col gap-2 pt-1">
        {nextStatus && (
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate(
                { id: ticket.id, status: nextStatus },
                {
                  onError: (err) =>
                    toast.error(err instanceof ApiError ? err.message : t("kds.updateFailed")),
                },
              )
            }
          >
            {updateStatus.isPending ? t("kds.updating") : t(STATUS_LABEL[ticket.status])}
          </Button>
        )}
        <div className="flex items-center gap-2">
          {canReject && (
            <Button
              variant="destructive"
              className="h-11 flex-1 px-3"
              onClick={() => setRejectOpen(true)}
              aria-label={t("kds.rejectAria", { n: ticket.order.orderNumber })}
            >
              <X className="size-4" aria-hidden />
              {t("kds.reject")}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-lg"
            className={cn("ms-auto shrink-0", ticket.isPriority && "border-status-gold/40 bg-status-gold-soft")}
            title={ticket.isPriority ? t("kds.unmarkPriority") : t("kds.markPriority")}
            aria-label={ticket.isPriority ? t("kds.unmarkPriority") : t("kds.markPriority")}
            aria-pressed={ticket.isPriority}
            disabled={setPriority.isPending}
            onClick={() => setPriority.mutate({ id: ticket.id, isPriority: !ticket.isPriority })}
          >
            <Star className={cn("size-5", ticket.isPriority && "fill-status-gold text-status-gold")} />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="shrink-0"
            title={ticket.printedCount > 0 ? t("kds.reprintTitle") : t("kds.printTicket")}
            aria-label={ticket.printedCount > 0 ? t("kds.reprintTicket") : t("kds.printTicket")}
            disabled={reprint.isPending}
            onClick={() =>
              reprint.mutate(
                { id: ticket.id, reprint: ticket.printedCount > 0 },
                {
                  onSuccess: () =>
                    toast.success(ticket.printedCount > 0 ? t("kds.reprintSent") : t("kds.printSent")),
                  onError: (err) =>
                    toast.error(err instanceof ApiError ? err.message : t("kds.printFailed")),
                },
              )
            }
          >
            <Printer className="size-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
