"use client";

import {
  Bike,
  CheckCircle2,
  Clock,
  History,
  MapPin,
  MapPinned,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  Truck,
  UserRound,
  UserRoundSearch,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import { useBranch } from "@/hooks/use-branch";
import {
  useDeliveries,
  useDeliveryActions,
  useDrivers,
  useZoneActions,
  useZones,
  type DeliveryOrder,
  type DeliveryStatus,
} from "@/hooks/use-delivery";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatNumber, formatTime } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  UNASSIGNED: "delivery.status.UNASSIGNED",
  ASSIGNED: "delivery.status.ASSIGNED",
  PICKED_UP: "delivery.status.PICKED_UP",
  DELIVERED: "delivery.status.DELIVERED",
  FAILED: "delivery.status.FAILED",
};

const STATUS_TONE: Record<DeliveryStatus, Tone> = {
  UNASSIGNED: "gold",
  ASSIGNED: "info",
  PICKED_UP: "warning",
  DELIVERED: "success",
  FAILED: "danger",
};

const BOARD_COLUMNS: DeliveryStatus[] = ["UNASSIGNED", "ASSIGNED", "PICKED_UP"];

const time = (iso: string) => formatTime(iso, { hour: "2-digit", minute: "2-digit" });
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));

function DriverChip({ name }: { name: string }) {
  return (
    <span className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full bg-surface-2 ps-1 pe-2.5 text-xs font-medium text-foreground ring-1 ring-border/70">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Bike className="size-3" />
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

function DeliveryCard({ order, branchId }: { order: DeliveryOrder; branchId: string | null }) {
  const { data: drivers } = useDrivers(branchId);
  const { assign, setStatus } = useDeliveryActions(branchId);
  const { t } = useI18n();
  const status = order.deliveryStatus ?? "UNASSIGNED";
  const move = (next: DeliveryStatus) =>
    setStatus.mutate({ orderId: order.id, status: next }, { onError: (e) => toast.error(errMsg(e)) });
  const busy = setStatus.isPending || assign.isPending;

  return (
    <Card className="flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            <bdi>#{order.orderNumber}</bdi>
            <span className="text-muted-foreground"> · </span>
            {order.guestName ?? t("common.guest")}
          </p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
            {formatCurrency(order.totalAmount)}
            <span className="ms-1.5 text-xs font-normal text-muted-foreground">
              {t("delivery.card.fee", { fee: formatCurrency(order.deliveryFee) })}
            </span>
          </p>
        </div>
        <StatusPill tone={STATUS_TONE[status]} pulse={status === "UNASSIGNED"}>
          {t(STATUS_LABEL[status])}
        </StatusPill>
      </div>

      <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <li className="flex items-start gap-2">
          <MapPin className="mt-px size-3.5 shrink-0" />
          <span className="min-w-0 break-words">
            {order.deliveryAddress ?? t("delivery.addressInNotes")}
            {order.deliveryPincode && (
              <>
                {" · "}
                <bdi>{order.deliveryPincode}</bdi>
              </>
            )}
            {order.deliveryZone && <span className="text-foreground/70"> · {order.deliveryZone.name}</span>}
          </span>
        </li>
        {order.deliveryPhone && (
          <li className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" />
            <a
              href={`tel:${order.deliveryPhone}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
              dir="ltr"
            >
              {order.deliveryPhone}
            </a>
          </li>
        )}
        {(order.deliveryEtaAt || order.scheduledFor) && (
          <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Clock className="size-3.5 shrink-0" />
            {order.deliveryEtaAt && (
              <span className="font-medium text-foreground tabular-nums">
                {t("delivery.card.eta", { time: time(order.deliveryEtaAt) })}
              </span>
            )}
            {order.scheduledFor && (
              <span className="tabular-nums">{t("delivery.card.scheduled", { time: time(order.scheduledFor) })}</span>
            )}
          </li>
        )}
        {order.notes && (
          <li className="flex items-start gap-2 rounded-lg bg-surface-2/70 px-2 py-1.5 italic">
            <StickyNote className="mt-px size-3.5 shrink-0 not-italic" />
            <span className="min-w-0 break-words">{order.notes}</span>
          </li>
        )}
      </ul>

      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        {(status === "UNASSIGNED" || status === "ASSIGNED") && (
          <div className="relative">
            <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label={t("delivery.driver")}
              value={order.driver?.id ?? ""}
              onChange={(e) =>
                e.target.value &&
                assign.mutate(
                  { orderId: order.id, driverId: e.target.value },
                  { onError: (err) => toast.error(errMsg(err)) },
                )
              }
              className="h-10 w-full appearance-none rounded-xl border border-input bg-card ps-9 pe-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{t("delivery.assignDriver")}</option>
              {drivers?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {status !== "UNASSIGNED" && status !== "ASSIGNED" && order.driver && (
          <DriverChip name={order.driver.name} />
        )}
        {status === "DELIVERED" && order.deliveredAt && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("delivery.card.deliveredAt", { time: time(order.deliveredAt) })}
          </span>
        )}
        {status !== "DELIVERED" && status !== "FAILED" && (
          <div className="flex flex-wrap gap-2">
            {status === "ASSIGNED" && (
              <Button className="flex-1" disabled={busy} onClick={() => move("PICKED_UP")}>
                <Truck />
                {t("delivery.pickedUp")}
              </Button>
            )}
            {status === "PICKED_UP" && (
              <Button className="flex-1" disabled={busy} onClick={() => move("DELIVERED")}>
                <CheckCircle2 />
                {t("delivery.status.DELIVERED")}
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => move("FAILED")}
            >
              {t("delivery.markFailed")}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function ZonesTab({ branchId }: { branchId: string | null }) {
  const { data: zones, isLoading } = useZones(branchId);
  const { create, remove, update } = useZoneActions(branchId);
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", fee: "40", minOrderAmount: "0", etaMinutes: "45", pincodes: "" });

  const submit = () => {
    const pincodes = form.pincodes.split(/[\s,]+/).filter(Boolean);
    if (!form.name.trim() || pincodes.length === 0) return toast.error(t("delivery.zones.validation"));
    create.mutate(
      {
        name: form.name.trim(),
        fee: form.fee,
        minOrderAmount: form.minOrderAmount,
        etaMinutes: Number(form.etaMinutes),
        pincodes,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success(t("delivery.zones.added"));
          setForm({ ...form, name: "", pincodes: "" });
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <Card className="flex flex-col gap-4 rounded-2xl p-5 lg:col-span-5 lg:self-start xl:col-span-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Plus className="size-4" />
            </span>
            {t("delivery.zones.add")}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">{t("delivery.zones.help")}</p>
        </div>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="zone-name">{t("delivery.zones.name")}</Label>
            <Input id="zone-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-fee">{t("delivery.zones.fee")}</Label>
            <Input id="zone-fee" inputMode="decimal" dir="ltr" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zone-min">{t("delivery.zones.minOrder")}</Label>
            <Input id="zone-min" inputMode="decimal" dir="ltr" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
            <Label htmlFor="zone-eta">{t("delivery.zones.eta")}</Label>
            <Input id="zone-eta" inputMode="numeric" dir="ltr" value={form.etaMinutes} onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="zone-codes">{t("delivery.zones.postalCodes")}</Label>
            <Input id="zone-codes" dir="ltr" value={form.pincodes} onChange={(e) => setForm({ ...form, pincodes: e.target.value })} />
          </div>
          <Button type="submit" className="col-span-2" disabled={create.isPending}>
            <Plus />
            {t("delivery.zones.add")}
          </Button>
        </form>
      </Card>

      <div className="flex min-w-0 flex-col gap-3 lg:col-span-7 xl:col-span-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : zones && zones.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {zones.map((z) => (
              <li key={z.id}>
                <Card className={cn("flex h-full flex-col gap-3 rounded-2xl p-4", !z.isActive && "bg-surface-2/50")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          z.isActive ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted-foreground",
                        )}
                      >
                        <MapPinned className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className={cn("truncate text-sm font-semibold", !z.isActive && "text-muted-foreground")}>
                          {z.name}
                        </p>
                        <StatusPill tone={z.isActive ? "success" : "neutral"} className="mt-1 h-5 px-2 text-[11px]">
                          {z.isActive ? t("delivery.zones.active") : t("delivery.zones.inactive")}
                        </StatusPill>
                      </div>
                    </div>
                    <Switch
                      checked={z.isActive}
                      aria-label={z.isActive ? t("common.disable") : t("common.enable")}
                      title={z.isActive ? t("common.disable") : t("common.enable")}
                      onCheckedChange={() =>
                        update.mutate({ id: z.id, dto: { isActive: !z.isActive } }, { onError: (e) => toast.error(errMsg(e)) })
                      }
                    />
                  </div>
                  <dl className="grid grid-cols-3 gap-2 rounded-xl bg-surface-2/70 p-2.5 text-center">
                    <div className="min-w-0">
                      <dt className="truncate text-[11px] text-muted-foreground">{t("delivery.zones.fee")}</dt>
                      <dd className="truncate text-sm font-semibold tabular-nums">{formatCurrency(z.fee)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="truncate text-[11px] text-muted-foreground">{t("delivery.zones.minOrder")}</dt>
                      <dd className="truncate text-sm font-semibold tabular-nums">{formatCurrency(z.minOrderAmount)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="truncate text-[11px] text-muted-foreground">{t("delivery.zones.etaShort")}</dt>
                      <dd className="truncate text-sm font-semibold tabular-nums">{t("common.minutes", { n: z.etaMinutes })}</dd>
                    </div>
                  </dl>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap gap-1" dir="ltr">
                      {z.pincodes.slice(0, 6).map((p) => (
                        <span key={p} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {p}
                        </span>
                      ))}
                      {z.pincodes.length > 6 && (
                        <span className="rounded-md px-1 py-0.5 text-[11px] text-muted-foreground">
                          +{z.pincodes.length - 6}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={t("common.delete")}
                      title={t("common.delete")}
                      onClick={() => confirm(t("delivery.zones.confirmDelete", { name: z.name })) && remove.mutate(z.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={MapPinned} title={t("delivery.zones.empty")} description={t("delivery.zones.help")} />
        )}
      </div>
    </div>
  );
}

export default function DeliveryPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<"active" | "history" | "zones">("active");
  const { data: orders, isLoading } = useDeliveries(branchId, tab === "history");
  const { t } = useI18n();

  const byStatus = (s: DeliveryStatus) => (orders ?? []).filter((o) => (o.deliveryStatus ?? "UNASSIGNED") === s);
  // Anything active that isn't on the board (shouldn't happen, but never hide an order).
  const offBoard = (orders ?? []).filter((o) => !BOARD_COLUMNS.includes(o.deliveryStatus ?? "UNASSIGNED"));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("delivery.title")} description={t("delivery.subtitle")} icon={Truck}>
        <Segmented
          aria-label={t("delivery.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: t("delivery.tab.active"), icon: Bike },
            { value: "history", label: t("delivery.tab.history"), icon: History },
            { value: "zones", label: t("delivery.tab.zones"), icon: MapPinned },
          ]}
        />
      </PageHeader>

      {tab === "zones" ? (
        <ZonesTab branchId={branchId} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : tab === "active" ? (
        <>
          {/* Phones skip the KPI row — each board section header already carries its count. */}
          <div className="hidden grid-cols-3 gap-4 sm:grid">
            {BOARD_COLUMNS.map((s) => (
              <StatCard
                key={s}
                label={t(STATUS_LABEL[s])}
                value={formatNumber(byStatus(s).length)}
                tone={STATUS_TONE[s]}
                icon={s === "UNASSIGNED" ? UserRoundSearch : s === "ASSIGNED" ? UserRound : Bike}
              />
            ))}
          </div>
          {orders && orders.length > 0 ? (
            // Board: one column per stage on desktop; stacked sections on phones/tablets.
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {BOARD_COLUMNS.map((s) => {
                const list = byStatus(s);
                return (
                  <section
                    key={s}
                    aria-label={t(STATUS_LABEL[s])}
                    className="flex min-w-0 flex-col gap-3 rounded-2xl bg-surface-2/70 p-3 ring-1 ring-border/60"
                  >
                    <header className="flex items-center justify-between gap-2 px-1">
                      <StatusPill tone={STATUS_TONE[s]}>{t(STATUS_LABEL[s])}</StatusPill>
                      <span className="min-w-6 rounded-full bg-card px-2 text-center text-xs font-semibold leading-6 tabular-nums text-muted-foreground ring-1 ring-border/70">
                        {formatNumber(list.length)}
                      </span>
                    </header>
                    {list.length > 0 ? (
                      list.map((o) => <DeliveryCard key={o.id} order={o} branchId={branchId} />)
                    ) : (
                      <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                        {t("delivery.columnEmpty")}
                      </p>
                    )}
                  </section>
                );
              })}
              {offBoard.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-3 xl:grid-cols-3">
                  {offBoard.map((o) => (
                    <DeliveryCard key={o.id} order={o} branchId={branchId} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={Truck} title={t("delivery.emptyActive")} />
          )}
        </>
      ) : orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => (
            <DeliveryCard key={o.id} order={o} branchId={branchId} />
          ))}
        </div>
      ) : (
        <EmptyState icon={History} title={t("delivery.emptyHistory")} />
      )}
    </div>
  );
}
