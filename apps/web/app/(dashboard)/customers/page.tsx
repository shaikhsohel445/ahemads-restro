"use client";

import { ChevronRight, Gift, Pencil, Star, Trash2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import { InitialsAvatar } from "@/components/customers/initials-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput, Toolbar } from "@/components/ui/toolbar";
import { useBranch } from "@/hooks/use-branch";
import { useCustomers, useDeleteCustomer, type Customer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function CustomersPage() {
  const { branchId } = useBranch();
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useCustomers(branchId, search || undefined);
  const deleteCustomer = useDeleteCustomer(branchId);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { t } = useI18n();

  const totals = useMemo(() => {
    const list = customers ?? [];
    return {
      count: list.length,
      points: list.reduce((s, c) => s + (c.loyaltyPoints || 0), 0),
      wallet: list.reduce((s, c) => s + Number(c.walletBalance || 0), 0),
    };
  }, [customers]);

  const onDelete = (e: React.MouseEvent, customer: Customer) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("customers.confirmDelete", { name: customer.name ?? t("customers.thisCustomer") }))) return;
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => toast.success(t("customers.deleted", { name: customer.name ?? t("common.customer") })),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("customers.deleteError")),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("customers.title")}
        description={t("customers.subtitle")}
        icon={Users}
        actions={<AddCustomerDialog branchId={branchId} triggerSize="default" />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label={search ? t("customers.stats.matching") : t("customers.stats.customers")}
          value={isLoading ? "—" : formatNumber(totals.count)}
          icon={Users}
        />
        <StatCard
          label={t("customers.loyaltyPoints")}
          value={isLoading ? "—" : formatNumber(totals.points)}
          icon={Star}
          tone="gold"
          hint={t("customers.stats.pointsHint")}
        />
        <StatCard
          className="col-span-2 lg:col-span-1"
          label={t("common.paymentMethod.STORE_CREDIT")}
          value={isLoading ? "—" : formatCurrency(totals.wallet)}
          icon={Wallet}
          tone="success"
          hint={t("customers.stats.walletHint")}
        />
      </div>

      <Card className="flex min-w-0 flex-col gap-0 rounded-2xl p-0">
        <Toolbar className="border-b border-border/70 p-3 sm:p-4">
          <SearchInput value={search} onChange={setSearch} placeholder={t("customers.searchPlaceholder")} />
        </Toolbar>

        {/* Column labels — only where the row lays out as columns. */}
        <div className="hidden grid-cols-[minmax(0,1fr)_7rem_8rem_8rem_5.5rem] items-center gap-4 border-b border-border/70 bg-surface-2/50 px-5 py-2.5 text-xs font-medium text-muted-foreground md:grid">
          <span>{t("customers.col.customer")}</span>
          <span className="text-end">{t("customers.loyaltyPoints")}</span>
          <span className="text-end">{t("customers.col.credit")}</span>
          <span>{t("customers.col.since")}</span>
          <span className="sr-only">{t("common.actions")}</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : customers && customers.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border/70">
            {customers.map((c) => (
              <li
                key={c.id}
                className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60 md:grid md:grid-cols-[minmax(0,1fr)_7rem_8rem_8rem_5.5rem] md:gap-4 md:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <InitialsAvatar name={c.name} seed={c.id} />
                  <div className="flex min-w-0 flex-col">
                    {/* Stretched link: the whole row opens the profile, buttons stay separate controls. */}
                    <Link
                      href={`/customers/${c.id}`}
                      className="truncate text-sm font-semibold text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                    >
                      {c.name ?? t("customers.unnamed")}
                    </Link>
                    <span className="truncate text-xs text-muted-foreground">
                      <bdi>{[c.phone, c.email].filter(Boolean).join(" · ") || t("customers.noContact")}</bdi>
                    </span>
                    {/* Phones: the numbers ride under the name. */}
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:hidden">
                      <span className="inline-flex items-center gap-1 font-medium text-status-gold">
                        <Star className="size-3.5" />
                        {t("customers.points", { n: formatNumber(c.loyaltyPoints) })}
                      </span>
                      {Number(c.walletBalance) > 0 && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Gift className="size-3.5" />
                          {formatCurrency(c.walletBalance)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <span className="hidden text-end text-sm font-medium tabular-nums text-foreground md:block">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 text-gold" />
                    {formatNumber(c.loyaltyPoints)}
                  </span>
                </span>
                <span className="hidden text-end text-sm tabular-nums text-foreground md:block">
                  {Number(c.walletBalance) > 0 ? formatCurrency(c.walletBalance) : <span className="text-muted-foreground">—</span>}
                </span>
                <span className="hidden text-sm text-muted-foreground md:block">{formatDate(c.createdAt)}</span>

                <div className="relative z-10 flex shrink-0 items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    title={t("customers.edit")}
                    aria-label={t("customers.edit")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingCustomer(c);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    title={t("customers.delete")}
                    aria-label={t("customers.delete")}
                    onClick={(e) => onDelete(e, c)}
                  >
                    <Trash2 />
                  </Button>
                  <ChevronRight className="hidden size-4 text-muted-foreground/60 sm:block md:hidden rtl:-scale-x-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="m-4 border-0 bg-transparent"
            icon={Users}
            title={search ? t("customers.noMatches") : t("customers.empty")}
            description={search ? undefined : t("customers.emptyHint")}
            action={search ? undefined : <AddCustomerDialog branchId={branchId} triggerSize="default" />}
          />
        )}
      </Card>

      {editingCustomer && (
        <EditCustomerDialog
          branchId={branchId}
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </div>
  );
}
