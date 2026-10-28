"use client";

import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useKitchenPerformance } from "@/hooks/use-kds";
import { useI18n } from "@/lib/i18n/context";

export function PerformanceWidget({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data } = useKitchenPerformance(branchId);

  if (!data || data.length === 0) return null;

  return (
    <Card className="flex items-center gap-4 overflow-x-auto p-3">
      <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Gauge className="h-3.5 w-3.5" />
        {t("kds.avgTimeToReady")}
      </div>
      {data.map((row) => (
        <div key={row.stationId} className="flex shrink-0 items-baseline gap-1.5 text-sm">
          <span className="text-muted-foreground">{row.stationName}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {t("kds.minutesShort", { n: row.avgMinutesToReady })}
          </span>
          <span className="text-xs text-muted-foreground">({row.ticketsReady})</span>
        </div>
      ))}
    </Card>
  );
}
