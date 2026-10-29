"use client";

import type { TableStatusDto } from "@nodedr-restaurant/types";
import { Armchair, Check, CircleCheck, LayoutGrid, Map as MapIcon, PencilRuler, Plus, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddFloorDialog } from "@/components/tables/add-floor-dialog";
import { EditableTableTile } from "@/components/tables/editable-table-tile";
import { RenameFloorDialog } from "@/components/tables/rename-floor-dialog";
import { TableEditorDialog } from "@/components/tables/table-editor-dialog";
import { TableTile } from "@/components/tables/table-tile";
import { WaitlistPanel } from "@/components/tables/waitlist-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BranchNotice } from "@/components/layout/branch-notice";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { QueryError } from "@/components/ui/query-error";
import { Segmented, type SegmentOption } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill, TABLE_STATUS_TONE } from "@/components/ui/status-pill";
import { TableRequestsBar } from "@/components/tables/table-requests-bar";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { useFloors, type RestaurantTable } from "@/hooks/use-tables";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "plan";
type StatusFilter = "all" | TableStatusDto;

const FILTER_STATUSES: TableStatusDto[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "OUT_OF_SERVICE"];

export default function TablesPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data: me } = useCurrentUser();
  // tables.view is read-only (status updates stay available); layout edits need tables.manage.
  const canManage = hasPermission(me?.user, "tables.manage");
  const floorsQuery = useFloors(branchId);
  const { data: floors } = floorsQuery;
  const { isLoading: branchLoading } = useBranch();
  const isLoading = floorsQuery.isLoading || branchLoading;
  const [activeFloorId, setActiveFloorId] = useState<string | undefined>(undefined);
  const [editModeRequested, setEditMode] = useState(false);
  const editMode = canManage && editModeRequested;
  const [editorTable, setEditorTable] = useState<RestaurantTable | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  // Forces a fresh mount of TableEditorDialog every time it's opened, so its
  // internal form state (number, bulk-mode toggle, etc.) never carries over
  // stale values from a previous open.
  const [editorKey, setEditorKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Card grid by default; the spatial floor plan on request (and always
  // while editing the layout).
  const [view, setView] = useState<ViewMode>("grid");
  const showPlan = editMode || view === "plan";

  // On phones the floor plan is shrunk to fit the screen instead of scrolling
  // sideways (view mode only — dragging needs real pixel coordinates).
  const cardRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setAvailableWidth(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoading, floors?.length, showPlan]);

  const activeFloor = floors?.find((f) => f.id === (activeFloorId ?? floors[0]?.id));
  const allTables = useMemo(() => floors?.flatMap((f) => f.tables) ?? [], [floors]);
  const availableTables = allTables.filter((t) => t.status === "AVAILABLE");

  const canvasWidth = activeFloor
    ? Math.max(600, ...activeFloor.tables.map((t) => t.posX + t.width + 40))
    : 600;
  const canvasHeight = activeFloor
    ? Math.max(320, ...activeFloor.tables.map((t) => t.posY + t.height + 40))
    : 320;

  const contentWidth = activeFloor
    ? Math.max(1, ...activeFloor.tables.map((t) => t.posX + t.width + 16))
    : canvasWidth;
  const fitScale =
    !editMode && availableWidth > 0 && availableWidth < contentWidth ? availableWidth / contentWidth : 1;

  // Restaurant-wide counts for the summary strip; per-floor counts for the filter.
  const countBy = (tables: RestaurantTable[]) => {
    const counts: Record<TableStatusDto, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      RESERVED: 0,
      CLEANING: 0,
      OUT_OF_SERVICE: 0,
    };
    for (const table of tables) counts[table.status] = (counts[table.status] ?? 0) + 1;
    return counts;
  };
  const totals = countBy(allTables);
  const floorTables = activeFloor?.tables ?? [];
  const floorCounts = countBy(floorTables);
  const seatsFree = allTables.filter((x) => x.status === "AVAILABLE").reduce((sum, x) => sum + x.capacity, 0);
  const inService = allTables.length - totals.OUT_OF_SERVICE;
  const occupancy = inService > 0 ? Math.round((totals.OCCUPIED / inService) * 100) : 0;
  const matches = (table: RestaurantTable) => statusFilter === "all" || table.status === statusFilter;
  const visibleTables = floorTables.filter(matches);

  const toggleFilter = (status: TableStatusDto) => setStatusFilter((cur) => (cur === status ? "all" : status));

  const openAddTable = () => {
    setEditorTable(null);
    setEditorOpen(true);
    setEditorKey((k) => k + 1);
  };
  const openEditTable = (table: RestaurantTable) => {
    setEditorTable(table);
    setEditorOpen(true);
    setEditorKey((k) => k + 1);
  };

  const hasFloors = !!floors && floors.length > 0;

  const filterOptions: SegmentOption<StatusFilter>[] = [
    { value: "all", label: t("common.all"), count: floorTables.length },
    ...FILTER_STATUSES.filter(
      (s) => s !== "OUT_OF_SERVICE" || floorCounts.OUT_OF_SERVICE > 0 || statusFilter === "OUT_OF_SERVICE",
    ).map((s) => ({ value: s as StatusFilter, label: t(`common.tableStatus.${s}`), count: floorCounts[s] })),
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <PageHeader
        title={t("tables.title")}
        description={editMode ? t("tables.subtitleEdit") : t("tables.subtitle")}
        icon={LayoutGrid}
        actions={
          canManage && branchId && hasFloors ? (
            <>
              {!editMode && <AddFloorDialog branchId={branchId} />}
              <Button
                variant={editMode ? "default" : "outline"}
                className="h-10 px-3.5"
                aria-pressed={editMode}
                onClick={() => setEditMode((v) => !v)}
              >
                {editMode ? <Check className="size-4" /> : <PencilRuler className="size-4" />}
                {editMode ? t("tables.doneEditing") : t("tables.editFloorPlan")}
              </Button>
            </>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : floorsQuery.isError && !floors ? (
        <QueryError
          error={floorsQuery.error}
          what={t("tables.loadWhat")}
          onRetry={() => void floorsQuery.refetch()}
          retrying={floorsQuery.isFetching}
        />
      ) : !branchId ? (
        <BranchNotice />
      ) : hasFloors ? (
        <>
          {!editMode && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard
                active={statusFilter === "AVAILABLE"}
                label={t("common.tableStatus.AVAILABLE")}
                value={totals.AVAILABLE}
                hint={t("tables.seatsFree", { n: seatsFree })}
                icon={CircleCheck}
                tone={TABLE_STATUS_TONE.AVAILABLE}
                onClick={() => toggleFilter("AVAILABLE")}
              />
              <SummaryCard
                active={statusFilter === "OCCUPIED"}
                label={t("common.tableStatus.OCCUPIED")}
                value={totals.OCCUPIED}
                hint={t("tables.occupancyPct", { n: occupancy })}
                icon={Users}
                tone={TABLE_STATUS_TONE.OCCUPIED}
                onClick={() => toggleFilter("OCCUPIED")}
              />
              <SummaryCard
                active={statusFilter === "RESERVED"}
                label={t("common.tableStatus.RESERVED")}
                value={totals.RESERVED}
                hint={t("tables.ofTotal", { n: allTables.length })}
                icon={Armchair}
                tone={TABLE_STATUS_TONE.RESERVED}
                onClick={() => toggleFilter("RESERVED")}
              />
              <SummaryCard
                active={statusFilter === "CLEANING"}
                label={t("common.tableStatus.CLEANING")}
                value={totals.CLEANING}
                hint={
                  totals.OUT_OF_SERVICE > 0
                    ? t("tables.outOfServiceCount", { n: totals.OUT_OF_SERVICE })
                    : t("tables.ofTotal", { n: allTables.length })
                }
                icon={Sparkles}
                tone={TABLE_STATUS_TONE.CLEANING}
                onClick={() => toggleFilter("CLEANING")}
              />
            </div>
          )}

          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-6">
            <section className="flex min-w-0 flex-col gap-4" aria-label={activeFloor?.name ?? t("tables.floor")}>
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {(floors.length > 1 || editMode) && (
                    <Segmented
                      aria-label={t("tables.floor")}
                      className="max-md:[&>button]:h-10"
                      value={activeFloor?.id ?? floors[0].id}
                      onChange={setActiveFloorId}
                      options={floors.map((f) => ({ value: f.id, label: f.name, count: f.tables.length }))}
                    />
                  )}
                  {editMode && (
                    <>
                      <RenameFloorDialog
                        branchId={branchId}
                        floorId={activeFloor?.id ?? floors[0].id}
                        currentName={activeFloor?.name ?? floors[0].name}
                      />
                      <AddFloorDialog branchId={branchId} />
                      <Button className="h-10 px-3.5" onClick={openAddTable}>
                        <Plus className="size-4" />
                        {t("tables.addTable")}
                      </Button>
                    </>
                  )}
                </div>
                {!editMode && (
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Segmented
                      aria-label={t("tables.statusFilter")}
                      className="max-md:[&>button]:h-10"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={filterOptions}
                    />
                    <Segmented
                      aria-label={t("tables.viewLabel")}
                      className="max-md:[&>button]:h-10"
                      value={view}
                      onChange={setView}
                      options={[
                        { value: "grid", label: <span className="max-sm:sr-only">{t("tables.viewCards")}</span>, icon: LayoutGrid },
                        { value: "plan", label: <span className="max-sm:sr-only">{t("tables.viewPlan")}</span>, icon: MapIcon },
                      ]}
                    />
                  </div>
                )}
              </div>

              {!showPlan ? (
                floorTables.length === 0 ? (
                  <EmptyState
                    icon={LayoutGrid}
                    title={t("tables.noTablesOnFloor")}
                    description={canManage ? t("tables.noTablesHint") : undefined}
                    action={
                      canManage && activeFloor ? (
                        <Button className="h-10 px-4" onClick={openAddTable}>
                          <Plus className="size-4" />
                          {t("tables.addTable")}
                        </Button>
                      ) : undefined
                    }
                  />
                ) : visibleTables.length === 0 ? (
                  <EmptyState
                    compact
                    icon={LayoutGrid}
                    title={t("tables.noMatch")}
                    action={
                      <Button variant="outline" className="h-10 px-4" onClick={() => setStatusFilter("all")}>
                        {t("tables.showAll")}
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-4">
                    {visibleTables.map((table) => (
                      <TableTile
                        key={table.id}
                        variant="card"
                        table={table}
                        allTables={allTables}
                        branchId={branchId}
                      />
                    ))}
                  </div>
                )
              ) : (
                <>
                  <Card
                    ref={cardRef}
                    className={cn(
                      "overflow-auto p-3 sm:p-6",
                      editMode && "border-dashed border-primary/30 bg-surface-2/40",
                    )}
                  >
                    {/* The floor plan is a spatial canvas: positions are stored as
                        left/top pixels, so it stays LTR in every language. */}
                    <div
                      dir="ltr"
                      className="relative"
                      style={
                        fitScale < 1
                          ? { width: availableWidth, height: (canvasHeight - 40) * fitScale + 24 }
                          : { width: canvasWidth, height: canvasHeight, minWidth: "100%" }
                      }
                    >
                      <div
                        className="absolute start-0 top-0 origin-top-left"
                        style={{
                          width: canvasWidth,
                          height: canvasHeight,
                          transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
                          backgroundImage: editMode
                            ? "radial-gradient(circle, color-mix(in oklch, var(--foreground) 14%, transparent) 1px, transparent 1.2px)"
                            : undefined,
                          backgroundSize: editMode ? "20px 20px" : undefined,
                        }}
                      >
                        {activeFloor?.tables.map((table) =>
                          editMode ? (
                            <EditableTableTile
                              key={table.id}
                              table={table}
                              branchId={branchId}
                              onEdit={() => openEditTable(table)}
                            />
                          ) : (
                            <TableTile
                              key={table.id}
                              table={table}
                              allTables={allTables}
                              branchId={branchId}
                              className={matches(table) ? undefined : "opacity-25"}
                              style={{
                                left: table.posX,
                                top: table.posY,
                                width: table.width,
                                height: table.height,
                              }}
                            />
                          ),
                        )}
                        {activeFloor?.tables.length === 0 && (
                          <p className="py-10 text-center text-sm text-muted-foreground">
                            {t("tables.noTablesOnFloor")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {!editMode && (
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={TABLE_STATUS_TONE.AVAILABLE}>{t("common.tableStatus.AVAILABLE")}</StatusPill>
                      <StatusPill tone={TABLE_STATUS_TONE.OCCUPIED}>{t("common.tableStatus.OCCUPIED")}</StatusPill>
                      <StatusPill tone={TABLE_STATUS_TONE.RESERVED}>{t("common.tableStatus.RESERVED")}</StatusPill>
                      <StatusPill tone={TABLE_STATUS_TONE.CLEANING}>{t("tables.legendCleaningOos")}</StatusPill>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Guest requests and the waitlist: an inline-end column on xl;
                below xl the aside dissolves so requests lead the page and the
                waitlist follows the floor. */}
            <aside className="contents xl:sticky xl:top-0 xl:flex xl:flex-col xl:gap-4">
              <div className="order-first empty:hidden xl:order-none">
                <TableRequestsBar branchId={branchId} />
              </div>
              <WaitlistPanel branchId={branchId} availableTables={availableTables} />
            </aside>
          </div>
        </>
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title={t("tables.noFloors")}
          description={canManage ? t("tables.noFloorsManage") : t("tables.noFloorsAsk")}
          action={canManage ? <AddFloorDialog branchId={branchId} /> : undefined}
        />
      )}

      {activeFloor && (
        <TableEditorDialog
          key={editorKey}
          branchId={branchId}
          floorId={activeFloor.id}
          table={editorTable}
          open={editorOpen}
          onOpenChange={setEditorOpen}
        />
      )}
    </div>
  );
}

function SummaryCard({
  active,
  ...props
}: React.ComponentProps<typeof StatCard> & { active: boolean }) {
  return (
    <StatCard
      {...props}
      className={cn(
        "transition-[box-shadow,border-color] hover:border-border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        active && "border-primary/40 ring-2 ring-primary/20",
      )}
    />
  );
}
