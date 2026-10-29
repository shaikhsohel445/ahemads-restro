import { translate } from "@/lib/i18n/context";

export interface CartLine {
  key: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifierIds: string[];
  modifierLabel?: string;
  portion?: Portion;
  /** The item's VAT rate, used only for the cart's VAT-included preview. */
  taxRatePercent?: number;
}

export type PortionKind = "HALF" | "FULL" | "CUSTOM";

export interface Portion {
  kind: PortionKind;
  // Only for CUSTOM: staff-typed label and unit price.
  customLabel?: string;
  customPrice?: number;
}

export function portionText(p?: Portion): string {
  if (!p) return "";
  if (p.kind === "HALF") return translate("pos.portion.HALF");
  if (p.kind === "FULL") return translate("pos.portion.FULL");
  return p.customLabel || translate("pos.portion.CUSTOM");
}

export function cartLineKey(menuItemId: string, modifierIds: string[], portion?: Portion): string {
  const p = portion ? `${portion.kind}:${portion.customLabel ?? ""}:${portion.customPrice ?? ""}` : "";
  return `${menuItemId}::${[...modifierIds].sort().join(",")}::${p}`;
}
