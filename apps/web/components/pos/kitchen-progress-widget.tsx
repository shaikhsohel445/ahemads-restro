"use client";

import type { KotStatusDto } from "@ahemads-restro/types";
import { ChefHat, RefreshCw } from "lucide-react";
import { KOT_STATUS_TONE } from "@/components/ui/status-pill";
import { useKdsProgress } from "@/hooks/use-kds";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Labels: pos.kitchen.<status>, translated at render time.
const COLUMNS: KotStatusDto[] = ["NEW", "ACCEPTED", "PREPARING", "READY"];

const DOT: Record<string, string> = {
  gold: "bg-status-gold",
  info: "bg-status-info",
  warning: "bg-status-warning",
  success: "bg-status-success",
  neutral: "bg-status-neutral",
  danger: "bg-status-danger",
  primary: "bg-primary",
};

// A single-line kitchen-status glance for the POS screen - counts only, no
// guest details (that is the full Kitchen Display's job, and needs a kitchen
// role). It reads the order-taking progress feed, so a waiter or cashier sees
// live progress without holding any kitchen permission. If the feed cannot be
// loaded it says so and offers a retry rather than quietly showing nothing.
export function KitchenProgressWidget({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data: tickets, isError, refetch, isFetching } = useKdsProgress(branchId);

  if (isError && !tickets) {
    return (
      <div
        role="status"
        className="flex h-11 min-w-0 items-center gap-2 rounded-xl bg-card ps-3 pe-1.5 text-xs text-muted-foreground ring-1 ring-border/70"
      >
        <ChefHat className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">{t("pos.kitchen.unavailable")}</span>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 font-medium text-primary hover:bg-accent disabled:opacity-60"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} aria-hidden />
          {t("common.retry")}
        </button>
      </div>
    );
  }
  if (!tickets) return null;

  const countOf = (status: KotStatusDto) => tickets.filter((k) => k.status === status).length;
  const active = tickets.filter((k) => k.status !== "SERVED");
  if (active.length === 0) return null;

  return (
    <div className="flex h-11 min-w-0 items-center gap-3 overflow-x-auto rounded-xl bg-card ps-2 pe-3 text-xs ring-1 ring-border/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <span className="flex shrink-0 items-center gap-2 font-medium text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-surface-2">
          <ChefHat className="size-4" />
        </span>
        <span className="max-md:sr-only">{t("pos.kitchen.title")}</span>
      </span>
      {COLUMNS.map((status) => {
        const count = countOf(status);
        if (count === 0) return null;
        const tone = KOT_STATUS_TONE[status] ?? "neutral";
        return (
          <span key={status} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span className="relative flex size-2">
              {status === "NEW" && (
                <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", DOT[tone])} />
              )}
              <span className={cn("relative inline-flex size-2 rounded-full", DOT[tone])} />
            </span>
            <span className="text-muted-foreground">{t(`pos.kitchen.${status}`)}</span>
            <span className="font-semibold text-foreground tabular-nums">{count}</span>
          </span>
        );
      })}
    </div>
  );
}
