"use client";

import type { KotStatusDto } from "@ahemads-restro/types";
import { BellRing, CookingPot } from "lucide-react";
import { useEffect } from "react";
import { BranchNotice } from "@/components/layout/branch-notice";
import { PerformanceWidget } from "@/components/kds/performance-widget";
import { IncomingOrderCard } from "@/components/kds/incoming-order-card";
import { LiveIndicator, LiveOfflineBanner, SoundControls } from "@/components/kds/live-status";
import { TicketCard } from "@/components/kds/ticket-card";
import { QueryError } from "@/components/ui/query-error";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { TONE_SOFT } from "@/components/ui/stat-card";
import { KOT_STATUS_TONE, StatusPill } from "@/components/ui/status-pill";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { useKdsSound } from "@/hooks/use-kds-sound";
import { useKdsIncoming, useKdsStations, useKdsTickets, type KotTicket } from "@/hooks/use-kds";
import { useKdsStationPreference } from "@/hooks/use-kds-station";
import { installAudioUnlock } from "@/lib/audio-unlock";
import { resolveStation } from "@/lib/kds-station";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

// Labels come from common.kotStatus.* at render time.
const COLUMNS: KotStatusDto[] = ["NEW", "ACCEPTED", "PREPARING", "READY"];

export default function KdsPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data: me } = useCurrentUser();
  const canAnswer = hasPermission(me?.user, "orders.accept");
  const { data: stations, isError: stationsFailed } = useKdsStations(branchId);
  // The station is a per-device choice (each kitchen screen shows its own), so
  // it is remembered in this browser per branch - see lib/kds-station.ts.
  const pref = useKdsStationPreference(branchId);
  const { active: activeStation, stale, ready } = resolveStation(pref.saved, stations, stationsFailed);
  const canFetch = pref.ready && ready;
  const tickets = useKdsTickets(branchId, activeStation, canFetch);
  const incoming = useKdsIncoming(branchId, canAnswer);
  useKdsSound(branchId);
  useEffect(() => installAudioUnlock(), []);

  const byStatus = (status: KotStatusDto): KotTicket[] =>
    tickets.data?.filter((t) => t.status === status) ?? [];
  const pendingOrders = incoming.data ?? [];

  // Station counts come from the tickets already on screen: every station when
  // "All" is showing, otherwise only the station in view.
  const boardTickets = tickets.data?.filter((tk) => COLUMNS.includes(tk.status));
  const stationCount = (id: string): number | undefined => {
    if (!boardTickets) return undefined;
    if (activeStation === "") return id === "" ? boardTickets.length : boardTickets.filter((tk) => tk.station?.id === id).length;
    return id === activeStation ? boardTickets.length : undefined;
  };

  return (
    // Fills the viewport under the 4rem header: dense shell padding on top,
    // the floating tab bar (~7rem incl. padding) below lg, a small gap on lg+.
    <div className="flex h-[calc(100dvh-11.75rem)] min-h-[30rem] flex-col gap-3 sm:h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-7.25rem)]">
      <h1 className="sr-only">{t("kds.title")}</h1>

      {/* Compact toolbar: live state, station picker, sound, inline stats */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-card p-2 sm:gap-3 sm:p-2.5">
        <LiveIndicator />
        {stations && stations.length > 0 && (
          <Segmented
            aria-label={t("kds.station")}
            size="lg"
            className="order-last min-w-0 basis-full sm:order-none sm:basis-auto"
            value={activeStation}
            onChange={(id) => pref.choose(id)}
            options={[{ id: "", name: t("kds.allStations") }, ...stations].map((s) => ({
              value: s.id,
              label: s.name,
              count: stationCount(s.id),
            }))}
          />
        )}
        <PerformanceWidget branchId={branchId} className="hidden xl:flex" />
        <SoundControls className="ms-auto" />
      </div>
      <PerformanceWidget branchId={branchId} className="shrink-0 px-1 xl:hidden" />

      <LiveOfflineBanner className="shrink-0" />
      {stale && (
        <p role="status" className="shrink-0 rounded-xl bg-status-warning-soft px-3 py-2 text-xs text-status-warning">
          {t("kds.staleStation")}
        </p>
      )}
      {pref.saveFailed && (
        <p role="alert" className="shrink-0 rounded-xl bg-status-danger-soft px-3 py-2 text-xs text-status-danger">
          {t("kds.saveBlocked")}
        </p>
      )}

      <BranchNotice />

      {pendingOrders.length > 0 && (
        <section
          aria-label={t("kds.incomingOrders")}
          className="flex shrink-0 flex-col gap-2 rounded-2xl bg-status-gold-soft/60 p-2.5 ring-1 ring-status-gold/25 sm:p-3"
        >
          <h2 className="flex items-center gap-2 px-1 text-sm font-semibold text-foreground">
            <BellRing className="size-4 text-status-gold motion-safe:animate-pulse" aria-hidden />
            {t("kds.incomingHeading")}
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-status-gold px-2 text-xs font-bold tabular-nums text-white">
              {pendingOrders.length}
            </span>
          </h2>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {pendingOrders.map((order) => (
              <IncomingOrderCard key={order.id} order={order} branchId={branchId} />
            ))}
          </div>
        </section>
      )}
      {canAnswer && incoming.isError && (
        <p role="alert" className="shrink-0 rounded-xl bg-status-danger-soft px-3 py-2 text-xs text-status-danger">
          {t("kds.incomingFailed")}
        </p>
      )}

      {tickets.isError ? (
        <QueryError
          error={tickets.error}
          what={t("kds.loadWhat")}
          onRetry={() => void tickets.refetch()}
          retrying={tickets.isFetching}
        />
      ) : (
        // Phones: one column at a time, swipe sideways. Tablets portrait: two
        // side by side. lg+: all four share the width (scrolling only if a
        // very narrow window cannot fit 15rem each).
        <div className="flex min-h-[20rem] flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain lg:snap-none">
          {COLUMNS.map((status) => {
            const list = byStatus(status);
            const tone = KOT_STATUS_TONE[status];
            return (
              <section
                key={status}
                aria-label={t(`common.kotStatus.${status}`)}
                className="flex w-[86%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/60 sm:w-[calc(50%-0.375rem)] sm:snap-start lg:w-auto lg:min-w-[15rem] lg:flex-1 lg:basis-0"
              >
                <header className="flex shrink-0 items-center justify-between gap-2 px-3 pt-3 pb-2">
                  <h2>
                    <StatusPill tone={tone} pulse={status === "NEW" && list.length > 0} className="h-8 px-3 text-sm font-semibold">
                      {t(`common.kotStatus.${status}`)}
                    </StatusPill>
                  </h2>
                  <span
                    className={cn(
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums",
                      list.length > 0 ? TONE_SOFT[tone] : "bg-card text-muted-foreground",
                    )}
                  >
                    {list.length}
                  </span>
                </header>
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-2 pb-2 sm:px-2.5 sm:pb-2.5">
                  {(tickets.isLoading || !canFetch) &&
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 shrink-0 rounded-2xl" />)}
                  {list.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} branchId={branchId} />
                  ))}
                  {canFetch && !tickets.isLoading && list.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
                      <CookingPot className="size-6 opacity-50" aria-hidden />
                      {t("kds.noTickets")}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
