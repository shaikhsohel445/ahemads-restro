"use client";

import type { ReservationStatusDto } from "@nodedr-restaurant/types";
import {
  Armchair,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock,
  DoorOpen,
  MessageSquareText,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AddReservationDialog } from "@/components/reservations/add-reservation-dialog";
import { ChannelBadge } from "@/components/orders/channel-badges";
import { ReservationManageDialog } from "@/components/reservations/reservation-manage-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { QueryError } from "@/components/ui/query-error";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Toolbar } from "@/components/ui/toolbar";
import { useBranch } from "@/hooks/use-branch";
import { useReservations, useUpdateReservationStatus, type Reservation } from "@/hooks/use-reservations";
import { useFloors } from "@/hooks/use-tables";
import { formatDate, formatDefaults, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const STATUS_TONE: Record<ReservationStatusDto, Tone> = {
  RESERVED: "info",
  CONFIRMED: "success",
  ARRIVED: "gold",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

const STRIPE: Record<ReservationStatusDto, string> = {
  RESERVED: "bg-status-info",
  CONFIRMED: "bg-status-success",
  ARRIVED: "bg-status-gold",
  COMPLETED: "bg-status-neutral/50",
  CANCELLED: "bg-status-danger/60",
  NO_SHOW: "bg-status-danger/60",
};

const STATUS_FLOW: ReservationStatusDto[] = [
  "RESERVED",
  "CONFIRMED",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const INACTIVE = new Set<ReservationStatusDto>(["CANCELLED", "NO_SHOW"]);

type Scope = "day" | "upcoming";
type Channel = "all" | "ONLINE" | "STAFF";

/** YYYY-MM-DD of a moment in the restaurant's time zone. */
function dayKey(value: Date | string | number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: formatDefaults().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}
/** Midday UTC of a day key — formats as that same calendar day in any nearby zone. */
function keyToDate(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

export default function ReservationsPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const reservationsQuery = useReservations(branchId);
  const { data: reservations, isLoading } = reservationsQuery;
  const { data: floors } = useFloors(branchId);
  const tables = floors?.flatMap((f) => f.tables) ?? [];
  const updateStatus = useUpdateReservationStatus(branchId);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [channel, setChannel] = useState<Channel>("all");
  const [scope, setScope] = useState<Scope>("day");
  const [todayKey] = useState(() => dayKey(Date.now()));
  const [day, setDay] = useState(todayKey);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () =>
      [...(reservations ?? [])].sort(
        (a, b) => new Date(a.reservedAt).getTime() - new Date(b.reservedAt).getTime(),
      ),
    [reservations],
  );
  const scoped = sorted.filter((r) =>
    scope === "day" ? dayKey(r.reservedAt) === day : dayKey(r.reservedAt) >= todayKey,
  );
  const visible = scoped.filter((r) => channel === "all" || r.channel === channel);

  const active = visible.filter((r) => !INACTIVE.has(r.status));
  const covers = active.reduce((sum, r) => sum + r.guestCount, 0);
  const awaiting = visible.filter((r) => r.status === "RESERVED").length;
  const arrived = visible.filter((r) => r.status === "ARRIVED").length;

  // Agenda groups: by time slot for a single day, by date for "upcoming".
  const groups: { key: string; label: string; items: Reservation[] }[] = [];
  for (const r of visible) {
    const key = scope === "day" ? formatTime(r.reservedAt) : dayKey(r.reservedAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(r);
    else
      groups.push({
        key,
        label:
          scope === "day"
            ? key
            : formatDate(keyToDate(key), { weekday: "short", day: "numeric", month: "short" }),
        items: [r],
      });
  }

  const relativeLabel =
    day === todayKey
      ? t("common.today")
      : day === shiftDay(todayKey, 1)
        ? t("reservations.tomorrow")
        : day === shiftDay(todayKey, -1)
          ? t("reservations.yesterday")
          : formatDate(keyToDate(day), { weekday: "long" });
  const dayLabel = formatDate(keyToDate(day), { day: "numeric", month: "long", year: "numeric" });

  const openPicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <PageHeader
        title={t("reservations.title")}
        description={t("reservations.subtitle")}
        icon={CalendarClock}
        actions={<AddReservationDialog branchId={branchId} tables={tables} />}
      >
        <Toolbar className="gap-3">
          <Segmented
            aria-label={t("reservations.scopeLabel")}
            className="max-md:[&>button]:h-10"
            value={scope}
            onChange={setScope}
            options={[
              { value: "day", label: t("reservations.scopeDay"), icon: CalendarDays },
              { value: "upcoming", label: t("reservations.scopeUpcoming"), icon: CalendarClock },
            ]}
          />
          {scope === "day" && (
            <div className="flex min-w-0 items-center gap-1 rounded-xl bg-card p-1 ring-1 ring-border/70">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 md:size-9"
                aria-label={t("reservations.prevDay")}
                title={t("reservations.prevDay")}
                onClick={() => setDay((d) => shiftDay(d, -1))}
              >
                <ChevronLeft className="size-4 rtl:-scale-x-100" />
              </Button>
              <button
                type="button"
                onClick={openPicker}
                className="relative flex min-w-0 flex-col items-center rounded-lg px-2 py-0.5 text-center leading-tight outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-w-44"
                aria-label={t("reservations.pickDate")}
              >
                <span className="text-xs font-medium text-muted-foreground">{relativeLabel}</span>
                <span className="truncate text-sm font-semibold text-foreground">{dayLabel}</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  tabIndex={-1}
                  aria-hidden
                  value={day}
                  onChange={(e) => e.target.value && setDay(e.target.value)}
                  className="pointer-events-none absolute inset-0 opacity-0"
                />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 md:size-9"
                aria-label={t("reservations.nextDay")}
                title={t("reservations.nextDay")}
                onClick={() => setDay((d) => shiftDay(d, 1))}
              >
                <ChevronRight className="size-4 rtl:-scale-x-100" />
              </Button>
            </div>
          )}
          {scope === "day" && day !== todayKey && (
            <Button variant="outline" className="h-10 px-3.5" onClick={() => setDay(todayKey)}>
              {t("common.today")}
            </Button>
          )}
          <Segmented
            aria-label={t("reservations.channelLabel")}
            className="max-md:[&>button]:h-10 lg:ms-auto"
            value={channel}
            onChange={setChannel}
            options={[
              { value: "all", label: t("common.all"), count: scoped.length },
              {
                value: "ONLINE",
                label: t("reservations.channel.online"),
                count: scoped.filter((r) => r.channel === "ONLINE").length,
              },
              {
                value: "STAFF",
                label: t("reservations.channel.staff"),
                count: scoped.filter((r) => r.channel === "STAFF").length,
              },
            ]}
          />
        </Toolbar>
      </PageHeader>

      <ReservationManageDialog
        branchId={branchId}
        reservation={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-2xl" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : reservationsQuery.isError && !reservations ? (
        <QueryError
          error={reservationsQuery.error}
          what={t("reservations.loadWhat")}
          onRetry={() => void reservationsQuery.refetch()}
          retrying={reservationsQuery.isFetching}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label={t("reservations.statBookings")} value={active.length} icon={CalendarCheck} />
            <StatCard label={t("reservations.statCovers")} value={covers} icon={Users} tone="neutral" />
            <StatCard label={t("reservations.awaiting")} value={awaiting} icon={Clock} tone="info" />
            <StatCard label={t("common.reservationStatus.ARRIVED")} value={arrived} icon={DoorOpen} tone="gold" />
          </div>

          {groups.length > 0 ? (
            <div className="flex flex-col gap-5 sm:gap-6">
              {groups.map((group) => {
                const groupCovers = group.items
                  .filter((r) => !INACTIVE.has(r.status))
                  .reduce((sum, r) => sum + r.guestCount, 0);
                return (
                  <section
                    key={group.key}
                    aria-label={group.label}
                    className={cn(
                      "grid gap-2.5 md:gap-5",
                      scope === "day"
                        ? "md:grid-cols-[6rem_minmax(0,1fr)]"
                        : "md:grid-cols-[8.5rem_minmax(0,1fr)]",
                    )}
                  >
                    <div className="flex items-baseline gap-2 md:flex-col md:gap-1 md:pt-4">
                      <h2 className="text-base font-semibold tracking-tight tabular-nums text-foreground">
                        {group.label}
                      </h2>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {t("reservations.groupSummary", { n: group.items.length, covers: groupCovers })}
                      </span>
                    </div>
                    <ul className="relative flex flex-col gap-2 md:border-s md:border-border/80 md:ps-5">
                      {group.items.map((r) => (
                        <ReservationRow
                          key={r.id}
                          reservation={r}
                          showTime={scope === "upcoming"}
                          pending={updateStatus.isPending}
                          onOpen={() => setSelected(r)}
                          onStatus={(status) => updateStatus.mutate({ id: r.id, status })}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={scope === "day" ? t("reservations.emptyDay") : t("reservations.empty")}
              description={t("reservations.emptyHint")}
              action={<AddReservationDialog branchId={branchId} tables={tables} />}
            />
          )}
        </>
      )}
    </div>
  );
}

function ReservationRow({
  reservation: r,
  showTime,
  pending,
  onOpen,
  onStatus,
}: {
  reservation: Reservation;
  showTime: boolean;
  pending: boolean;
  onOpen: () => void;
  onStatus: (status: ReservationStatusDto) => void;
}) {
  const { t } = useI18n();
  const done = r.status === "COMPLETED" || INACTIVE.has(r.status);

  return (
    <li
      data-slot="card"
      className={cn(
        "relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/80 bg-card p-3 ps-4 transition-shadow hover:shadow-md sm:p-4 sm:ps-5 lg:flex-row lg:items-center lg:gap-4",
        done && "opacity-75",
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-0 start-0 w-1", STRIPE[r.status])} />

      <button
        type="button"
        onClick={onOpen}
        title={t("reservations.manage")}
        className="-m-1 flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl p-1 text-start outline-none hover:bg-surface-2/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          {showTime && (
            <span className="text-sm font-semibold tabular-nums text-foreground">{formatTime(r.reservedAt)}</span>
          )}
          <span className={cn("truncate text-[15px] font-semibold text-foreground", done && "line-through decoration-muted-foreground/50")}>
            {r.customerName}
          </span>
          <ChannelBadge channel={r.channel} />
        </span>
        <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-surface-2 px-2 font-medium text-foreground">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="tabular-nums">{t("reservations.guestsCount", { n: r.guestCount })}</span>
          </span>
          {r.table ? (
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-accent px-2 font-medium text-accent-foreground">
              <Armchair className="size-3.5" />
              {r.table.name ?? t("reservations.tableN", { n: r.table.number })}
            </span>
          ) : (
            <span className="inline-flex h-7 items-center rounded-lg border border-dashed border-border px-2">
              {t("reservations.noTable")}
            </span>
          )}
          {r.phone && (
            <span className="inline-flex h-7 items-center gap-1 px-1">
              <Phone className="size-3.5" />
              <bdi dir="ltr" className="tabular-nums">{r.phone}</bdi>
            </span>
          )}
        </span>
        {r.specialRequests && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquareText className="size-3.5 shrink-0 text-gold" />
            <span className="truncate">{r.specialRequests}</span>
          </span>
        )}
      </button>

      <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:flex-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("reservations.changeStatus")}
            className="inline-flex h-10 items-center gap-1 rounded-full pe-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <StatusPill tone={STATUS_TONE[r.status]} pulse={r.status === "RESERVED"} className="h-7">
              {t(`common.reservationStatus.${r.status}`)}
              <ChevronDown className="size-3 opacity-70" />
            </StatusPill>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_FLOW.map((status) => (
              <DropdownMenuItem key={status} disabled={status === r.status} onClick={() => onStatus(status)}>
                {t(`common.reservationStatus.${status}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ms-auto flex items-center gap-1.5">
          {r.status === "RESERVED" && (
            <>
              <Button
                variant="secondary"
                className="h-10 bg-status-success-soft px-3 text-status-success hover:bg-status-success-soft/70"
                title={t("reservations.accept")}
                aria-label={t("reservations.accept")}
                disabled={pending}
                onClick={() => onStatus("CONFIRMED")}
              >
                <Check className="size-4" />
                <span className="max-sm:sr-only">{t("reservations.acceptShort")}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title={t("reservations.reject")}
                aria-label={t("reservations.reject")}
                disabled={pending}
                onClick={() => onStatus("CANCELLED")}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
          {r.status === "CONFIRMED" && (
            <Button
              variant="secondary"
              className="h-10 bg-status-gold-soft px-3 text-status-gold hover:bg-status-gold-soft/70"
              disabled={pending}
              onClick={() => onStatus("ARRIVED")}
            >
              <DoorOpen className="size-4" />
              {t("reservations.markArrived")}
            </Button>
          )}
          {r.status === "ARRIVED" && (
            <Button variant="outline" className="h-10 px-3" disabled={pending} onClick={() => onStatus("COMPLETED")}>
              <CircleCheckBig className="size-4" />
              {t("reservations.markCompleted")}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
