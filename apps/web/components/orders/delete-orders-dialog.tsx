"use client";

import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useDeleteOrders } from "@/hooks/use-orders";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Admin-only, password-gated permanent delete of finished transactions.
export function DeleteOrdersDialog({
  branchId,
  orderIds,
  open,
  onOpenChange,
  onDeleted,
}: {
  branchId: string | null;
  orderIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const del = useDeleteOrders(branchId);
  const count = orderIds.length;

  const close = (next: boolean) => {
    if (!next) {
      setPassword("");
      setError(null);
    }
    onOpenChange(next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    del.mutate(
      { orderIds, password },
      {
        onSuccess: (res) => {
          toast.success(t(res.deleted === 1 ? "orders.delete.doneOne" : "orders.delete.doneMany", { n: res.deleted }));
          close(false);
          onDeleted();
        },
        onError: (err) => {
          setPassword("");
          setError(err instanceof ApiError ? err.message : t("orders.delete.failed"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden />
              {t(count === 1 ? "orders.delete.titleOne" : "orders.delete.titleMany", { n: count })}
            </DialogTitle>
            <DialogDescription>
              {t("orders.delete.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-orders-password">{t("orders.delete.password")}</Label>
            <PasswordInput
              id="delete-orders-password"
              
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "delete-orders-error" : undefined}
              required
              autoFocus
            />
            <p
              id="delete-orders-error"
              role="alert"
              className="min-h-5 text-sm text-destructive"
            >
              {error ?? ""}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              {t("orders.delete.keep")}
            </Button>
            <Button type="submit" variant="destructive" disabled={del.isPending || !password}>
              {del.isPending ? t("common.deleting") : t("orders.delete.confirm", { n: count })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
