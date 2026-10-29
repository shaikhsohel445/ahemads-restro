"use client";

import { CalendarClock, Loader2, MapPin, Minus, Plus, ReceiptText, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { CartLine } from "@/components/pos/cart-line";
import type { RestaurantTable } from "@/hooks/use-tables";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { round2, subtotalOf } from "@/lib/pricing-preview";

export type PosOrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export interface DeliveryDetails {
  address: string;
  pincode: string;
  phone: string;
}

export function CartPanel({
  lines,
  orderType,
  tables,
  tableId,
  onTableChange,
  onIncrement,
  onDecrement,
  onRemove,
  onSubmit,
  isSubmitting,
  existingOrderNumber,
  onViewExistingOrder,
  openBills,
  selectedBillId,
  onSelectBill,
  checkingTable = false,
  delivery,
  onDeliveryChange,
  scheduledFor,
  onScheduledForChange,
}: {
  lines: CartLine[];
  orderType: PosOrderType;
  /**
   * Kept for compatibility: the order type is now picked in the POS workspace
   * toolbar, so the panel no longer renders its own switch.
   */
  onOrderTypeChange?: (type: PosOrderType) => void;
  tables: RestaurantTable[];
  tableId: string;
  onTableChange: (id: string) => void;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  existingOrderNumber?: string;
  onViewExistingOrder?: () => void;
  /** All unpaid bills on the selected table (more than one is possible). */
  openBills?: { id: string; orderNumber: string }[];
  selectedBillId?: string | null;
  onSelectBill?: (id: string) => void;
  /** The table's open bills are still loading - sending now could start a duplicate bill. */
  checkingTable?: boolean;
  delivery: DeliveryDetails;
  onDeliveryChange: (d: DeliveryDetails) => void;
  scheduledFor: string;
  onScheduledForChange: (v: string) => void;
}) {
  const { t } = useI18n();
  const tableLabel = (table: RestaurantTable) => table.name ?? t("pos.cart.tableN", { n: table.number });
  const subtotal = subtotalOf(lines.map((l) => l.unitPrice * l.quantity));
  // Preview only: prices are VAT-inclusive, so VAT is backed out per line
  // (mirrors the server's pricing); the server's bill stays authoritative.
  const vat = round2(
    lines.reduce((sum, l) => {
      const rate = (l.taxRatePercent ?? 0) / 100;
      const total = l.unitPrice * l.quantity;
      return sum + (rate > 0 ? round2(total - total / (1 + rate)) : 0);
    }, 0),
  );
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const deliveryReady =
    orderType !== "DELIVERY" ||
    (delivery.address.trim().length >= 5 && delivery.pincode.trim().length >= 3 && delivery.phone.trim().length >= 6);
  const canSubmit =
    lines.length > 0 && (orderType !== "DINE_IN" || !!tableId) && deliveryReady && !isSubmitting && !checkingTable;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <ReceiptText className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
              {t("pos.page.currentOrder")}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {t(`common.orderType.${orderType}`)}
              {itemCount > 0 && <> · {t("pos.menu.itemsCount", { n: itemCount })}</>}
            </p>
          </div>
        </div>
      </div>

      {orderType === "DINE_IN" && (
        <Select value={tableId} onValueChange={(v) => onTableChange(v ?? "")}>
          <SelectTrigger className="h-11 w-full rounded-xl" aria-label={t("pos.cart.selectTable")}>
            <SelectValue placeholder={t("pos.cart.selectTable")}>
              {(value: string | null) => {
                const tb = tables.find((table) => table.id === value);
                if (!tb) return t("pos.cart.selectTable");
                return tb.status === "OCCUPIED"
                  ? t("pos.cart.tableOccupied", { table: tableLabel(tb) })
                  : tableLabel(tb);
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tables.map((tb) => (
              <SelectItem key={tb.id} value={tb.id}>
                {tb.status === "OCCUPIED" ? t("pos.cart.tableOccupied", { table: tableLabel(tb) }) : tableLabel(tb)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {orderType === "DELIVERY" && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-2.5 ring-1 ring-border/60">
          <div className="relative">
            <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("pos.cart.deliveryAddress")}
              value={delivery.address}
              onChange={(e) => onDeliveryChange({ ...delivery, address: e.target.value })}
              className="h-11 bg-card ps-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={t("pos.cart.postalCode")}
              inputMode="numeric"
              dir="ltr"
              value={delivery.pincode}
              onChange={(e) => onDeliveryChange({ ...delivery, pincode: e.target.value })}
              className="h-11 bg-card"
            />
            <Input
              placeholder={t("common.phone")}
              inputMode="tel"
              dir="ltr"
              value={delivery.phone}
              onChange={(e) => onDeliveryChange({ ...delivery, phone: e.target.value })}
              className="h-11 bg-card"
            />
          </div>
        </div>
      )}

      {orderType !== "DINE_IN" && (
        <label className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border/60">
          <CalendarClock className="size-4 shrink-0" />
          <span className="shrink-0">{t("pos.cart.scheduleLater")}</span>
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => onScheduledForChange(e.target.value)}
            className="h-9 min-w-0 flex-1 bg-card text-xs"
          />
        </label>
      )}

      {checkingTable && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {t("pos.cart.checkingTable")}
        </p>
      )}
      {openBills && openBills.length > 1 && (
        <div
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          role="group"
          aria-label={t("pos.cart.openBillsLabel")}
        >
          <span>{t("pos.cart.openBillsAddTo", { n: openBills.length })}</span>
          {openBills.map((b) => (
            <Button
              key={b.id}
              type="button"
              size="sm"
              variant={b.id === selectedBillId ? "default" : "outline"}
              className="h-9 px-3 text-xs"
              aria-pressed={b.id === selectedBillId}
              onClick={() => onSelectBill?.(b.id)}
            >
              <bdi>#{b.orderNumber}</bdi>
            </Button>
          ))}
        </div>
      )}
      {existingOrderNumber && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-status-info-soft px-3 py-2 text-xs text-status-info">
          <span>
            {t("pos.cart.tableHasOrder")} <bdi className="font-semibold">#{existingOrderNumber}</bdi>
            {lines.length > 0 && ` ${t("pos.cart.addedAsRound")}`}
          </span>
          {onViewExistingOrder && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 px-3 text-xs"
              onClick={onViewExistingOrder}
            >
              {t("pos.cart.viewAndPay")}
            </Button>
          )}
        </div>
      )}

      {/* Line items */}
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:thin]">
        {lines.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted-foreground">
              <ShoppingCart className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("pos.cart.empty")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("pos.cart.emptyHint")}</p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border/70">
            {lines.map((line) => (
              <li key={line.key} className="flex flex-col gap-2 py-3 first:pt-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-5 font-medium text-foreground">{line.name}</p>
                    {line.modifierLabel && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{line.modifierLabel}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(line.unitPrice * line.quantity)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("pos.cart.each", { price: formatCurrency(line.unitPrice) })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 text-muted-foreground hover:bg-status-danger-soft hover:text-status-danger"
                      aria-label={t("common.remove")}
                      onClick={() => onRemove(line.key)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <div className="flex items-center rounded-xl bg-surface-2 p-0.5 ring-1 ring-border/70">
                      <button
                        type="button"
                        className="flex size-10 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-card active:scale-95"
                        aria-label={t("pos.cart.decrease")}
                        onClick={() => onDecrement(line.key)}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex size-10 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-card active:scale-95"
                        aria-label={t("pos.cart.increase")}
                        onClick={() => onIncrement(line.key)}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals + primary action */}
      <div className="-mx-4 -mb-4 flex flex-col gap-3 border-t border-border/80 bg-surface-2/60 px-4 pt-3.5 pb-4 xl:-mx-5 xl:-mb-5 xl:px-5 xl:pb-5">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("pos.cart.subtotalInclTax")}</dt>
            <dd className="text-foreground tabular-nums">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <dt className="text-muted-foreground">{t("pos.checkout.taxIncluded")}</dt>
            <dd className="text-muted-foreground tabular-nums">{formatCurrency(vat)}</dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-dashed border-border pt-2">
            <dt className="text-sm font-semibold text-foreground">{t("pos.cart.total")}</dt>
            <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {formatCurrency(subtotal)}
            </dd>
          </div>
        </dl>
        <Button size="lg" className="h-14 w-full rounded-2xl text-base font-semibold" disabled={!canSubmit} onClick={onSubmit}>
          {isSubmitting && <Loader2 className="size-5 animate-spin" />}
          {isSubmitting
            ? t("pos.cart.sending")
            : existingOrderNumber
              ? t("pos.cart.addAndSend")
              : t("pos.cart.send")}
        </Button>
      </div>
    </div>
  );
}
