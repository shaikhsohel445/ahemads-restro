"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Gift,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ReceiptText,
  Star,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { InitialsAvatar } from "@/components/customers/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useBranch } from "@/hooks/use-branch";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

function ContactRow({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 pt-1.5 break-words text-foreground">{children}</span>
    </li>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { branchId } = useBranch();
  const { data: customer, isLoading } = useCustomer(branchId, id);
  const router = useRouter();
  const deleteCustomer = useDeleteCustomer(branchId);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useI18n();

  if (isLoading || !customer) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Skeleton className="h-80 rounded-2xl lg:col-span-4" />
          <Skeleton className="h-80 rounded-2xl lg:col-span-8" />
        </div>
      </div>
    );
  }

  const onDelete = () => {
    if (!confirm(t("customers.confirmDelete", { name: customer.name ?? t("customers.thisCustomer") }))) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => {
        toast.success(t("customers.deleted", { name: customer.name ?? t("common.customer") }));
        router.replace("/customers");
      },
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("customers.deleteError")),
    });
  };

  const visits = customer.orders.length;
  const spend = customer.orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const avgTicket = visits > 0 ? spend / visits : 0;
  const lastVisit = customer.orders.reduce<string | null>(
    (latest, o) => (o.billedAt && (!latest || o.billedAt > latest) ? o.billedAt : latest),
    null,
  );
  const hasContact = customer.phone || customer.email || customer.address;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/customers"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:-scale-x-100" />
        {t("customers.title")}
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Profile card */}
        <Card className="flex flex-col gap-5 rounded-2xl p-5 sm:p-6 lg:col-span-4 lg:self-start">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <InitialsAvatar name={customer.name} seed={customer.id} size="xl" />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {customer.name ?? t("customers.unnamed")}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="gold">
                  <Star />
                  {t("customers.points", { n: formatNumber(customer.loyaltyPoints) })}
                </Badge>
                {customer.marketingOptOut && <StatusPill tone="neutral">{t("customers.optedOut")}</StatusPill>}
              </div>
            </div>
          </div>

          {hasContact ? (
            <ul className="flex flex-col gap-2.5">
              {customer.phone && (
                <ContactRow icon={Phone}>
                  <bdi dir="ltr">{customer.phone}</bdi>
                </ContactRow>
              )}
              {customer.email && (
                <ContactRow icon={Mail}>
                  <bdi>{customer.email}</bdi>
                </ContactRow>
              )}
              {customer.address && <ContactRow icon={MapPin}>{customer.address}</ContactRow>}
            </ul>
          ) : (
            <p className="rounded-xl bg-surface-2/70 px-3 py-2.5 text-sm text-muted-foreground">
              {t("customers.noContactOnFile")}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {t("customers.memberSince", { date: formatDate(customer.createdAt) })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil />
              {t("common.edit")}
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 />
              {t("common.delete")}
            </Button>
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
          {customer.allergies && (
            <div className="flex items-start gap-3 rounded-2xl border border-status-danger/20 bg-status-danger-soft p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-status-danger" />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-status-danger uppercase">
                  {t("customers.allergies")}
                </p>
                <p className="mt-0.5 text-sm text-foreground">{customer.allergies}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label={t("customers.stats.visits")}
              value={formatNumber(visits)}
              icon={ReceiptText}
              hint={lastVisit ? t("customers.stats.lastVisit", { date: formatDate(lastVisit) }) : undefined}
            />
            <StatCard
              label={t("customers.stats.totalSpend")}
              value={formatCurrency(spend)}
              icon={TrendingUp}
              tone="success"
              hint={visits > 0 ? t("customers.stats.avgTicket", { amount: formatCurrency(avgTicket) }) : undefined}
            />
            <StatCard
              label={t("common.paymentMethod.STORE_CREDIT")}
              value={formatCurrency(customer.walletBalance)}
              icon={Wallet}
              tone="info"
            />
            <StatCard
              label={t("customers.giftCards")}
              value={formatNumber(customer.giftCards.length)}
              icon={CreditCard}
              tone="gold"
            />
          </div>

          {customer.giftCards.length > 0 && (
            <Card className="flex flex-col gap-3 rounded-2xl p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Gift className="size-4 text-muted-foreground" />
                {t("customers.giftCards")}
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {customer.giftCards.map((gc) => {
                  const pct =
                    Number(gc.initialValue) > 0
                      ? Math.min(100, (Number(gc.balance) / Number(gc.initialValue)) * 100)
                      : 0;
                  return (
                    <li key={gc.id} className="flex flex-col gap-2 rounded-xl bg-surface-2/70 p-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-mono text-muted-foreground" dir="ltr">
                          {gc.code}
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-foreground">
                          {formatCurrency(gc.balance)}
                          <span className="font-normal text-muted-foreground"> / {formatCurrency(gc.initialValue)}</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-card">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="flex flex-col gap-3 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ReceiptText className="size-4 text-muted-foreground" />
                {t("customers.orderHistory")}
              </h2>
              {visits > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(visits)}</span>
              )}
            </div>
            {customer.orders.length > 0 ? (
              <ul className="-mx-2 flex flex-col">
                {customer.orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-surface-2/60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
                      <ReceiptText className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold text-foreground">
                        <bdi>#{o.orderNumber}</bdi>
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(o.billedAt)} · {formatTime(o.billedAt)}
                      </span>
                    </div>
                    <StatusPill tone="success" className="hidden sm:inline-flex">
                      {t("common.orderStatus.PAID")}
                    </StatusPill>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {formatCurrency(o.totalAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={ReceiptText} title={t("customers.noOrders")} className="border-0 bg-surface-2/50" />
            )}
          </Card>
        </div>
      </div>

      {isEditing && (
        <EditCustomerDialog
          branchId={branchId}
          customer={customer}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
