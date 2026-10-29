"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ElapsedTimer } from "./elapsed-timer";

interface TableRequestRow {
  id: string;
  type: "WAITER" | "BILL";
  createdAt: string;
  table: { id: string; number: string; name: string | null };
}

/** Guest "call waiter" / "request bill" taps from the table QR page. */
export function TableRequestsBar({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["table-requests", branchId],
    queryFn: () => api.get<TableRequestRow[]>(`/tables/requests?branchId=${branchId}`),
    enabled: !!branchId,
    refetchInterval: 10_000,
  });
  const resolve = useMutation({
    mutationFn: (id: string) => api.patch(`/tables/requests/${id}/resolve?branchId=${branchId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["table-requests"] }),
  });

  if (!data || data.length === 0) return null;
  return (
    <section
      aria-label={t("tables.requestsTitle")}
      data-slot="card"
      className="flex flex-col gap-3 rounded-2xl border border-status-warning/30 bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-status-warning-soft text-status-warning">
            <BellRing className="size-4" />
          </span>
          {t("tables.requestsTitle")}
        </h2>
        <StatusPill tone="warning" pulse>
          <span className="tabular-nums">{data.length}</span>
        </StatusPill>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((r) => {
          const bill = r.type === "BILL";
          return (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/70 p-2 ps-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-foreground">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    bill ? "bg-status-gold-soft text-status-gold" : "bg-status-warning-soft text-status-warning",
                  )}
                >
                  {bill ? <Receipt className="size-4" /> : <BellRing className="size-4" />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {t(bill ? "tables.requestBill" : "tables.requestWaiter", {
                      table: r.table.name ?? t("tables.tableN", { n: r.table.number }),
                    })}
                  </span>
                  <ElapsedTimer
                    since={r.createdAt}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums"
                  />
                </span>
              </span>
              <Button
                variant="outline"
                className="h-10 shrink-0 px-3"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate(r.id)}
              >
                <Check className="size-4" />
                {t("common.done")}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
