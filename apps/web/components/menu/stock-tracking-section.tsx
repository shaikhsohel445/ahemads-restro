"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useIngredients,
  useRecipe,
  useSetRecipe,
  useSetTracking,
  useTracking,
  type InventoryTracking,
} from "@/hooks/use-inventory";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Labels/hints are message keys (inventory.tracking.<MODE>[.hint]), translated at render time.
const MODES: InventoryTracking[] = ["NONE", "RECIPE", "DIRECT"];

interface Line {
  ingredientId: string;
  quantity: string;
}

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground";

// Lives under the item form; saves on its own because stock mapping is an
// inventory concern (needs inventory.manage) separate from the menu fields.
// The form mounts only once the saved mapping has loaded, so its initial state
// comes straight from props instead of being synced in an effect.
export function StockTrackingSection({ branchId, itemId, isCombo }: { branchId: string | null; itemId: string; isCombo: boolean }) {
  const { t } = useI18n();
  const { data: tracking } = useTracking(branchId, itemId);
  const { data: recipe } = useRecipe(branchId, itemId);
  if (isCombo) {
    return (
      <p className="rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground">
        {t("inventory.tracking.comboHint")}
      </p>
    );
  }
  if (!tracking || !recipe) return null;
  return (
    <TrackingForm
      key={itemId}
      branchId={branchId}
      itemId={itemId}
      initialMode={tracking.inventoryTracking}
      initialDirectId={tracking.stockIngredientId ?? ""}
      initialDirectQty={String(tracking.stockQuantityPerSale)}
      initialLines={recipe.lines.map((l) => ({ ingredientId: l.ingredientId, quantity: String(l.quantity) }))}
    />
  );
}

function TrackingForm({
  branchId,
  itemId,
  initialMode,
  initialDirectId,
  initialDirectQty,
  initialLines,
}: {
  branchId: string | null;
  itemId: string;
  initialMode: InventoryTracking;
  initialDirectId: string;
  initialDirectQty: string;
  initialLines: Line[];
}) {
  const { t } = useI18n();
  const { data: ingredients } = useIngredients(branchId);
  const setTracking = useSetTracking(branchId, itemId);
  const setRecipe = useSetRecipe(branchId, itemId);

  const [mode, setMode] = useState<InventoryTracking>(initialMode);
  const [directId, setDirectId] = useState(initialDirectId);
  const [directQty, setDirectQty] = useState(initialDirectQty);
  const [lines, setLines] = useState<Line[]>(initialLines);

  const unit = (id: string) => {
    const u = ingredients?.find((i) => i.id === id)?.unit;
    return u ? t(`inventory.unit.${u}`) : "";
  };
  const incomplete =
    (mode === "DIRECT" && !directId) || (mode === "RECIPE" && lines.filter((l) => l.ingredientId).length === 0);

  const save = async () => {
    try {
      if (mode === "RECIPE") {
        const clean = lines
          .filter((l) => l.ingredientId && Number(l.quantity) > 0)
          .map((l) => ({ ingredientId: l.ingredientId, quantity: Number(l.quantity) }));
        await setRecipe.mutateAsync(clean);
        await setTracking.mutateAsync({ inventoryTracking: "RECIPE" });
      } else if (mode === "DIRECT") {
        await setTracking.mutateAsync({
          inventoryTracking: "DIRECT",
          stockIngredientId: directId,
          stockQuantityPerSale: Number(directQty) || 1,
        });
      } else {
        await setTracking.mutateAsync({ inventoryTracking: "NONE" });
      }
      toast.success(t("inventory.tracking.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("inventory.tracking.saveFailed"));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border p-3" aria-label={t("inventory.tracking.title")}>
      <div>
        <h3 className="text-sm font-medium text-foreground">{t("inventory.tracking.heading")}</h3>
        <p className="text-xs text-muted-foreground">{t(`inventory.tracking.${mode}.hint`)}</p>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("inventory.tracking.mode")}>
        {MODES.map((m) => (
          <Button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(m)}
          >
            {t(`inventory.tracking.${m}`)}
          </Button>
        ))}
      </div>

      {mode === "DIRECT" && (
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="direct-ingredient">{t("inventory.tracking.DIRECT")}</Label>
            <select id="direct-ingredient" className={selectClass} value={directId} onChange={(e) => setDirectId(e.target.value)}>
              <option value="">{t("common.selectPlaceholder")}</option>
              {ingredients?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="direct-qty">
              {t("inventory.tracking.perSale")} {unit(directId) && <bdi>({unit(directId)})</bdi>}
            </Label>
            <Input id="direct-qty" type="number" min="0.001" step="0.001" value={directQty} onChange={(e) => setDirectQty(e.target.value)} dir="ltr" />
          </div>
        </div>
      )}

      {mode === "RECIPE" && (
        <div className="flex flex-col gap-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_88px_40px] items-end gap-2">
              <select
                aria-label={t("inventory.ingredient")}
                className={selectClass}
                value={line.ingredientId}
                onChange={(e) => setLines(lines.map((l, i) => (i === idx ? { ...l, ingredientId: e.target.value } : l)))}
              >
                <option value="">{t("inventory.ingredientPlaceholder")}</option>
                {ingredients?.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <Input
                aria-label={`${t("common.quantity")} ${unit(line.ingredientId)}`}
                dir="ltr"
                type="number"
                min="0.001"
                step="0.001"
                value={line.quantity}
                onChange={(e) => setLines(lines.map((l, i) => (i === idx ? { ...l, quantity: e.target.value } : l)))}
              />
              <Button type="button" variant="ghost" size="icon" aria-label={t("inventory.tracking.removeIngredient")} onClick={() => setLines(lines.filter((_, i) => i !== idx))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setLines([...lines, { ingredientId: "", quantity: "1" }])}>
            <Plus className="h-4 w-4" /> {t("inventory.tracking.addIngredient")}
          </Button>
        </div>
      )}

      {incomplete && <p className="text-xs text-warning">{t("inventory.tracking.incomplete")}</p>}
      <Button type="button" size="sm" className="self-end" disabled={setTracking.isPending || setRecipe.isPending} onClick={save}>
        {t("inventory.tracking.save")}
      </Button>
    </section>
  );
}
