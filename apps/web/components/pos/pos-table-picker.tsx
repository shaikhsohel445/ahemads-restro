"use client";

import type { TableStatusDto } from "@ahemads-restro/types";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { useState } from "react";
import { ElapsedTimer } from "@/components/tables/elapsed-timer";
import { TableShapeIcon } from "@/components/tables/table-shape-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryError } from "@/components/ui/query-error";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { TONE_SOFT } from "@/components/ui/stat-card";
import { StatusPill, TABLE_STATUS_TONE } from "@/components/ui/status-pill";
import type { Floor, RestaurantTable } from "@/hooks/use-tables";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Tile accents per status, on top of the shared TABLE_STATUS_TONE colours.
const TILE_RING: Record<TableStatusDto, string> = {
  AVAILABLE: "border-status-success/35 hover:border-status-success/70",
  OCCUPIED: "border-status-warning/40 hover:border-status-warning/75",
  RESERVED: "border-status-info/35 hover:border-status-info/70",
  CLEANING: "border-border/80",
  OUT_OF_SERVICE: "border-border/80",
};

const LEGEND: TableStatusDto[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"];

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
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3 lg:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]"
        aria-busy="true"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (floors.length === 0) {
    return <EmptyState icon={LayoutGrid} title={t("pos.tables.noneSetUp")} />;
  }

  const floorTables = activeFloor?.tables ?? [];
  const freeHere = floorTables.filter((tb) => tb.status === "AVAILABLE").length;

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Armchair className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {t("pos.tables.title")}
            </h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("pos.tables.freeOfTotal", { free: freeHere, total: floorTables.length })}
            </p>
          </div>
        </div>
        {floors.length > 1 && (
          <Segmented
            aria-label={t("pos.tables.floor")}
            size="lg"
            value={activeFloor?.id ?? floors[0].id}
            onChange={setActiveFloorId}
            options={floors.map((f) => ({
              value: f.id,
              label: f.name,
              count: f.tables.filter((tb) => tb.status === "AVAILABLE").length,
            }))}
          />
        )}
      </div>

      <div className="grid auto-rows-min grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] items-start gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] lg:overflow-y-auto lg:pe-1 lg:pb-1 lg:[scrollbar-width:thin]">
        {floorTables.map((table) => {
          const clickable = table.status !== "CLEANING" && table.status !== "OUT_OF_SERVICE";
          const tone = TABLE_STATUS_TONE[table.status] ?? "neutral";
          return (
            <button
              key={table.id}
              type="button"
              disabled={!clickable}
              title={statusTitle(table.status)}
              onClick={() => onSelect(table)}
              className={cn(
                "flex min-h-32 flex-col gap-3 rounded-2xl border-[1.5px] bg-card p-3 text-start transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:p-4",
                TILE_RING[table.status],
                clickable
                  ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                  : "cursor-not-allowed bg-surface-2/60 opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", TONE_SOFT[tone])}>
                  <TableShapeIcon shape={table.shape} capacity={table.capacity} className="size-7" />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                  <Users className="size-3" aria-hidden />
                  {table.capacity}
                  <span className="sr-only">{t("pos.tables.seats", { n: table.capacity })}</span>
                </span>
              </div>
              <span className="truncate text-lg leading-tight font-semibold tracking-tight text-foreground lg:text-xl">
                {table.name ?? t("pos.tables.short", { n: table.number })}
              </span>
              <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusPill tone={tone} className="max-w-full">
                  <span className="truncate">{t(`common.tableStatus.${table.status}`)}</span>
                </StatusPill>
                {(table.status === "OCCUPIED" || table.status === "RESERVED") && (
                  <ElapsedTimer
                    since={table.statusSince}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums"
                  />
                )}
              </div>
            </button>
          );
        })}
        {floorTables.length === 0 && (
          <EmptyState compact className="col-span-full" icon={LayoutGrid} title={t("pos.tables.noneOnFloor")} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
        {LEGEND.map((status) => (
          <StatusPill key={status} tone={TABLE_STATUS_TONE[status]}>
            {status === "CLEANING" ? t("pos.tables.cleaningOrOut") : t(`common.tableStatus.${status}`)}
          </StatusPill>
        ))}
      </div>
    </div>
  );
}
