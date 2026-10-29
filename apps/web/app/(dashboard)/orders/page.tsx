"use client";

import {
  Ban,
  BellRing,
  CalendarDays,
  ChevronRight,
  Clock,
  ListOrdered,
  ReceiptText,
  SearchX,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ScanOrderInput } from "@/components/orders/scan-order-input";
import { DeleteOrdersDialog } from "@/components/orders/delete-orders-dialog";
import { ChannelBadge, TypeBadge } from "@/components/orders/channel-badges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { ORDER_STATUS_TONE, StatusPill } from "@/components/ui/status-pill";
import { SearchInput, Toolbar } from "@/components/ui/toolbar";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import {
  useManagedOrders,
  type ManagedOrder,
  type OrderChannel,
  type OrderTab,
} from "@/hooks/use-orders";
import { formatCurrency, formatDateTime, formatDefaults } from "@/lib/format";
import { openEntity } from "@/lib/entity-events";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type T = (key: string, vars?: Record<string, string | number>) => string;

// Labels: orders.tab.<key>, translated at render time.
const TABS: { key: OrderTab }[] = [{ key: "pending" }, { key: "active" }, { key: "history" }];

// One chip = one filter. Online/Offline filter by channel, the rest by how
// the order is fulfilled.
// Labels: orders.filter.<key>, translated at render time.
const FILTERS: { key: string; channel?: OrderChannel; type?: string }[] = [
  { key: "all" },
  { key: "online", channel: "ONLINE" },
  { key: "offline", channel: "STAFF" },
  { key: "takeaway", type: "TAKEAWAY" },
  { key: "delivery", type: "DELIVERY" },
  { key: "dinein", type: "DINE_IN" },
];

function timeAgo(iso: string, t: T) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return t("orders.ago.now");
  if (m < 60) return t("orders.ago.minutes", { n: m });
  const h = Math.round(m / 60);
  return h < 24 ? t("orders.ago.hours", { n: h }) : t("orders.ago.days", { n: Math.round(h / 24) });
}

/** yyyy-mm-dd of a timestamp in the restaurant's time zone (matches <input type="date">). */
function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: formatDefaults().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function rowStatus(order: ManagedOrder, t: T): { tone: Tone; label: string; pulse?: boolean } {
  if (order.acceptance === "PENDING") return { tone: "gold", label: t("orders.needsAction"), pulse: true };
  if (order.acceptance === "REJECTED") return { tone: "danger", label: t("orders.rejected") };
  return { tone: ORDER_STATUS_TONE[order.status] ?? "neutral", label: t(`common.orderStatus.${order.status}`) };
}

const isFinished = (o: ManagedOrder) => o.status === "PAID" || o.status === "CANCELLED";

export default function OrdersPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [tab, setTab] = useState<OrderTab>("pending");
  const [filterKey, setFilterKey] = useState("all");
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("");
  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];
  const { data: orders, isLoading } = useManagedOrders(branchId, tab, filter.channel, filter.type);
  const { data: pendingOrders } = useManagedOrders(branchId, "pending");
  const pendingCount = pendingOrders?.length ?? 0;

  // Search and date narrow the list already loaded for this tab/filter.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (day && dayKey(o.createdAt) !== day) return false;
      if (!q) return true;
      const hay = [
        o.orderNumber,
        o.guestName,
        o.customer?.name,
        o.customer?.phone,
        o.table ? String(o.table.number) : null,
        o.table?.name,
        ...o.items.map((i) => i.nameSnapshot),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, query, day]);
  const narrowed = query.trim() !== "" || day !== "";

  const stats = useMemo(() => {
    const live = visible.filter((o) => o.status !== "CANCELLED" && o.acceptance !== "REJECTED");
    return {
      value: live.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
      cancelled: visible.length - live.length,
    };
  }, [visible]);

  // Admin-only multi-select delete of finished transactions (History tab).
  const { data: me } = useCurrentUser();
  const canDelete =
    hasPermission(me?.user, "orders.delete") &&
    ["OWNER", "ADMINISTRATOR"].includes(me?.user.roleName ?? "");
  const selectable = canDelete && tab === "history";
  const finished = visible.filter(isFinished);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const visibleSelected = finished.filter((o) => selected.has(o.id)).map((o) => o.id);
  const allSelected = finished.length > 0 && visibleSelected.length === finished.length;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(finished.map((o) => o.id)));

  const rowProps = (o: ManagedOrder) => ({
    order: o,
    selectable: selectable && isFinished(o),
    selected: selected.has(o.id),
    onToggle: () => toggle(o.id),
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <PageHeader
        title={t("common.orders")}
        description={t("orders.subtitle")}
        icon={ReceiptText}
        actions={<ScanOrderInput branchId={branchId} className="sm:w-80" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("orders.stats.needsAction")}
          value={pendingCount}
          icon={BellRing}
          tone={pendingCount > 0 ? "gold" : "neutral"}
          hint={t("orders.tab.pending")}
          onClick={() => {
            setTab("pending");
            setSelected(new Set());
          }}
          className={cn(pendingCount > 0 && "ring-1 ring-status-gold/30")}
        />
        <StatCard
          label={t("orders.stats.showing")}
          value={isLoading ? "–" : visible.length}
          icon={ListOrdered}
          tone="info"
          hint={t(`orders.tab.${tab}`)}
        />
        <StatCard
          label={t("orders.stats.value")}
          value={isLoading ? "–" : formatCurrency(stats.value)}
          icon={Wallet}
          tone="success"
          hint={t("orders.stats.valueHint")}
        />
        <StatCard
          label={t("orders.stats.cancelled")}
          value={isLoading ? "–" : stats.cancelled}
          icon={Ban}
          tone={stats.cancelled > 0 ? "danger" : "neutral"}
          hint={t(`orders.tab.${tab}`)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Toolbar className="gap-3">
          <Segmented
            aria-label={t("orders.statusFilter")}
            size="lg"
            value={tab}
            onChange={(next) => {
              setTab(next);
              setSelected(new Set());
            }}
            options={TABS.map((tb) => ({
              value: tb.key,
              label: t(`orders.tab.${tb.key}`),
              count: tb.key === "pending" && pendingCount > 0 ? pendingCount : undefined,
            }))}
          />
          <Segmented
            aria-label={t("orders.channelFilter")}
            value={filterKey}
            onChange={setFilterKey}
            options={FILTERS.map((f) => ({ value: f.key, label: t(`orders.filter.${f.key}`) }))}
          />
        </Toolbar>
        <Toolbar>
          <SearchInput value={query} onChange={setQuery} placeholder={t("orders.searchPlaceholder")} />
          <div className="relative flex items-center">
            <CalendarDays
              className="pointer-events-none absolute start-3 size-4 text-muted-foreground"
              aria-hidden
            />
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-label={t("orders.dateLabel")}
              className="h-10 rounded-xl border border-input bg-card ps-9 pe-3 text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {day && (
            <Button variant="ghost" className="h-10" onClick={() => setDay("")}>
              <X className="size-4" aria-hidden /> {t("orders.clearDate")}
            </Button>
          )}
          {selectable && finished.length > 0 && (
            <label className="ms-auto flex h-10 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm text-muted-foreground hover:text-foreground">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label={t("orders.selectAllLabel")} />
              {t("orders.selectAll", { n: finished.length })}
            </label>
          )}
        </Toolbar>
      </div>

      {isLoading ? (
        <Card className="gap-2 p-3 sm:p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </Card>
      ) : visible.length === 0 ? (
        narrowed && (orders?.length ?? 0) > 0 ? (
          <EmptyState icon={SearchX} title={t("orders.noMatch")} description={t("orders.noMatchHint")} />
        ) : (
          <EmptyState
            icon={ReceiptText}
            title={tab === "pending" ? t("orders.emptyPending") : t("orders.empty")}
            description={t("orders.emptyHint")}
          />
        )
      ) : (
        <>
          {/* Phones: card list */}
          <ul className="flex flex-col gap-2.5 md:hidden">
            {visible.map((o) => (
              <OrderCard key={o.id} {...rowProps(o)} />
            ))}
          </ul>

          {/* md+: data table with a sticky header (sticks to the scrolling main) */}
          <Card className="hidden gap-0 overflow-clip p-0 md:flex">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-xs font-medium text-muted-foreground">
                  {selectable && <th className="sticky top-0 z-10 w-12 border-b border-border/80 bg-surface-2/95 ps-4 backdrop-blur" />}
                  <Th>{t("orders.col.order")}</Th>
                  <Th>{t("orders.col.customer")}</Th>
                  <Th className="hidden lg:table-cell">{t("orders.col.type")}</Th>
                  <Th className="hidden xl:table-cell">{t("orders.col.items")}</Th>
                  <Th>{t("orders.col.status")}</Th>
                  <Th className="text-end">{t("orders.col.total")}</Th>
                  <th className="sticky top-0 z-10 w-12 border-b border-border/80 bg-surface-2/95 backdrop-blur">
                    <span className="sr-only">{t("common.actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <OrderTableRow key={o.id} {...rowProps(o)} showSelect={selectable} />
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Floating bar: transform/opacity only, instant under reduced motion */}
      <div
        aria-hidden={visibleSelected.length === 0}
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none lg:bottom-6",
          visibleSelected.length > 0 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-[0_12px_32px_rgba(23,21,34,0.14)]",
            visibleSelected.length > 0 && "pointer-events-auto",
          )}
        >
          <span className="text-sm font-medium tabular-nums text-foreground" aria-live="polite">
            {t("orders.selected", { n: visibleSelected.length })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            tabIndex={visibleSelected.length > 0 ? 0 : -1}
            onClick={() => setSelected(new Set())}
          >
            <X className="size-4" aria-hidden /> {t("common.clear")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            tabIndex={visibleSelected.length > 0 ? 0 : -1}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden /> {t("common.delete")}
          </Button>
        </div>
      </div>

      <DeleteOrdersDialog
        branchId={branchId}
        orderIds={visibleSelected}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onDeleted={() => setSelected(new Set())}
      />
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-10 border-b border-border/80 bg-surface-2/95 px-4 py-3 text-start font-medium whitespace-nowrap backdrop-blur",
        className,
      )}
    >
      {children}
    </th>
  );
}

interface RowProps {
  order: ManagedOrder;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
}

function useRowText(order: ManagedOrder) {
  const { t } = useI18n();
  return {
    t,
    name: order.guestName ?? order.customer?.name ?? t("orders.walkIn"),
    summary: order.items.map((i) => `${i.quantity}× ${i.nameSnapshot}`).join(", "),
    status: rowStatus(order, t),
    where: order.table ? (order.table.name ?? t("orders.edit.tableN", { n: order.table.number })) : null,
  };
}

function OrderTableRow({ order, selectable, selected, onToggle, showSelect }: RowProps & { showSelect: boolean }) {
  const { t, name, summary, status, where } = useRowText(order);
  const open = () => openEntity("Order", order.id);
  return (
    <tr
      onClick={open}
      className={cn(
        "group cursor-pointer transition-colors duration-150 hover:bg-muted/50 motion-reduce:transition-none [&>td]:border-b [&>td]:border-border/60 last:[&>td]:border-b-0",
        selected && "bg-accent/60 hover:bg-accent/70",
      )}
    >
      {showSelect && (
        <td className="ps-4" onClick={(e) => e.stopPropagation()}>
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggle}
              aria-label={t("orders.selectOne", { number: order.orderNumber })}
            />
          )}
        </td>
      )}
      <td className="px-4 py-3 align-middle">
        <div className="flex flex-col gap-0.5">
          <bdi className="font-semibold tabular-nums text-foreground">#{order.orderNumber}</bdi>
          <span className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
            <Clock className="size-3" aria-hidden />
            <span title={formatDateTime(order.createdAt)}>{timeAgo(order.createdAt, t)}</span>
          </span>
        </div>
      </td>
      <td className="max-w-56 px-4 py-3 align-middle">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium text-foreground">{name}</span>
          {where && <span className="truncate text-xs text-muted-foreground">{where}</span>}
          <span className="flex flex-wrap gap-1 lg:hidden">
            <ChannelBadge channel={order.channel} />
            <TypeBadge type={order.type} />
          </span>
        </div>
      </td>
      <td className="hidden px-4 py-3 align-middle lg:table-cell">
        <div className="flex flex-wrap gap-1">
          <ChannelBadge channel={order.channel} />
          <TypeBadge type={order.type} />
        </div>
      </td>
      <td className="hidden max-w-72 px-4 py-3 align-middle xl:table-cell">
        <span className="line-clamp-2 text-xs text-muted-foreground">{summary}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusPill tone={status.tone} pulse={status.pulse}>
          {status.label}
        </StatusPill>
      </td>
      <td className="px-4 py-3 text-end align-middle font-semibold whitespace-nowrap tabular-nums text-foreground">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="pe-3 align-middle">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          aria-label={t("orders.openOrder", { number: order.orderNumber })}
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors group-hover:bg-card group-hover:text-foreground"
        >
          <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </button>
      </td>
    </tr>
  );
}

function OrderCard({ order, selectable, selected, onToggle }: RowProps) {
  const { t, name, summary, status, where } = useRowText(order);
  return (
    <li
      className={cn(
        "flex items-stretch overflow-hidden rounded-2xl border border-border/80 bg-card transition-colors duration-150 motion-reduce:transition-none",
        selected && "border-primary/40 bg-accent/60",
      )}
    >
      {selectable && (
        <div className="flex items-center ps-3.5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={t("orders.selectOne", { number: order.orderNumber })}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => openEntity("Order", order.id)}
        className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 text-start active:bg-muted/50"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <bdi className="text-base font-semibold tabular-nums text-foreground">#{order.orderNumber}</bdi>
            <span className="truncate text-sm text-foreground">
              {name}
              {where && <span className="text-muted-foreground"> · {where}</span>}
            </span>
          </div>
          <StatusPill tone={status.tone} pulse={status.pulse}>
            {status.label}
          </StatusPill>
        </div>
        <div className="flex flex-wrap gap-1">
          <ChannelBadge channel={order.channel} />
          <TypeBadge type={order.type} />
        </div>
        {summary && <span className="line-clamp-1 text-xs text-muted-foreground">{summary}</span>}
        <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-2.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden /> {timeAgo(order.createdAt, t)}
          </span>
          <span className="text-base font-semibold tabular-nums text-foreground">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </button>
    </li>
  );
}
