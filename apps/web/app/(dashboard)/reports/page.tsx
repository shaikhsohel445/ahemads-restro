"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { SchedulesPanel } from "@/components/reports/schedules-panel";

interface CatalogEntry {
  key: string;
  title: string;
  group: string;
}
interface ReportResult {
  key: string;
  title: string;
  columns: string[];
  rows: (string | number | null)[][];
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
// Report titles, groups and column headers come from the API in English; look
// up a translation by report key / slug and fall back to the server's text.
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function useReportLabels() {
  const { t } = useI18n();
  const tr = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  return {
    title: (reportKey: string, fallback: string) => tr(`reports.report.${reportKey}`, fallback),
    group: (group: string) => tr(`reports.group.${slug(group)}`, group),
    column: (column: string) => tr(`reports.column.${slug(column)}`, column),
  };
}

export default function ReportsPage() {
  const { branchId } = useBranch();
  const { data: me } = useCurrentUser();
  const canExport = hasPermission(me?.user, "data.export");
  const { t } = useI18n();
  const labels = useReportLabels();
  const [key, setKey] = useState("sales-daily");
  const [range, setRange] = useState(() => ({
    from: iso(new Date(Date.now() - 29 * 86_400_000)),
    to: iso(new Date()),
  }));

  const { data: catalog } = useQuery({
    queryKey: ["reports", "catalog"],
    queryFn: () => api.get<CatalogEntry[]>("/reports"),
  });
  const qs = `branchId=${branchId}&from=${range.from}&to=${range.to}`;
  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", key, branchId, range.from, range.to],
    queryFn: () => api.get<ReportResult>(`/reports/${key}?${qs}`),
    enabled: !!branchId && range.from <= range.to,
    retry: false,
  });

  const groups = [...new Set(catalog?.map((c) => c.group))];

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("reports.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-4 print:hidden" aria-label={t("reports.title")}>
          {groups.map((g) => (
            <div key={g} className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{labels.group(g)}</p>
              {catalog
                ?.filter((c) => c.group === g)
                .map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setKey(c.key)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-start text-sm transition-colors",
                      key === c.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {labels.title(c.key, c.title)}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Input type="date" className="w-40" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            <Input type="date" className="w-40" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="me-2 h-4 w-4" /> {t("common.print")}
            </Button>
            {canExport &&
              (["xlsx", "pdf", "csv"] as const).map((f) => (
                <a
                  key={f}
                  href={`/api/v1/reports/${key}/export?${qs}&format=${f}`}
                  className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-secondary"
                >
                  <Download className="me-2 h-4 w-4" /> {f === "xlsx" ? "Excel" : f.toUpperCase()}
                </a>
              ))}
          </div>

          <Card className="overflow-x-auto p-4">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{labels.title(key, data?.title ?? catalog?.find((c) => c.key === key)?.title ?? "")}</h2>
            <p className="mb-3 hidden text-xs text-muted-foreground print:block">
              {t("reports.rangeLabel", { from: formatDate(range.from), to: formatDate(range.to) })}
            </p>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : error ? (
              <p className="text-sm text-destructive">{error instanceof ApiError ? error.message : t("reports.loadError")}</p>
            ) : data && data.rows.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="text-start text-xs text-muted-foreground">
                  <tr>
                    {data.columns.map((c) => (
                      <th key={c} className="py-1 pe-4 font-medium">{labels.column(c)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      {r.map((cell, j) => (
                        <td key={j} className="py-1.5 pe-4 tabular-nums">{cell ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("reports.empty")}</p>
            )}
          </Card>

          {canExport && (
            <SchedulesPanel
              branchId={branchId}
              reportKey={key}
              titles={Object.fromEntries((catalog ?? []).map((c) => [c.key, labels.title(c.key, c.title)]))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
