"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { WasteReason } from "@ahemads-restro/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIngredients, useLogWaste } from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

// Labels: inventory.wasteReason.<REASON>, translated at render time.
const REASONS: WasteReason[] = ["EXPIRED", "SPOILED", "DAMAGED", "PREP_ERROR", "OVER_PRODUCTION", "OTHER"];

export function LogWasteDialog({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<WasteReason>("SPOILED");
  const [notes, setNotes] = useState("");
  const { data: ingredients } = useIngredients(branchId);
  const logWaste = useLogWaste(branchId);

  const selected = ingredients?.find((i) => i.id === ingredientId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId || !Number(quantity)) return;
    logWaste.mutate(
      { ingredientId, quantity: Number(quantity), reason, notes: notes || undefined },
      {
        onSuccess: () => {
          toast.success(t("inventory.waste.logged"));
          setOpen(false);
          setIngredientId("");
          setQuantity("");
          setNotes("");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("inventory.waste.logFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus className="size-4" />{t("inventory.waste.log")}</Button>} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("inventory.waste.log")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>{t("inventory.ingredient")}</Label>
            <Select value={ingredientId} onValueChange={(v) => setIngredientId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={t("inventory.selectIngredient")} />
              </SelectTrigger>
              <SelectContent>
                {ingredients?.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {t("inventory.ingredientWithStock", {
                      name: i.name,
                      qty: formatNumber(i.currentStock, { maximumFractionDigits: 3 }),
                      unit: t(`inventory.unit.${i.unit}`),
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="w-qty">
              {t("common.quantity")}
              {selected ? <bdi>{` (${t(`inventory.unit.${selected.unit}`)})`}</bdi> : ""}
            </Label>
            <Input
              id="w-qty"
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              dir="ltr"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("inventory.reason")}</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as WasteReason)}>
              <SelectTrigger>
                <SelectValue>{(v: WasteReason) => t(`inventory.wasteReason.${v}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`inventory.wasteReason.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="w-notes">{t("inventory.notesOptional")}</Label>
            <Input id="w-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={logWaste.isPending}>
              {logWaste.isPending ? t("inventory.waste.logging") : t("inventory.waste.log")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
