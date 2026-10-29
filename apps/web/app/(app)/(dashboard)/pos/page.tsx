"use client";

import {
  Armchair,
  Bike,
  ChevronLeft,
  ChevronRight,
  MonitorSmartphone,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StatusNote, useNoteToast } from "@/components/ui/status-note";
import { publishDisplay } from "@/lib/customer-display";
import { BranchNotice } from "@/components/layout/branch-notice";
import { CartPanel, type DeliveryDetails, type PosOrderType } from "@/components/pos/cart-panel";
import { cartLineKey, portionText, type CartLine, type Portion } from "@/components/pos/cart-line";
import { clearDraft, switchTableDraft, type Drafts } from "@/lib/pos-drafts";
import { CheckoutPanel } from "@/components/pos/checkout-panel";
import { KitchenProgressWidget } from "@/components/pos/kitchen-progress-widget";
import { ModifierPickerDialog } from "@/components/pos/modifier-picker-dialog";
import { PosTablePicker } from "@/components/pos/pos-table-picker";
import { ProductGrid } from "@/components/pos/product-grid";
import { Segmented, type SegmentOption } from "@/components/ui/segmented";
import { StatusPill, TABLE_STATUS_TONE } from "@/components/ui/status-pill";
import { useBranch } from "@/hooks/use-branch";
import type { MenuItem } from "@/hooks/use-menu";
import {
  useAddOrderItems,
  useCreateOrder,
  useOpenOrdersForTable,
  type CreatedOrder,
  type OpenOrder,
} from "@/hooks/use-orders";
import { useFloors, type RestaurantTable } from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function PosPage() {
  return (
    <Suspense fallback={null}>
      <PosPageInner />
    </Suspense>
  );
}

function PosPageInner() {
  const { t } = useI18n();
  const { branchId, isLoading: branchLoading } = useBranch();
  const { note, clear: clearNote, toast } = useNoteToast();
  const floorsQuery = useFloors(branchId);
  const floors = floorsQuery.data;
  const tables = floors?.flatMap((f) => f.tables) ?? [];
  const preselectedTableId = useSearchParams().get("tableId") ?? "";

  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<PosOrderType>("DINE_IN");
  const [delivery, setDelivery] = useState<DeliveryDetails>({ address: "", pincode: "", phone: "" });
  const [scheduledFor, setScheduledFor] = useState("");
  const [tableId, setTableIdRaw] = useState(preselectedTableId);
  // Unsent cart per table, so switching tables never moves or loses items.
  const [drafts, setDrafts] = useState<Drafts<CartLine>>({});
  const setTableId = (next: string) => {
    if (next === tableId) return;
    const r = switchTableDraft(drafts, tableId, next, lines);
    setDrafts(r.drafts);
    setLines(r.lines);
    setSelectedBillId(null);
    setTableIdRaw(next);
  };
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [pickerItem, setPickerItem] = useState<MenuItem | null>(null);
  const [activeOrder, setActiveOrder] = useState<CreatedOrder | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<OpenOrder["customer"]>(null);
  // /pos?tableId=... can change while this page stays mounted.
  const [seenPreselected, setSeenPreselected] = useState(preselectedTableId);
  if (preselectedTableId !== seenPreselected) {
    setSeenPreselected(preselectedTableId);
    if (preselectedTableId && !activeOrder) setTableId(preselectedTableId);
  }
  // Phones show the menu full-screen and the cart/checkout as an overlay; from
  // lg up both sit side by side and this flag is ignored.
  const [cartOpen, setCartOpen] = useState(false);

  // Mirror the cart to the customer-facing display (/customer-display).
  useEffect(() => {
    if (activeOrder) return;
    publishDisplay(
      lines.length === 0
        ? { kind: "idle" }
        : {
            kind: "cart",
            lines: lines.map((l) => ({
              name: l.modifierLabel ? `${l.name} (${l.modifierLabel})` : l.name,
              quantity: l.quantity,
              total: l.unitPrice * l.quantity,
            })),
            subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
          },
    );
  }, [lines, activeOrder]);

  const createOrder = useCreateOrder(branchId);
  const addOrderItems = useAddOrderItems(branchId);
  const openBillsQuery = useOpenOrdersForTable(
    branchId,
    orderType === "DINE_IN" ? tableId || null : null,
  );
  const existingOrders = openBillsQuery.data;
  // A table can carry several open bills; the user picks which one gets the
  // new items (default: the newest). Until the table's bills are loaded we do
  // not know whether this is a new bill or a new round, so submitting waits.
  const checkingTable =
    orderType === "DINE_IN" && !!tableId && (openBillsQuery.isPending || openBillsQuery.isFetching);
  const existingOrder =
    existingOrders?.find((o) => o.id === selectedBillId) ?? existingOrders?.[0];

  const addLine = (
    menuItemId: string,
    name: string,
    unitPrice: number,
    modifierIds: string[],
    modifierLabel: string,
    portion?: Portion,
    taxRatePercent?: number,
  ) => {
    const key = cartLineKey(menuItemId, modifierIds, portion);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        { key, menuItemId, name, unitPrice, quantity: 1, modifierIds, modifierLabel, portion, taxRatePercent },
      ];
    });
  };

  const handleSelect = (item: MenuItem) => {
    if (item.modifierGroups.length > 0 || item.halfPrice != null) {
      setPickerItem(item);
      return;
    }
    addLine(item.id, item.name, Number(item.price), [], "", undefined, Number(item.taxRatePercent) || 0);
  };

  const handleModifierConfirm = (modifierIds: string[], modifierLabel: string, portion?: Portion) => {
    if (!pickerItem) return;
    const modifierTotal = modifierIds.reduce((sum, id) => {
      const mod = pickerItem.modifierGroups
        .flatMap((g) => g.modifierGroup.modifiers)
        .find((m) => m.id === id);
      return sum + (mod ? Number(mod.priceAdjustment) : 0);
    }, 0);
    const base =
      portion?.customPrice ??
      (portion?.kind === "HALF" ? Number(pickerItem.halfPrice) : Number(pickerItem.price));
    addLine(
      pickerItem.id,
      portion ? `${pickerItem.name} (${portionText(portion)})` : pickerItem.name,
      base + modifierTotal,
      modifierIds,
      modifierLabel,
      portion,
      Number(pickerItem.taxRatePercent) || 0,
    );
  };

  const updateQuantity = (key: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

  const handleSubmit = () => {
    if (checkingTable) return;
    const sentTableId = tableId;
    const items = lines.map((l) => ({
      menuItemId: l.menuItemId,
      quantity: l.quantity,
      modifierIds: l.modifierIds,
      ...(l.portion
        ? {
            portion: l.portion.kind,
            customPrice: l.portion.customPrice,
            ...(l.portion.kind === "CUSTOM" ? { customLabel: l.portion.customLabel } : {}),
          }
        : {}),
    }));

    if (existingOrder) {
      addOrderItems.mutate(
        { orderId: existingOrder.id, dto: { items } },
        {
          onSuccess: (order) => {
            setDrafts((d) => clearDraft(d, sentTableId));
            setActiveCustomer(existingOrder.customer);
            setActiveOrder(order);
            toast.success(t("pos.page.addedToOrder", { number: order.orderNumber }));
          },
          onError: (err) => toast.error(err instanceof ApiError ? err.message : t("pos.page.addFailed")),
        },
      );
      return;
    }

    createOrder.mutate(
      {
        type: orderType,
        tableId: orderType === "DINE_IN" ? tableId : undefined,
        ...(orderType === "DELIVERY" ? { delivery } : {}),
        ...(orderType !== "DINE_IN" && scheduledFor
          ? { scheduledFor: new Date(scheduledFor).toISOString() }
          : {}),
        items,
      },
      {
        onSuccess: (order) => {
          setDrafts((d) => clearDraft(d, sentTableId));
          setActiveCustomer(null);
          setActiveOrder(order);
          setCartOpen(true);
          toast.success(t("pos.page.orderSent", { number: order.orderNumber }));
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("pos.page.createFailed")),
      },
    );
  };

  const viewExistingOrder = () => {
    if (existingOrder) {
      setActiveCustomer(existingOrder.customer);
      setActiveOrder(existingOrder);
      setCartOpen(true);
    }
  };

  const resetForNewOrder = () => {
    setActiveOrder(null);
    setCartOpen(false);
    // The sent cart is gone; other tables' unsent drafts stay.
    setLines([]);
    setSelectedBillId(null);
    setTableIdRaw("");
    setActiveCustomer(null);
    setDelivery({ address: "", pincode: "", phone: "" });
    setScheduledFor("");
  };

  const handleTablePick = (table: RestaurantTable) => setTableId(table.id);

  // Click-to-order: for a fresh dine-in ticket, land on a visual table grid
  // first — the rest of the flow (menu, cart, bill-or-add-more) is
  // unchanged once a table's picked. Takeaway orders and orders already
  // mid-flow (tableId set, or viewing/paying an order) skip straight past
  // it, same as arriving here from the Tables page's own "New order" link
  // (?tableId=... pre-fills this and never shows the picker).
  const showTablePicker = orderType === "DINE_IN" && !tableId && !activeOrder;

  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const quantities = lines.reduce<Record<string, number>>((acc, l) => {
    acc[l.menuItemId] = (acc[l.menuItemId] ?? 0) + l.quantity;
    return acc;
  }, {});
  const selectedTable = orderType === "DINE_IN" ? tables.find((tb) => tb.id === tableId) : undefined;
  const showSummaryBar =
    !showTablePicker && !cartOpen && (lines.length > 0 || !!activeOrder || !!existingOrder);

  const orderTypeOptions: SegmentOption<PosOrderType>[] = [
    { value: "DINE_IN", label: t("common.orderType.DINE_IN"), icon: UtensilsCrossed },
    { value: "TAKEAWAY", label: t("common.orderType.TAKEAWAY"), icon: ShoppingBag },
    { value: "DELIVERY", label: t("common.orderType.DELIVERY"), icon: Bike },
  ];

  return (
    // Desktop/landscape tablet: a fixed-height workspace under the 4rem shell
    // header (minus the dense lg:p-5 padding) whose zones scroll on their own.
    // Below lg the page scrolls naturally and reserves room at the bottom for
    // the floating tab bar (and the order summary bar when it shows).
    <div
      className={cn(
        "flex flex-col gap-3 lg:h-[calc(100dvh-6.5rem)] lg:gap-4",
        showSummaryBar
          ? "max-lg:pb-[calc(10.5rem+env(safe-area-inset-bottom))]"
          : "max-lg:pb-[calc(6.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <StatusNote note={note} onClear={clearNote} />

      {/* Compact workspace toolbar: order type, table, kitchen, customer display. */}
      <div className="flex flex-wrap items-center gap-2">
        {activeOrder ? (
          <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-card ps-2 pe-3.5 text-sm font-semibold text-foreground ring-1 ring-border/70">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ReceiptText className="size-4" />
            </span>
            <bdi>{t("pos.page.orderChip", { number: activeOrder.orderNumber })}</bdi>
          </span>
        ) : (
          <Segmented
            options={orderTypeOptions}
            value={orderType}
            onChange={setOrderType}
            size="lg"
            stretch
            className="sm:w-fit"
            aria-label={t("pos.page.orderType")}
          />
        )}

        {selectedTable && !activeOrder && (
          <button
            type="button"
            onClick={() => setTableId("")}
            title={t("pos.page.changeTable")}
            className="group inline-flex h-11 min-w-0 items-center gap-2 rounded-xl bg-card ps-2 pe-3 text-sm ring-1 ring-border/70 transition-colors hover:bg-muted"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Armchair className="size-4" />
            </span>
            <span className="truncate font-semibold text-foreground">
              {selectedTable.name ?? t("pos.cart.tableN", { n: selectedTable.number })}
            </span>
            {selectedTable.status !== "AVAILABLE" && (
              <StatusPill tone={TABLE_STATUS_TONE[selectedTable.status] ?? "neutral"} className="max-sm:hidden">
                {t(`common.tableStatus.${selectedTable.status}`)}
              </StatusPill>
            )}
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground max-md:sr-only">
              {t("pos.page.changeTable")}
            </span>
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2 max-sm:w-full sm:ms-auto">
          <div className="min-w-0 flex-1 sm:flex-initial">
            <KitchenProgressWidget branchId={branchId} />
          </div>
          <a
            href="/customer-display"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-card px-3 text-sm font-medium text-muted-foreground ring-1 ring-border/70 transition-colors hover:bg-muted hover:text-foreground"
            title={t("pos.page.customerDisplayTitle")}
            aria-label={t("pos.page.customerDisplay")}
          >
            <MonitorSmartphone className="size-4" />
            <span className="max-xl:sr-only">{t("pos.page.customerDisplay")}</span>
          </a>
        </div>
      </div>

      <BranchNotice />

      {showTablePicker ? (
        <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-3 sm:p-5 lg:min-h-0 lg:flex-1">
          <PosTablePicker
            floors={floors ?? []}
            onSelect={handleTablePick}
            isLoading={floorsQuery.isLoading || branchLoading}
            error={floorsQuery.isError ? floorsQuery.error : null}
            onRetry={() => void floorsQuery.refetch()}
            retrying={floorsQuery.isFetching}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
          <section aria-label={t("pos.page.menu")} className="flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
            <ProductGrid branchId={branchId} onSelect={handleSelect} quantities={quantities} />
          </section>

          {/* Order panel: sticky column from lg; a bottom sheet / full screen below. */}
          {cartOpen && (
            <button
              type="button"
              aria-label={t("pos.page.backToMenu")}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            />
          )}
          <aside
            aria-label={t("pos.page.currentOrder")}
            className={cn(
              "flex flex-col overflow-hidden border-border/80 bg-card lg:min-h-0 lg:w-[340px] lg:shrink-0 lg:rounded-2xl lg:border xl:w-[380px]",
              cartOpen
                ? "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:h-dvh max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)] max-lg:shadow-2xl sm:max-lg:h-[92dvh] sm:max-lg:rounded-t-3xl sm:max-lg:border-t sm:max-lg:pt-0"
                : "max-lg:hidden",
            )}
          >
            <div className="flex shrink-0 flex-col items-center pt-2 lg:hidden">
              <span aria-hidden className="hidden h-1.5 w-10 rounded-full bg-border sm:block" />
              <div className="flex w-full items-center px-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="flex h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="size-5 rtl:-scale-x-100" />
                  {t("pos.page.backToMenu")}
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-4 max-lg:pt-1 xl:p-5">
              {activeOrder ? (
                <CheckoutPanel
                  order={activeOrder}
                  branchId={branchId}
                  initialCustomer={activeCustomer}
                  onDone={resetForNewOrder}
                />
              ) : (
                <CartPanel
                  lines={lines}
                  orderType={orderType}
                  onOrderTypeChange={setOrderType}
                  tables={tables}
                  tableId={tableId}
                  onTableChange={setTableId}
                  onIncrement={(key) => updateQuantity(key, 1)}
                  onDecrement={(key) => updateQuantity(key, -1)}
                  onRemove={removeLine}
                  onSubmit={handleSubmit}
                  isSubmitting={createOrder.isPending || addOrderItems.isPending}
                  existingOrderNumber={existingOrder?.orderNumber}
                  onViewExistingOrder={existingOrder ? viewExistingOrder : undefined}
                  openBills={existingOrders?.map((o) => ({ id: o.id, orderNumber: o.orderNumber }))}
                  selectedBillId={existingOrder?.id ?? null}
                  onSelectBill={setSelectedBillId}
                  checkingTable={checkingTable}
                  delivery={delivery}
                  onDeliveryChange={setDelivery}
                  scheduledFor={scheduledFor}
                  onScheduledForChange={setScheduledFor}
                />
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Floating order summary (below lg), kept above the floating tab bar. */}
      {showSummaryBar && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5rem)] z-30 mx-auto flex h-14 max-w-xl items-center gap-3 rounded-2xl bg-primary ps-2 pe-4 text-primary-foreground shadow-[0_16px_40px_-16px_rgb(0_0_0/0.45)] ring-1 ring-black/5 transition-transform active:scale-[0.98] sm:inset-x-4 lg:hidden"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            {activeOrder ? <ReceiptText className="size-5" /> : <ShoppingCart className="size-5" />}
            {!activeOrder && cartCount > 0 && (
              <span className="absolute -end-1.5 -top-1.5 min-w-5 rounded-full bg-gold px-1 text-center text-[11px] font-bold leading-5 text-gold-foreground tabular-nums">
                {cartCount}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-start text-sm font-semibold">
            {activeOrder
              ? t("pos.page.payOrder", { number: activeOrder.orderNumber })
              : lines.length > 0
                ? t("pos.page.viewCart", { n: cartCount })
                : t("pos.page.viewOpenBill", { number: existingOrder?.orderNumber ?? "" })}
          </span>
          {!activeOrder && lines.length > 0 && (
            <span className="shrink-0 text-base font-semibold tabular-nums">{formatCurrency(cartTotal)}</span>
          )}
          <ChevronRight className="size-5 shrink-0 opacity-80 rtl:-scale-x-100" />
        </button>
      )}

      <ModifierPickerDialog
        item={pickerItem}
        open={!!pickerItem}
        onOpenChange={(open) => !open && setPickerItem(null)}
        onConfirm={handleModifierConfirm}
        allowCustom
      />
    </div>
  );
}
