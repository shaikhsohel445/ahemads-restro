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
import { Label } from "@/components/ui/label";
import { useAdjustStock, type Ingredient } from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export function AdjustStockDialog({
  branchId,
  ingredient,
}: {
  branchId: string | null;
  ingredient: Ingredient;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const adjustStock = useAdjustStock(branchId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || !note.trim()) return;
    adjustStock.mutate(
      { id: ingredient.id, dto: { quantity: qty, note } },
      {
        onSuccess: () => {
          toast.success(
            t("inventory.adjust.success", {
              qty: `${qty > 0 ? "+" : ""}${formatNumber(qty, { maximumFractionDigits: 3 })}`,
              unit: t(`inventory.unit.${ingredient.unit}`),
            }),
          );
          setOpen(false);
          setQuantity("");
          setNote("");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("inventory.adjust.failed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">{t("inventory.adjust.button")}</Button>} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("inventory.adjust.title", { name: ingredient.name })}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("inventory.adjust.current")}{" "}
            <bdi>
              {formatNumber(ingredient.currentStock, { maximumFractionDigits: 3 })}{" "}
              {t(`inventory.unit.${ingredient.unit}`)}
            </bdi>
            . {t("inventory.adjust.help")}
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adj-qty">{t("inventory.adjust.quantityChange")}</Label>
            <Input
              id="adj-qty"
              type="number"
              step="0.001"
              placeholder={t("inventory.adjust.quantityPlaceholder")}
              dir="ltr"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adj-note">{t("inventory.reason")}</Label>
            <Input
              id="adj-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("inventory.adjust.reasonPlaceholder")}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? t("common.saving") : t("inventory.adjust.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
