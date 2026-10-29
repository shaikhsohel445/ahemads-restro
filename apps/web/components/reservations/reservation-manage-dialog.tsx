"use client";

import { Check, MessageCircle, Phone, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChannelBadge } from "@/components/orders/channel-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useUpdateReservationStatus, type Reservation } from "@/hooks/use-reservations";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const RESERVATION_TONE: Record<string, Tone> = {
  RESERVED: "info",
  CONFIRMED: "success",
  ARRIVED: "gold",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

const when = (iso: string) =>
  formatDateTime(iso, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Manage window for a table booking: see who/when, call or WhatsApp the
// guest, and accept / reject / cancel it.
export function ReservationManageDialog({
  branchId,
  reservation,
  open,
  onOpenChange,
}: {
  branchId: string | null;
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const update = useUpdateReservationStatus(branchId);
  const r = reservation;
  const phone = r?.phone ?? null;
  const waHref =
    r && phone
      ? `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
          t("reservations.waMessage", { name: r.customerName, n: r.guestCount, when: when(r.reservedAt) }),
        )}`
      : null;
  const pending = r?.status === "RESERVED";
  const cancellable = r && (r.status === "RESERVED" || r.status === "CONFIRMED");

  const setStatus = (status: "CONFIRMED" | "CANCELLED", done: string) => {
    if (!r) return;
    update.mutate(
      { id: r.id, status },
      {
        onSuccess: () => {
          toast.success(done);
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : t("common.error")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("reservations.manageTitle")}
            {r && <ChannelBadge channel={r.channel} />}
          </DialogTitle>
        </DialogHeader>
        {r && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusPill tone={RESERVATION_TONE[r.status] ?? "neutral"} pulse={pending}>
                {pending ? t("reservations.awaiting") : t(`common.reservationStatus.${r.status}`)}
              </StatusPill>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {t("reservations.guestsCount", { n: r.guestCount })}
              </span>
              {r.table && <span>· {r.table.name ?? t("reservations.tableN", { n: r.table.number })}</span>}
            </div>
            <div className="rounded-xl bg-surface-2 px-3.5 py-3">
              <div className="font-semibold text-foreground tabular-nums">{when(r.reservedAt)}</div>
              {r.specialRequests && (
                <p className="mt-1 text-xs text-muted-foreground">{t("reservations.requestNote", { text: r.specialRequests })}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("common.customer")}
              </div>
              <span className="font-medium text-foreground">{r.customerName}</span>
              {phone ? (
                <>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> <bdi dir="ltr">{phone}</bdi>
                  </span>
                  <div className="flex gap-2">
                    <a href={`tel:${phone}`} className={cn(buttonVariants(), "h-10 flex-1")}>
                      <Phone className="me-1.5 h-4 w-4" /> {t("reservations.call")}
                    </a>
                    <a
                      href={waHref ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }), "h-10 flex-1")}
                    >
                      <MessageCircle className="me-1.5 h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{t("reservations.noPhone")}</p>
              )}
            </div>

            {pending && (
              <div className="flex gap-2">
                <Button
                  className="h-11 flex-1"
                  disabled={update.isPending}
                  onClick={() => setStatus("CONFIRMED", t("reservations.accepted"))}
                >
                  <Check className="me-1.5 h-4 w-4" /> {t("reservations.acceptBooking")}
                </Button>
                <Button
                  variant="destructive"
                  className="h-11 flex-1"
                  disabled={update.isPending}
                  onClick={() => setStatus("CANCELLED", t("reservations.rejected"))}
                >
                  <X className="me-1.5 h-4 w-4" /> {t("reservations.rejectShort")}
                </Button>
              </div>
            )}
            {cancellable && !pending && (
              <Button
                variant="destructive"
                className="h-11"
                disabled={update.isPending}
                onClick={() => setStatus("CANCELLED", t("reservations.cancelled"))}
              >
                <X className="me-1.5 h-4 w-4" /> {t("reservations.cancelBooking")}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
