"use client";

import { Mail, Phone, Truck, UserRound } from "lucide-react";
import { useState } from "react";
import { AddSupplierDialog } from "@/components/inventory/add-supplier-dialog";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput, Toolbar } from "@/components/ui/toolbar";
import { useBranch } from "@/hooks/use-branch";
import { useSuppliers } from "@/hooks/use-inventory";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function SuppliersPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [search, setSearch] = useState("");
  const { data: suppliers, isLoading } = useSuppliers(branchId);

  const filtered = suppliers?.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader actions={<AddSupplierDialog branchId={branchId} />} />

      <Toolbar className="justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("inventory.suppliers.search")} />
        {suppliers && suppliers.length > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {t("inventory.suppliers.count", { n: formatNumber(filtered?.length ?? 0) })}
          </span>
        )}
      </Toolbar>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {filtered.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/30 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                  {s.name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{s.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <UserRound className="size-3.5 shrink-0" />
                    {s.contactName || t("inventory.suppliers.noContact")}
                  </p>
                </div>
              </div>
              {(s.phone || s.email) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {s.phone && (
                    <a
                      href={`tel:${s.phone}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-foreground hover:bg-accent"
                    >
                      <Phone className="size-3.5 text-muted-foreground" />
                      <bdi dir="ltr" className="tabular-nums">{s.phone}</bdi>
                    </a>
                  )}
                  {s.email && (
                    <a
                      href={`mailto:${s.email}`}
                      className="inline-flex h-8 min-w-0 max-w-full items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-foreground hover:bg-accent"
                    >
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <bdi className="truncate">{s.email}</bdi>
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Truck}
          title={search ? t("common.noResults") : t("inventory.suppliers.emptyTitle")}
          description={search ? undefined : t("inventory.suppliers.emptyDescription")}
          action={search ? undefined : <AddSupplierDialog branchId={branchId} />}
        />
      )}
    </div>
  );
}
