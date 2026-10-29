"use client";

import { Package } from "lucide-react";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/lib/i18n/context";

/** PageHeader + section tabs used at the top of every inventory page. */
export function InventoryHeader({
  description,
  actions,
}: {
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <PageHeader
      title={t("inventory.title")}
      description={description ?? t("inventory.subtitle")}
      icon={Package}
      actions={actions}
    >
      <InventoryTabs />
    </PageHeader>
  );
}
