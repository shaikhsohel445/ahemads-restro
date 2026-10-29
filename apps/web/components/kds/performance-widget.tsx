"use client";

import { Gauge } from "lucide-react";
import { useKitchenPerformance } from "@/hooks/use-kds";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/** Inline "avg. time to ready" per station: small stats for the KDS toolbar. */
export function PerformanceWidget({ branchId, className }: { branchId: string | null; className?: string }) {
  const { t } = useI18n();
  const { data } = useKitchenPerformance(branchId);

  if (!data || data.length === 0) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Gauge className="size-3.5" aria-hidden />
        {t("kds.avgTimeToReady")}
      </span>
      {data.map((row) => (
        <span
          key={row.stationId}
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-xs ring-1 ring-border/60"
        >
          <span className="text-muted-foreground">{row.stationName}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {t("kds.minutesShort", { n: row.avgMinutesToReady })}
          </span>
          <span className="tabular-nums text-muted-foreground">({row.ticketsReady})</span>
        </span>
      ))}
    </div>
  );
}
