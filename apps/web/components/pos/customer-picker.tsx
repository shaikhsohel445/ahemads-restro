"use client";

import { Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { Input } from "@/components/ui/input";
import { useCustomers, type Customer } from "@/hooks/use-customers";
import { useI18n } from "@/lib/i18n/context";

export function CustomerPicker({
  branchId,
  customer,
  onSelect,
}: {
  branchId: string | null;
  customer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { data: matches } = useCustomers(branchId, search.length >= 2 ? search : undefined);

  if (customer) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-accent/60 py-2 ps-2 pe-1">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-accent-foreground ring-1 ring-primary/10">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {customer.name ?? <bdi dir="ltr">{customer.phone}</bdi>}
          </p>
          <p className="text-xs text-status-gold tabular-nums">{t("pos.customer.points", { n: customer.loyaltyPoints })}</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label={t("pos.customer.detach")}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-status-danger-soft hover:text-status-danger"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("pos.customer.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-xl bg-card ps-9"
        />
      </div>
      <AddCustomerDialog branchId={branchId} onCreated={(c) => onSelect(c)} />
      {search.length >= 2 && matches && matches.length > 0 && (
        <div className="absolute top-full z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
          {matches.slice(0, 5).map((m) => (
            <button
              key={m.id}
              type="button"
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-muted"
              onClick={() => {
                onSelect(m);
                setSearch("");
              }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground">{m.name ?? t("pos.customer.unnamed")}</span>
                <bdi dir="ltr" className="text-xs text-muted-foreground">{m.phone}</bdi>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
