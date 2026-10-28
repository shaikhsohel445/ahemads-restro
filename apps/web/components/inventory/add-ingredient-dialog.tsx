"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { IngredientUnit } from "@nodedr-restaurant/types";
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
import { useCreateIngredient } from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

const UNITS: IngredientUnit[] = ["KG", "G", "L", "ML", "PIECE", "DOZEN", "PACK", "BOX"];

export function AddIngredientDialog({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<IngredientUnit>("KG");
  const [reorderLevel, setReorderLevel] = useState("0");
  const createIngredient = useCreateIngredient(branchId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createIngredient.mutate(
      { name, unit, reorderLevel: Number(reorderLevel) || 0, isActive: true },
      {
        onSuccess: () => {
          toast.success(t("inventory.addedNamed", { name }));
          setOpen(false);
          setName("");
          setUnit("KG");
          setReorderLevel("0");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("inventory.ingredients.addFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">{t("inventory.ingredients.new")}</Button>} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("inventory.ingredients.new")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="i-name">{t("common.name")}</Label>
            <Input id="i-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("inventory.unitLabel")}</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as IngredientUnit)}>
              <SelectTrigger>
                <SelectValue>{(v: IngredientUnit) => t(`inventory.unit.${v}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {t(`inventory.unit.${u}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="i-reorder">{t("inventory.reorderLevel")}</Label>
            <Input
              id="i-reorder"
              type="number"
              min="0"
              step="0.001"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              {t("inventory.reorderLevelHelp")}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createIngredient.isPending}>
              {createIngredient.isPending ? t("inventory.adding") : t("inventory.ingredients.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
