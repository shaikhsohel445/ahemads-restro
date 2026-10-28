"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useCancelOrder } from "@/hooks/use-orders";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Quick-pick reasons: orders.cancel.reason.<key>, translated at render time.
const REASONS = ["guestLeft", "wrongOrder", "duplicate", "outOfStock"];

// Replaces the browser confirm(): that dialog is silently suppressed on
// kiosk/PWA tablets, which made "Cancel order" look like it did nothing.
export function CancelOrderDialog({
  branchId,
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onCancelled,
}: {
  branchId: string | null;
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [byGuest, setByGuest] = useState(false);
  // Set once the server says cooking has begun; the next press then confirms.
  const [startedWarning, setStartedWarning] = useState<string | null>(null);
  const cancel = useCancelOrder(branchId);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    cancel.mutate(
      {
        orderId,
        reason: reason.trim(),
        source: byGuest ? "CUSTOMER" : "STAFF",
        confirmStarted: startedWarning ? true : undefined,
      },
      {
        onSuccess: () => {
          setReason("");
          setByGuest(false);
          setStartedWarning(null);
          onOpenChange(false);
          onCancelled?.();
        },
        onError: (err) => {
          if (err instanceof ApiError && err.code === "KITCHEN_STARTED") {
            setStartedWarning(err.message);
            return;
          }
          setError(err instanceof ApiError ? err.message : t("orders.cancel.failed"));
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError(null);
          setStartedWarning(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {t("orders.cancel.title")} <bdi>#{orderNumber}</bdi>
            </DialogTitle>
            <DialogDescription>
              {t("orders.cancel.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancel-reason">{t("orders.reason")}</Label>
            <Input
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              required
              autoFocus
              placeholder={t("orders.cancel.reasonPlaceholder")}
            />
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map((r) => {
                const text = t(`orders.cancel.reason.${r}`);
                return (
                  <Button key={r} type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setReason(text)}>
                    {text}
                  </Button>
                );
              })}
            </div>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={byGuest}
              onChange={(e) => setByGuest(e.target.checked)}
            />
            {t("orders.cancel.byGuest")}
          </label>
          {startedWarning && (
            <p role="alert" className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
              {startedWarning}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              {t("orders.cancel.keep")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-11"
              disabled={cancel.isPending || reason.trim().length === 0}
            >
              {cancel.isPending ? t("orders.cancel.cancelling") : startedWarning ? t("orders.cancel.anyway") : t("orders.cancel.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Whether the signed-in user may cancel orders (cashiers and waiters may not). */
export function useCanCancelOrders() {
  const { data: me } = useCurrentUser();
  return hasPermission(me?.user, "orders.cancel");
}
