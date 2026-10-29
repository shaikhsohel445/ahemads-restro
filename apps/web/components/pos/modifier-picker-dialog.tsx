"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Portion, PortionKind } from "@/components/pos/cart-line";

// Structural subset of an item, so both the staff POS menu and the public
// QR menu can use this picker.
export interface PickerItem {
  id: string;
  name: string;
  // Items with a halfPrice get a Half / Full (/ Custom) section; price is the full portion.
  price?: string;
  halfPrice?: string | null;
  modifierGroups: {
    modifierGroup: {
      id: string;
      name: string;
      minSelect: number;
      maxSelect: number;
      isRequired?: boolean;
      modifiers: { id: string; name: string; priceAdjustment: string; isDefault: boolean }[];
    };
  }[];
}

function defaultSelection(item: PickerItem): Record<string, Set<string>> {
  const defaults: Record<string, Set<string>> = {};
  for (const { modifierGroup } of item.modifierGroups) {
    const defaultIds = modifierGroup.modifiers.filter((m) => m.isDefault).map((m) => m.id);
    if (defaultIds.length > 0) defaults[modifierGroup.id] = new Set(defaultIds);
  }
  return defaults;
}

// Keyed by item.id from the parent so switching items mounts a fresh
// instance — that lets `selected`'s initial state be derived straight from
// `item` via useState's lazy initializer (a pure, one-time computation from
// props) instead of a useEffect + setState, which React's compiler-era
// lint rules flag as an avoidable derived-state effect.
function ModifierPickerBody({
  item,
  allowCustom,
  onConfirm,
}: {
  item: PickerItem;
  allowCustom: boolean;
  onConfirm: (modifierIds: string[], modifierLabel: string, portion?: Portion) => void;
}) {
  const { t } = useI18n();
  const hasPortions = item.halfPrice != null;
  const portionName = (kind: PortionKind) => t(`pos.portion.${kind}`);
  const [portionKind, setPortionKind] = useState<PortionKind>("FULL");
  const [customLabel, setCustomLabel] = useState("");
  // Editable price per portion, pre-filled from the menu; staff can overwrite any of them.
  const [prices, setPrices] = useState<Record<PortionKind, string>>({
    HALF: item.halfPrice ?? "",
    FULL: item.price ?? "",
    CUSTOM: "",
  });
  const customPrice = prices[portionKind];
  const [selected, setSelected] = useState<Record<string, Set<string>>>(() => defaultSelection(item));

  const groups = item.modifierGroups.map((g) => g.modifierGroup);

  const toggle = (groupId: string, modifierId: string, maxSelect: number) => {
    setSelected((prev) => {
      const current = new Set(prev[groupId] ?? []);
      if (current.has(modifierId)) {
        current.delete(modifierId);
      } else {
        if (maxSelect === 1) current.clear();
        else if (current.size >= maxSelect) return prev;
        current.add(modifierId);
      }
      return { ...prev, [groupId]: current };
    });
  };

  const handleConfirm = () => {
    let portion: Portion | undefined;
    if (hasPortions) {
      const price = Number(customPrice);
      if (customPrice.trim() === "" || !Number.isFinite(price) || price < 0) {
        toast.error(t("pos.modifiers.enterPortionPrice", { portion: portionName(portionKind) }));
        return;
      }
      portion =
        portionKind === "CUSTOM"
          ? { kind: "CUSTOM", customLabel: customLabel.trim() || undefined, customPrice: price }
          : { kind: portionKind, customPrice: price };
    }
    for (const group of groups) {
      const count = selected[group.id]?.size ?? 0;
      const min = Math.max(group.minSelect, group.isRequired ? 1 : 0);
      if (count < min) {
        toast.error(t("pos.modifiers.chooseAtLeast", { n: min, group: group.name }));
        return;
      }
    }
    const allSelected = groups.flatMap((g) => [...(selected[g.id] ?? [])]);
    const label = groups
      .flatMap((g) => [...(selected[g.id] ?? [])].map((id) => g.modifiers.find((m) => m.id === id)?.name))
      .filter(Boolean)
      .join(", ");
    onConfirm(allSelected, label, portion);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg">{item.name}</DialogTitle>
      </DialogHeader>

      <div className="-mx-1 flex max-h-[min(60dvh,32rem)] flex-col gap-5 overflow-y-auto px-1 py-2">
        {hasPortions && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">{t("pos.modifiers.portion")}</h3>
            <div className={cn("grid gap-2", allowCustom ? "grid-cols-3" : "grid-cols-2")}>
              {(
                [
                  { kind: "HALF", label: portionName("HALF"), price: item.halfPrice },
                  { kind: "FULL", label: portionName("FULL"), price: item.price },
                  ...(allowCustom ? [{ kind: "CUSTOM", label: portionName("CUSTOM"), price: null }] : []),
                ] as { kind: PortionKind; label: string; price?: string | null }[]
              ).map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  aria-pressed={portionKind === opt.kind}
                  onClick={() => setPortionKind(opt.kind)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    portionKind === opt.kind
                      ? "border-primary bg-accent text-accent-foreground ring-1 ring-primary/30"
                      : "border-border/80 hover:bg-muted",
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.kind !== "CUSTOM" && prices[opt.kind] !== "" && (
                    <span className="text-xs font-normal tabular-nums text-muted-foreground">
                      {formatCurrency(prices[opt.kind])}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className={cn("grid gap-2", portionKind === "CUSTOM" ? "grid-cols-[1fr_7rem]" : "grid-cols-1")}>
              {portionKind === "CUSTOM" && (
                <Input
                  placeholder={t("pos.modifiers.customLabelPlaceholder")}
                  maxLength={40}
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  aria-label={t("pos.modifiers.customLabel")}
                />
              )}
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                dir="ltr"
                placeholder={t("common.price")}
                value={customPrice}
                onChange={(e) => setPrices((p) => ({ ...p, [portionKind]: e.target.value }))}
                aria-label={t("pos.modifiers.portionPrice", { portion: portionName(portionKind) })}
              />
            </div>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {group.name}
                {(group.isRequired || group.minSelect > 0) && (
                  <span className="rounded-full bg-status-gold-soft px-2 text-[11px] leading-5 font-medium text-status-gold">
                    {t("pos.modifiers.required")}
                  </span>
                )}
              </h3>
              <span className="text-xs text-muted-foreground">
                {group.maxSelect === 1 ? t("pos.modifiers.chooseOne") : t("pos.modifiers.chooseUpTo", { n: group.maxSelect })}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {group.modifiers.map((mod) => {
                const isSelected = selected[group.id]?.has(mod.id) ?? false;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(group.id, mod.id, group.maxSelect)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-start text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border/80 hover:bg-muted",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center border-[1.5px] transition-colors",
                        group.maxSelect === 1 ? "rounded-full" : "rounded-md",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                      )}
                    >
                      {isSelected && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">{mod.name}</span>
                    {Number(mod.priceAdjustment) > 0 && (
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        +{formatCurrency(mod.priceAdjustment)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button size="lg" className="w-full sm:w-auto" onClick={handleConfirm}>
          {t("pos.modifiers.addToCart")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ModifierPickerDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
  allowCustom = false,
}: {
  item: PickerItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (modifierIds: string[], modifierLabel: string, portion?: Portion) => void;
  allowCustom?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {item && (
          <ModifierPickerBody
            key={item.id}
            item={item}
            allowCustom={allowCustom}
            onConfirm={(modifierIds, label, portion) => {
              onConfirm(modifierIds, label, portion);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
