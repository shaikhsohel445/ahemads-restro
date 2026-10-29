"use client";

import { Check, Clock, Flame, Globe, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { ReasonDialog } from "@/components/orders/reason-dialog";
import { useAcceptIncoming, useDeclineIncoming, type IncomingOrder } from "@/hooks/use-kds";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Keys; translated at render time (the chosen text is what gets recorded).
const DECLINE_REASONS = [
  "kds.declineReason.closingSoon",
  "kds.declineReason.outOfStock",
  "kds.declineReason.tooBusy",
  "kds.declineReason.outsideArea",
];

function minutesSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
}

// An order that has come in but nobody has answered yet. It has no kitchen
// ticket until it is accepted, so it lives here, above the ticket columns,
// with a big Accept and a deliberate Decline.
export function IncomingOrderCard({ order, branchId }: { order: IncomingOrder; branchId: string | null }) {
  const { t } = useI18n();
  const accept = useAcceptIncoming(branchId);
  const decline = useDeclineIncoming(branchId);
  const [declineOpen, setDeclineOpen] = useState(false);
  const { note, clear, toast } = useNoteToast();
  const who = order.guestName || order.customer?.name || null;

  return (
    <Card className="relative w-[min(22rem,calc(100vw-3rem))] shrink-0 snap-start gap-3 border-status-gold/50 p-4 shadow-sm ring-2 ring-status-gold/20">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-status-gold" />
      <StatusNote note={note} onClear={clear} />
      <ReasonDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        title={t("kds.declineTitle", { n: order.orderNumber })}
        description={t("kds.declineDescription")}
        reasons={DECLINE_REASONS.map((key) => t(key))}
        confirmLabel={t("kds.declineOrder")}
        keepLabel={t("common.back")}
        onSubmit={(reason) => decline.mutateAsync({ orderId: order.id, reason })}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="flex flex-wrap items-center gap-2">
            <bdi className="text-xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums text-foreground xl:text-2xl">
              #{order.orderNumber}
            </bdi>
            {order.channel === "ONLINE" && (
              <span
                className="inline-flex h-6 items-center rounded-md bg-status-gold-soft px-1.5 text-status-gold"
                title={t("kds.onlineOrder")}
              >
                <Globe className="size-3.5" aria-label={t("kds.onlineOrder")} />
              </span>
            )}
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex h-6 items-center rounded-md bg-accent px-2 font-semibold text-accent-foreground">
              {order.table ? t("kds.tableN", { n: order.table.number }) : t(`common.orderType.${order.type}`)}
            </span>
            {who && <span className="truncate">{who}</span>}
          </p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-status-gold-soft px-2.5 text-sm font-semibold tabular-nums text-status-gold">
          <Clock className="size-3.5" aria-hidden />
          {t("kds.minutesShort", { n: minutesSince(order.createdAt) })}
        </span>
      </div>
      {order.notes && (
        <p className="flex items-start gap-1.5 rounded-xl bg-status-warning-soft px-2.5 py-2 text-sm font-medium text-status-warning">
          <Flame className="mt-0.5 size-4 shrink-0" aria-hidden /> {order.notes}
        </p>
      )}
      <ul className="flex max-h-36 flex-col gap-2 overflow-y-auto border-t border-dashed border-border pt-3 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 px-1 text-sm font-bold tabular-nums text-foreground ring-1 ring-border/70">
              {item.quantity}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <span className="font-semibold text-foreground">{item.nameSnapshot}</span>
              {item.modifiers.length > 0 && (
                <span className="text-xs text-status-info">
                  {item.modifiers.map((m) => `+ ${m.nameSnapshot}`).join("  ")}
                </span>
              )}
              {item.kitchenNote && <span className="text-xs font-medium text-status-warning">{item.kitchenNote}</span>}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-2">
        <Button
          className="h-12 flex-1 text-base font-semibold"
          disabled={accept.isPending}
          onClick={() =>
            accept.mutate(order.id, {
              onError: (err) => toast.error(err instanceof ApiError ? err.message : t("kds.acceptFailed")),
            })
          }
        >
          <Check className="size-5" aria-hidden />
          {accept.isPending ? t("kds.accepting") : t("kds.accept")}
        </Button>
        <Button variant="destructive" className="h-12 px-4" onClick={() => setDeclineOpen(true)}>
          <X className="size-5" aria-hidden />
          {t("kds.decline")}
        </Button>
      </div>
    </Card>
  );
}
