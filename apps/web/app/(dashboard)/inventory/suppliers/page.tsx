"use client";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { AddSupplierDialog } from "@/components/inventory/add-supplier-dialog";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import { useSuppliers } from "@/hooks/use-inventory";
import { useI18n } from "@/lib/i18n/context";

export default function SuppliersPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [search, setSearch] = useState("");
  const { data: suppliers, isLoading } = useSuppliers(branchId);

  const filtered = suppliers?.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("inventory.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("inventory.subtitle")}
          </p>
        </div>
        <AddSupplierDialog branchId={branchId} />
      </div>

      <InventoryTabs />

      <Input
        placeholder={t("inventory.suppliers.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          filtered.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.contactName || t("inventory.suppliers.noContact")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {s.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <bdi dir="ltr">{s.phone}</bdi>
                  </span>
                )}
                {s.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <bdi>{s.email}</bdi>
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("inventory.suppliers.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.suppliers.emptyDescription")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
