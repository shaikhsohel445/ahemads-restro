"use client";

import type { TableStatusDto } from "@nodedr-restaurant/types";
import {
  ClipboardList,
  Merge,
  MoreHorizontal,
  Plus,
  QrCode,
  Receipt,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TONE_SOFT } from "@/components/ui/stat-card";
import { StatusPill, TABLE_STATUS_TONE } from "@/components/ui/status-pill";
import { useUpdateTableStatus, type RestaurantTable } from "@/hooks/use-tables";
import { cn } from "@/lib/utils";
import { BillTableDialog } from "./bill-table-dialog";
import { ElapsedTimer } from "./elapsed-timer";
import { MergeTableDialog } from "./merge-table-dialog";
import { TableQrDialog } from "./table-qr-dialog";
import { TableShapeIcon } from "./table-shape-icon";
import { useI18n } from "@/lib/i18n/context";

/** Floor-plan tile colours (soft fill + tinted border), keyed by table status. */
const PLAN_STYLES: Record<TableStatusDto, string> = {
  AVAILABLE: "bg-status-success-soft border-status-success/35 text-status-success",
  OCCUPIED: "bg-status-warning-soft border-status-warning/40 text-status-warning",
  RESERVED: "bg-status-info-soft border-status-info/35 text-status-info",
  CLEANING: "bg-status-neutral-soft border-border text-status-neutral",
  OUT_OF_SERVICE: "bg-status-neutral-soft border-border text-status-neutral opacity-60",
};

/** Inline-start accent stripe on the card view. */
const STRIPE: Record<TableStatusDto, string> = {
  AVAILABLE: "bg-status-success",
  OCCUPIED: "bg-status-warning",
  RESERVED: "bg-status-info",
  CLEANING: "bg-status-neutral/60",
  OUT_OF_SERVICE: "bg-status-neutral/40",
};

const STATUSES: TableStatusDto[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "OUT_OF_SERVICE"];

/**
 * One table on the live floor. `variant="plan"` (default) is the absolutely
 * positioned tile on the floor-plan canvas; `variant="card"` is the
 * responsive card used by the grid view, with quick actions underneath.
 * Both open the same status / QR / bill / merge menu.
 */
export function TableTile({
  table,
  allTables,
  branchId,
  style,
  variant = "plan",
  className,
}: {
  table: RestaurantTable;
  allTables: RestaurantTable[];
  branchId: string | null;
  style?: React.CSSProperties;
  variant?: "plan" | "card";
  className?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const updateStatus = useUpdateTableStatus(branchId);
  const [qrOpen, setQrOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);

  const tone = TABLE_STATUS_TONE[table.status] ?? "neutral";
  const label = table.name ?? t("tables.tableShort", { n: table.number });
  const timed = table.status === "OCCUPIED" || table.status === "RESERVED";
  const goToPos = () => router.push(`/pos?tableId=${table.id}`);

  const menu = (
    <DropdownMenuContent align={variant === "card" ? "end" : "start"}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {t(`common.tableStatus.${table.status}`)} · {t("tables.guestsCount", { n: table.capacity })}
      </div>
      {STATUSES.map((status) => (
        <DropdownMenuItem
          key={status}
          disabled={status === table.status}
          onClick={() => updateStatus.mutate({ id: table.id, status })}
        >
          {t(`common.tableStatus.${status}`)}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setQrOpen(true)}>
        <QrCode className="h-4 w-4" />
        {t("tables.viewQr")}
      </DropdownMenuItem>
      {(table.status === "AVAILABLE" || table.status === "RESERVED") && (
        <DropdownMenuItem onClick={goToPos}>
          <Plus className="h-4 w-4" />
          {t("tables.newOrder")}
        </DropdownMenuItem>
      )}
      {table.status === "OCCUPIED" && (
        <>
          <DropdownMenuItem onClick={goToPos}>
            <Plus className="h-4 w-4" />
            {t("tables.addRound")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBillOpen(true)}>
            <ClipboardList className="h-4 w-4" />
            {t("tables.billThisTable")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMergeOpen(true)}>
            <Merge className="h-4 w-4" />
            {t("tables.mergeHere")}
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );

  const dialogs = (
    <>
      <TableQrDialog table={table} branchId={branchId} open={qrOpen} onOpenChange={setQrOpen} />
      <MergeTableDialog
        branchId={branchId}
        table={table}
        allTables={allTables}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
      />
      <BillTableDialog branchId={branchId} table={table} open={billOpen} onOpenChange={setBillOpen} />
    </>
  );

  if (variant === "plan") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            style={style}
            aria-label={t("tables.tableN", { n: table.number })}
            className={cn(
              "absolute flex flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xs font-medium shadow-sm outline-none transition-[transform,box-shadow,opacity] hover:scale-[1.03] hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
              PLAN_STYLES[table.status],
              className,
            )}
          >
            <TableShapeIcon shape={table.shape} capacity={table.capacity} className="h-6 w-6" />
            <span className="text-sm font-semibold tabular-nums text-foreground">{label}</span>
            <span className="flex items-center gap-1 text-[11px] opacity-80">
              <Users className="h-3 w-3" />
              <span className="tabular-nums">{table.capacity}</span>
            </span>
            {timed && (
              <ElapsedTimer
                since={table.statusSince}
                className="flex items-center gap-1 text-[10px] tabular-nums opacity-75"
              />
            )}
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>
        {dialogs}
      </>
    );
  }

  // Quick actions under the card — the most likely next step for each status.
  const statusAction = (key: string, label: string) => ({
    key,
    icon: Sparkles,
    label,
    onClick: () => updateStatus.mutate({ id: table.id, status: "AVAILABLE" }),
    pending: updateStatus.isPending,
  });
  const quick: {
    key: string;
    icon: typeof Plus;
    label: string;
    onClick: () => void;
    accent?: boolean;
    pending?: boolean;
  }[] =
    table.status === "AVAILABLE" || table.status === "RESERVED"
      ? [{ key: "new", icon: Plus, label: t("tables.newOrder"), onClick: goToPos, accent: true }]
      : table.status === "OCCUPIED"
        ? [
            { key: "round", icon: Plus, label: t("tables.addRound"), onClick: goToPos, accent: true },
            { key: "bill", icon: Receipt, label: t("tables.bill"), onClick: () => setBillOpen(true) },
          ]
        : table.status === "CLEANING"
          ? [statusAction("clean", t("tables.markClean"))]
          : [statusAction("available", t("tables.markAvailable"))];

  return (
    <>
      <div
        data-slot="card"
        className={cn(
          "group/table @container relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-[box-shadow,opacity] hover:shadow-md",
          table.status === "OUT_OF_SERVICE" && "opacity-70",
          className,
        )}
        style={style}
      >
        <span aria-hidden className={cn("absolute inset-y-0 start-0 w-1", STRIPE[table.status])} />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${t("tables.tableN", { n: table.number })} — ${t("tables.moreActions")}`}
            className="flex w-full min-w-0 items-start gap-3 p-3 ps-4 text-start outline-none transition-colors hover:bg-surface-2/50 focus-visible:bg-surface-2/60 @[13rem]:p-4 @[13rem]:ps-5"
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl @[13rem]:size-12",
                TONE_SOFT[tone],
              )}
            >
              <TableShapeIcon shape={table.shape} capacity={table.capacity} className="size-8" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate text-xl leading-tight font-semibold tracking-tight tabular-nums text-foreground @[13rem]:text-2xl">
                  {label}
                </span>
                <MoreHorizontal className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover/table:text-foreground" />
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span className="tabular-nums">{t("tables.seatsCount", { n: table.capacity })}</span>
                </span>
                {timed && (
                  <ElapsedTimer
                    since={table.statusSince}
                    className={cn(
                      "inline-flex items-center gap-1 tabular-nums",
                      table.status === "OCCUPIED" && "font-medium text-status-warning",
                    )}
                  />
                )}
              </span>
            </span>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 px-3 pb-3 ps-4 @[13rem]:px-4 @[13rem]:ps-5">
          <StatusPill tone={tone} pulse={table.status === "OCCUPIED"}>
            {t(`common.tableStatus.${table.status}`)}
          </StatusPill>
          {table.assignedWaiter && (
            <span
              className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
              title={t("tables.server")}
            >
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate">{table.assignedWaiter.name}</span>
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-border/70 bg-surface-2/40 p-2.5 ps-3.5 @[13rem]:flex-row @[13rem]:ps-4">
          {quick.map((q) => (
            <Button
              key={q.key}
              variant={q.accent ? "secondary" : "outline"}
              className={cn(
                "h-11 min-w-0 flex-1 px-3 @[13rem]:h-10",
                q.accent && "bg-accent text-accent-foreground hover:bg-accent/80",
              )}
              disabled={q.pending}
              onClick={q.onClick}
            >
              <q.icon className="size-4" />
              <span className="truncate">{q.label}</span>
            </Button>
          ))}
        </div>
      </div>
      {dialogs}
    </>
  );
}
