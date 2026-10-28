"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatCurrency, formatTime } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  UNASSIGNED: "delivery.status.UNASSIGNED",
  ASSIGNED: "delivery.status.ASSIGNED",
  PICKED_UP: "delivery.status.PICKED_UP",
  DELIVERED: "delivery.status.DELIVERED",
  FAILED: "delivery.status.FAILED",
};

const time = (iso: string) => formatTime(iso, { hour: "2-digit", minute: "2-digit" });
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));

function DeliveryCard({ order, branchId }: { order: DeliveryOrder; branchId: string | null }) {
  const { data: drivers } = useDrivers(branchId);
  const { assign, setStatus } = useDeliveryActions(branchId);
  const { t } = useI18n();
  const status = order.deliveryStatus ?? "UNASSIGNED";
  const move = (next: DeliveryStatus) =>
    setStatus.mutate({ orderId: order.id, status: next }, { onError: (e) => toast.error(errMsg(e)) });

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            <bdi>#{order.orderNumber}</bdi> · {order.guestName ?? t("common.guest")}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.deliveryAddress ?? t("delivery.addressInNotes")}
            {order.deliveryPincode && <> · <bdi>{order.deliveryPincode}</bdi></>}
          </p>
          {order.deliveryPhone && (
            <a href={`tel:${order.deliveryPhone}`} className="text-xs text-primary underline underline-offset-2" dir="ltr">
              {order.deliveryPhone}
            </a>
          )}
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
          {t(STATUS_LABEL[status])}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("delivery.card.amounts", { total: formatCurrency(order.totalAmount), fee: formatCurrency(order.deliveryFee) })}
        {order.deliveryZone && ` · ${order.deliveryZone.name}`}
        {order.deliveryEtaAt && ` · ${t("delivery.card.eta", { time: time(order.deliveryEtaAt) })}`}
        {order.scheduledFor && ` · ${t("delivery.card.scheduled", { time: time(order.scheduledFor) })}`}
      </p>
      {order.notes && <p className="text-xs italic text-muted-foreground">{order.notes}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {(status === "UNASSIGNED" || status === "ASSIGNED") && (
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
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">{t("delivery.assignDriver")}</option>
            {drivers?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        {status === "PICKED_UP" && order.driver && (
          <span className="text-xs text-muted-foreground">{t("delivery.driverName", { name: order.driver.name })}</span>
        )}
        {status === "ASSIGNED" && <Button size="sm" onClick={() => move("PICKED_UP")}>{t("delivery.pickedUp")}</Button>}
        {status === "PICKED_UP" && <Button size="sm" onClick={() => move("DELIVERED")}>{t("delivery.status.DELIVERED")}</Button>}
        {status !== "DELIVERED" && status !== "FAILED" && (
          <Button size="sm" variant="outline" onClick={() => move("FAILED")}>
            {t("delivery.markFailed")}
          </Button>
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
    <div className="flex flex-col gap-4">
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder={t("delivery.zones.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder={t("delivery.zones.fee")} inputMode="decimal" dir="ltr" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
        <Input placeholder={t("delivery.zones.minOrder")} inputMode="decimal" dir="ltr" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
        <Input placeholder={t("delivery.zones.eta")} inputMode="numeric" dir="ltr" value={form.etaMinutes} onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })} />
        <Input placeholder={t("delivery.zones.postalCodes")} value={form.pincodes} onChange={(e) => setForm({ ...form, pincodes: e.target.value })} />
        <div className="sm:col-span-2 lg:col-span-5">
          <Button onClick={submit} disabled={create.isPending}>{t("delivery.zones.add")}</Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("delivery.zones.help")}
          </p>
        </div>
      </Card>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : zones && zones.length > 0 ? (
          zones.map((z) => (
            <div key={z.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className={cn("font-medium", !z.isActive && "text-muted-foreground line-through")}>{z.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("delivery.zones.summary", {
                    fee: formatCurrency(z.fee),
                    min: formatCurrency(z.minOrderAmount),
                    eta: t("common.minutes", { n: z.etaMinutes }),
                  })}{" "}
                  · <bdi>{z.pincodes.join(", ")}</bdi>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: z.id, dto: { isActive: !z.isActive } }, { onError: (e) => toast.error(errMsg(e)) })}
                >
                  {z.isActive ? t("common.disable") : t("common.enable")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => confirm(t("delivery.zones.confirmDelete", { name: z.name })) && remove.mutate(z.id)}
                >
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("delivery.zones.empty")}</p>
        )}
      </Card>
    </div>
  );
}

export default function DeliveryPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<"active" | "history" | "zones">("active");
  const { data: orders, isLoading } = useDeliveries(branchId, tab === "history");
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("delivery.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("delivery.subtitle")}</p>
      </div>
      <div className="flex gap-2">
        {(["active", "history", "zones"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs transition-colors",
              tab === id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {t(`delivery.tab.${id}`)}
          </button>
        ))}
      </div>
      {tab === "zones" ? (
        <ZonesTab branchId={branchId} />
      ) : isLoading ? (
        <Skeleton className="h-24" />
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((o) => (
            <DeliveryCard key={o.id} order={o} branchId={branchId} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {tab === "active" ? t("delivery.emptyActive") : t("delivery.emptyHistory")}
        </Card>
      )}
    </div>
  );
}
