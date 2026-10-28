"use client";

import type { TableStatusDto } from "@nodedr-restaurant/types";
import { Users } from "lucide-react";
import { useState } from "react";
import { ElapsedTimer } from "@/components/tables/elapsed-timer";
import { TableShapeIcon } from "@/components/tables/table-shape-icon";
import { ResponsiveTabs } from "@/components/ui/nav-picker";
import { QueryError } from "@/components/ui/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import type { Floor, RestaurantTable } from "@/hooks/use-tables";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TableStatusDto, string> = {
  AVAILABLE: "bg-success/10 border-success/30 text-success hover:bg-success/15",
  OCCUPIED: "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15",
  RESERVED: "bg-warning/10 border-warning/30 text-warning hover:bg-warning/15",
  CLEANING: "bg-muted border-border text-muted-foreground",
  OUT_OF_SERVICE: "bg-muted border-border text-muted-foreground opacity-50",
};


// A click-to-order table grid, purpose-built for POS: pick a table, land
// straight in the menu. Deliberately a separate, simpler component from
// components/tables/table-tile.tsx (no status dropdown, QR, merge, or bill
// dialog here — that's the Tables page's job) so the Tables tab itself
// stays untouched.
export function PosTablePicker({
  floors,
  onSelect,
  isLoading = false,
  error = null,
  onRetry,
  retrying = false,
}: {
  floors: Floor[];
  onSelect: (table: RestaurantTable) => void;
  isLoading?: boolean;
  /** The floor request failed: say so, never show it as "no tables". */
  error?: unknown;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const { t } = useI18n();
  const statusTitle = (status: TableStatusDto) =>
    status === "OCCUPIED" ? t("pos.tables.occupiedHint") : t(`common.tableStatus.${status}`);
  const [activeFloorId, setActiveFloorId] = useState<string | undefined>(undefined);
  const activeFloor = floors.find((f) => f.id === (activeFloorId ?? floors[0]?.id));

  if (error && floors.length === 0) {
    return <QueryError error={error} what={t("pos.tables.what")} onRetry={() => onRetry?.()} retrying={retrying} />;
  }
  if (isLoading && floors.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-busy="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (floors.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("pos.tables.noneSetUp")}
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {floors.length > 1 && (
        <ResponsiveTabs
          label={t("pos.tables.floor")}
          value={activeFloor?.id ?? floors[0].id}
          onChange={setActiveFloorId}
          items={floors.map((f) => ({
            id: f.id,
            label: f.name,
            hint: t("pos.tables.free", { n: f.tables.filter((tb) => tb.status === "AVAILABLE").length }),
          }))}
        />
      )}

      <div className="grid flex-1 auto-rows-min grid-cols-3 items-start gap-3 overflow-y-auto pb-2 sm:grid-cols-4 lg:grid-cols-5 lg:gap-4 xl:grid-cols-6 2xl:grid-cols-7">
        {activeFloor?.tables.map((table) => {
          const clickable = table.status !== "CLEANING" && table.status !== "OUT_OF_SERVICE";
          return (
            <button
              key={table.id}
              type="button"
              disabled={!clickable}
              title={statusTitle(table.status)}
              onClick={() => onSelect(table)}
              className={cn(
                "flex h-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-xs font-medium shadow-sm transition-transform lg:h-36 lg:gap-1.5",
                clickable && "cursor-pointer hover:scale-[1.03] hover:shadow-md",
                !clickable && "cursor-not-allowed",
                STATUS_STYLES[table.status],
              )}
            >
              <TableShapeIcon shape={table.shape} capacity={table.capacity} className="h-6 w-6 lg:h-8 lg:w-8" />
              <span className="text-sm font-semibold lg:text-lg">{table.name ?? t("pos.tables.short", { n: table.number })}</span>
              <span className="flex items-center gap-1 text-[11px] opacity-80">
                <Users className="h-3 w-3" />
                {table.capacity}
              </span>
              <span className="hidden rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide lg:inline">
                {t(`common.tableStatus.${table.status}`)}
              </span>
              {(table.status === "OCCUPIED" || table.status === "RESERVED") && (
                <ElapsedTimer since={table.statusSince} className="flex items-center gap-1 text-[10px] opacity-70" />
              )}
            </button>
          );
        })}
        {activeFloor?.tables.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            {t("pos.tables.noneOnFloor")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground lg:border-t lg:border-border lg:pt-3">
        <Legend color="bg-success" label={t("common.tableStatus.AVAILABLE")} />
        <Legend color="bg-primary" label={t("common.tableStatus.OCCUPIED")} />
        <Legend color="bg-warning" label={t("common.tableStatus.RESERVED")} />
        <Legend color="bg-muted-foreground" label={t("pos.tables.cleaningOrOut")} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </div>
  );
}
