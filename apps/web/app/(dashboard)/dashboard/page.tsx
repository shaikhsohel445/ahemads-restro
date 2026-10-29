"use client";

import { BranchNotice } from "@/components/layout/branch-notice";
import {
  ArrowRight,
  BellRing,
  ChefHat,
  Flame,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  ReceiptText,
  Store,
  Timer,
  TrendingUp,
  Trash2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { OrderDetailDialog } from "@/components/orders/order-detail-dialog";
import { RefundDialog } from "@/components/orders/refund-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { useManagedOrders } from "@/hooks/use-orders";
import { openEntity } from "@/lib/entity-events";
import { useDashboardSummary, useDashboardTrends } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate, formatDefaults, formatNumber, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const ONLINE_ORDER_TYPES = new Set(["QR_ORDER", "KIOSK"]);

const BAR: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info",
  neutral: "bg-status-neutral",
  gold: "bg-status-gold",
};

// "Now" for the greeting/date line. Server render has no clock of its own
// (it would mismatch the browser), so it renders nothing until hydrated and
// then ticks once a minute.
function subscribeMinute(cb: () => void) {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
}
function getMinute() {
  return Math.floor(Date.now() / 60_000);
}
function useNowMinute(): Date | null {
  const minute = useSyncExternalStore(subscribeMinute, getMinute, () => 0);
  return minute ? new Date(minute * 60_000) : null;
}

function greetingKey(now: Date) {
  // Hour in the restaurant's time zone, not the browser's.
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: formatDefaults().timeZone }).format(now),
  );
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

/** Card section title with a small icon tile and an optional trailing action. */
function WidgetHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <span className="truncate">{title}</span>
      </h2>
      {action}
    </div>
  );
}

/** Proportional bar + legend rows for a set of status counts. */
function StatusBreakdown({ rows }: { rows: { label: string; count: number; tone: Tone }[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-2">
        {total > 0 &&
          rows
            .filter((r) => r.count > 0)
            .map((r) => (
              <div
                key={r.label}
                className={cn("h-full rounded-full transition-all", BAR[r.tone])}
                style={{ width: `${(r.count / total) * 100}%` }}
              />
            ))}
      </div>
      <ul className="flex flex-col gap-0.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-2 py-1 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span className={cn("size-2 shrink-0 rounded-full", BAR[r.tone])} />
              <span className="truncate">{r.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-foreground">{formatNumber(r.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const { branchId } = useBranch();
  const { data, isLoading } = useDashboardSummary(branchId);
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends(branchId);
  const { data: me } = useCurrentUser();
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const { t } = useI18n();
  const now = useNowMinute();

  const firstName = me?.user?.name?.trim().split(/\s+/)[0];
  const title = now
    ? firstName
      ? t(`dashboard.greeting.${greetingKey(now)}`, { name: firstName })
      : t(`dashboard.greetingNoName.${greetingKey(now)}`)
    : t("dashboard.title");
  const dateLine = now
    ? formatDate(now, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  const revenueTotal = (trends?.revenue ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);
  const wasteTotal = (trends?.waste ?? []).reduce((s, d) => s + Number(d.cost || 0), 0);

  const totalTables = data
    ? data.tables.available + data.tables.occupied + data.tables.reserved + data.tables.cleaning + data.tables.outOfService
    : 0;
  const channelTotal = data ? data.channels.online + data.channels.offline : 0;
  const onlinePct = data && channelTotal > 0 ? Math.round((data.channels.online / channelTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        icon={LayoutDashboard}
        description={
          <>
            {dateLine && <span className="font-medium text-foreground/80">{dateLine}</span>}
            {dateLine && <span className="mx-1.5 text-gold">•</span>}
            {t("dashboard.subtitle")}
          </>
        }
        actions={
          <Button variant="outline" render={<Link href="/orders" />}>
            <ReceiptText />
            {t("dashboard.manageOrders")}
          </Button>
        }
      />

      <OrderDetailDialog
        branchId={branchId}
        orderId={viewingOrderId}
        open={!!viewingOrderId}
        onOpenChange={(open) => !open && setViewingOrderId(null)}
      />

      <BranchNotice />

      <PendingOrdersBanner branchId={branchId} />

      <QuickActions />

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.todayRevenue")}
            value={formatCurrency(data.todayRevenue)}
            icon={Wallet}
            tone="success"
            hint={t("dashboard.hint.revenue")}
          />
          <Link
            href="/orders"
            className="block min-w-0 rounded-2xl transition outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50"
            title={t("dashboard.manageOrders")}
          >
            <StatCard
              label={t("dashboard.todayOrders")}
              value={formatNumber(data.todayOrders)}
              icon={ReceiptText}
              tone="primary"
              className="h-full"
              hint={t("dashboard.hint.orders", {
                online: formatNumber(data.channels.online),
                offline: formatNumber(data.channels.offline),
              })}
            />
          </Link>
          <StatCard
            label={t("dashboard.occupiedTables")}
            value={formatNumber(data.tables.occupied)}
            icon={LayoutGrid}
            tone="info"
            hint={t("dashboard.hint.tables", { total: formatNumber(totalTables) })}
          />
          <StatCard
            label={t("dashboard.kitchenQueue")}
            value={formatNumber(data.kitchenQueue.new + data.kitchenQueue.accepted + data.kitchenQueue.preparing)}
            icon={Flame}
            tone="warning"
            hint={t("dashboard.hint.kitchen", { ready: formatNumber(data.kitchenQueue.ready) })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <TrendChart
          className="lg:col-span-8"
          title={t("dashboard.revenueTrend")}
          icon={TrendingUp}
          data={trends?.revenue ?? []}
          valueKey="amount"
          color="var(--chart-1)"
          valueFormatter={(v) => formatCurrency(v)}
          isLoading={trendsLoading}
          emptyMessage={t("dashboard.revenueEmpty")}
          summary={formatCurrency(revenueTotal)}
          height="h-60 sm:h-72"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          <Card className="flex flex-col gap-4 rounded-2xl p-5">
            <WidgetHeader
              icon={LayoutGrid}
              title={t("dashboard.tables")}
              action={
                <Link
                  href="/tables"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t("dashboard.open")}
                  <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                </Link>
              }
            />
            {data ? (
              <StatusBreakdown
                rows={[
                  { label: t("common.tableStatus.AVAILABLE"), count: data.tables.available, tone: "success" },
                  { label: t("common.tableStatus.OCCUPIED"), count: data.tables.occupied, tone: "warning" },
                  { label: t("common.tableStatus.RESERVED"), count: data.tables.reserved, tone: "info" },
                  { label: t("common.tableStatus.CLEANING"), count: data.tables.cleaning, tone: "neutral" },
                ]}
              />
            ) : (
              <Skeleton className="h-32 rounded-xl" />
            )}
          </Card>

          <Card className="flex flex-col gap-4 rounded-2xl p-5">
            <WidgetHeader
              icon={ChefHat}
              title={t("dashboard.kitchenQueueTitle")}
              action={
                <Link
                  href="/kds"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t("dashboard.open")}
                  <ArrowRight className="size-3.5 rtl:-scale-x-100" />
                </Link>
              }
            />
            {data ? (
              <StatusBreakdown
                rows={[
                  { label: t("common.kotStatus.NEW"), count: data.kitchenQueue.new, tone: "gold" },
                  { label: t("common.kotStatus.ACCEPTED"), count: data.kitchenQueue.accepted, tone: "info" },
                  { label: t("common.kotStatus.PREPARING"), count: data.kitchenQueue.preparing, tone: "warning" },
                  { label: t("common.kotStatus.READY"), count: data.kitchenQueue.ready, tone: "success" },
                ]}
              />
            ) : (
              <Skeleton className="h-32 rounded-xl" />
            )}
          </Card>
        </div>

        <Card className="flex min-w-0 flex-col gap-3 rounded-2xl p-5 sm:p-6 lg:col-span-7">
          <WidgetHeader
            icon={Timer}
            title={t("dashboard.recentTransactions")}
            action={
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {t("dashboard.allOrders")}
                <ArrowRight className="size-3.5 rtl:-scale-x-100" />
              </Link>
            }
          />
          {!data ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : data.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-2/60 px-4 py-10 text-center">
              <ReceiptText className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("dashboard.noSalesToday")}</p>
            </div>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {data.recentOrders.map((order) => {
                const isOnline = ONLINE_ORDER_TYPES.has(order.type);
                return (
                  <li
                    key={order.id}
                    className="flex items-center gap-1 rounded-xl px-2 transition-colors hover:bg-surface-2/70"
                  >
                    <button
                      type="button"
                      onClick={() => setViewingOrderId(order.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 py-2.5 text-start text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg"
                      title={t("dashboard.viewOrder")}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          isOnline ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted-foreground",
                        )}
                      >
                        {isOnline ? <Globe className="size-4" /> : <Store className="size-4" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            <bdi>#{order.orderNumber}</bdi>
                          </span>
                          {order.billedAt && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatTime(order.billedAt)}
                            </span>
                          )}
                        </span>
                        <StatusPill tone={isOnline ? "info" : "neutral"} className="h-5 w-fit px-2 text-[11px]">
                          {t(`common.orderType.${order.type}`)}
                        </StatusPill>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </button>
                    <RefundDialog
                      branchId={branchId}
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      maxAmount={Number(order.totalAmount)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:col-span-5">
          <Card className="flex flex-col gap-4 rounded-2xl p-5">
            <WidgetHeader icon={ReceiptText} title={t("dashboard.orderChannels")} />
            <p className="-mt-2 text-xs text-muted-foreground">{t("dashboard.channelsHint")}</p>
            {data ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-accent/60 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                      <Globe className="size-3.5" />
                      <span className="truncate">{t("dashboard.channelOnline")}</span>
                    </div>
                    <div className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
                      {formatNumber(data.channels.online)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Store className="size-3.5" />
                      <span className="truncate">{t("dashboard.channelOffline")}</span>
                    </div>
                    <div className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
                      {formatNumber(data.channels.offline)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${onlinePct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("dashboard.onlineShare", { pct: formatNumber(onlinePct) })}
                  </span>
                </div>
              </>
            ) : (
              <Skeleton className="h-28 rounded-xl" />
            )}
          </Card>

          <TrendChart
            title={t("dashboard.wasteTrend")}
            icon={Trash2}
            data={trends?.waste ?? []}
            valueKey="cost"
            color="var(--chart-2)"
            valueFormatter={(v) => formatCurrency(v)}
            isLoading={trendsLoading}
            emptyMessage={t("dashboard.wasteEmpty")}
            summary={formatCurrency(wasteTotal)}
            height="h-44"
          />
        </div>
      </div>
    </div>
  );
}

// Online orders waiting for a decision — shown on top so they can't be missed.
function PendingOrdersBanner({ branchId }: { branchId: string | null }) {
  const { data } = useManagedOrders(branchId, "pending");
  const { t } = useI18n();
  if (!data || data.length === 0) return null;
  return (
    <Card className="flex flex-col gap-3 rounded-2xl border-primary/30 bg-accent/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BellRing className="size-[18px]" />
          <span className="absolute -end-0.5 -top-0.5 size-2.5 animate-ping rounded-full bg-gold" />
          <span className="absolute -end-0.5 -top-0.5 size-2.5 rounded-full bg-gold" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {data.length === 1
              ? t("dashboard.pendingOne")
              : t("dashboard.pendingMany", { count: formatNumber(data.length) })}
          </p>
          <p className="text-xs text-muted-foreground">{t("dashboard.pendingHint")}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => openEntity("Order", data[0].id)}>
          {t("dashboard.review")} <bdi>#{data[0].orderNumber}</bdi>
        </Button>
        <Button variant="outline" render={<Link href="/orders" />}>
          {t("dashboard.allOrders")}
        </Button>
      </div>
    </Card>
  );
}
