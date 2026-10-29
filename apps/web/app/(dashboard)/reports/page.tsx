"use client";

import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  ArrowLeft,
  BarChart3,
  Bike,
  Boxes,
  CalendarCheck,
  CalendarDays,
  ChefHat,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileBarChart,
  Flame,
  LayoutGrid,
  LineChart,
  Printer,
  Receipt,
  Repeat,
  Snail,
  TicketPercent,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { SchedulesPanel } from "@/components/reports/schedules-panel";
import { SELECT_CLASS, TABLE_CARD, TABLE_CARD_FOOT } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { TONE_SOFT, type Tone } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/ui/toolbar";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

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

const REPORT_ICON: Record<string, LucideIcon> = {
  "sales-daily": CalendarDays,
  "sales-by-item": UtensilsCrossed,
  "sales-by-category": LayoutGrid,
  "payment-methods": CreditCard,
  discounts: TicketPercent,
  "popular-items": Flame,
  "slow-movers": Snail,
  "peak-hours": Clock,
  customers: Users,
  retention: Repeat,
  "staff-sales": UserCheck,
  "table-turnover": Armchair,
  delivery: Bike,
  reservations: CalendarCheck,
  "food-cost": ChefHat,
  "inventory-valuation": Boxes,
  waste: Trash2,
  tax: Receipt,
};
const GROUP_STYLE: Record<string, { icon: LucideIcon; tone: Tone }> = {
  sales: { icon: TrendingUp, tone: "primary" },
  analytics: { icon: LineChart, tone: "info" },
  customers: { icon: Users, tone: "gold" },
  inventory: { icon: Boxes, tone: "warning" },
  operations: { icon: Wrench, tone: "neutral" },
  staff: { icon: UserCheck, tone: "success" },
  tax: { icon: Receipt, tone: "danger" },
};
const groupStyle = (group: string) => GROUP_STYLE[slug(group)] ?? { icon: FileBarChart, tone: "neutral" as Tone };

type Preset = "7" | "30" | "month" | "custom";
const presetRange = (p: Exclude<Preset, "custom">) => {
  const now = new Date();
  if (p === "month") return { from: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))), to: iso(now) };
  return { from: iso(new Date(Date.now() - (Number(p) - 1) * 86_400_000)), to: iso(now) };
};

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
  const { branchId, branches, setBranchId } = useBranch();
  const { data: me } = useCurrentUser();
  const canExport = hasPermission(me?.user, "data.export");
  const { t } = useI18n();
  const labels = useReportLabels();
  const [key, setKey] = useState("sales-daily");
  const [view, setView] = useState<"catalog" | "report">("catalog");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(() => ({
    from: iso(new Date(Date.now() - 29 * 86_400_000)),
    to: iso(new Date()),
  }));

  const { data: catalog, isLoading: catalogLoading } = useQuery({
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
  const current = catalog?.find((c) => c.key === key);
  const title = labels.title(key, data?.title ?? current?.title ?? "");
  const ReportIcon = REPORT_ICON[key] ?? FileBarChart;
  const preset: Preset =
    (["7", "30", "month"] as const).find((p) => {
      const r = presetRange(p);
      return r.from === range.from && r.to === range.to;
    }) ?? "custom";
  // A column is numeric when every non-empty cell is a number — align it to the end.
  const numericCols = data
    ? data.columns.map((_, j) => data.rows.every((r) => r[j] == null || typeof r[j] === "number"))
    : [];
  const q = search.trim().toLowerCase();
  const matches = (c: CatalogEntry) =>
    !q || labels.title(c.key, c.title).toLowerCase().includes(q) || labels.group(c.group).toLowerCase().includes(q);

  const open = (k: string) => {
    setKey(k);
    setView("report");
  };

  if (view === "catalog") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("reports.title")} description={t("reports.subtitle")} icon={BarChart3}>
          <SearchInput value={search} onChange={setSearch} placeholder={t("reports.searchPlaceholder")} />
        </PageHeader>

        {catalogLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((g) => {
              const items = catalog?.filter((c) => c.group === g && matches(c)) ?? [];
              if (items.length === 0) return null;
              const { icon: GroupIcon, tone } = groupStyle(g);
              return (
                <section key={g} className="flex flex-col gap-3" aria-labelledby={`grp-${slug(g)}`}>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-7 items-center justify-center rounded-lg", TONE_SOFT[tone])}>
                      <GroupIcon className="size-4" />
                    </span>
                    <h2 id={`grp-${slug(g)}`} className="text-sm font-semibold text-foreground">
                      {labels.group(g)}
                    </h2>
                    <span className="rounded-full bg-surface-2 px-2 text-xs leading-5 text-muted-foreground tabular-nums">
                      {formatNumber(items.length)}
                    </span>
                  </div>
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    {items.map((c) => {
                      const Icon = REPORT_ICON[c.key] ?? FileBarChart;
                      return (
                        <li key={c.key}>
                          <button
                            type="button"
                            onClick={() => open(c.key)}
                            className={cn(
                              "group flex h-full w-full items-center gap-3 rounded-2xl border bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                              key === c.key ? "border-primary/40" : "border-border/80",
                            )}
                          >
                            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", TONE_SOFT[tone])}>
                              <Icon className="size-5" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                              {labels.title(c.key, c.title)}
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            {catalog && !catalog.some(matches) && <EmptyState compact icon={FileBarChart} title={t("common.noResults")} />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setView("catalog")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t("reports.allReports")}
        </button>
        <PageHeader
          title={title}
          description={
            <>
              <span className="print:hidden">{current ? labels.group(current.group) : t("reports.title")}</span>
              <span className="hidden print:inline">
                {t("reports.rangeLabel", { from: formatDate(range.from), to: formatDate(range.to) })}
              </span>
            </>
          }
          icon={ReportIcon}
          actions={
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="size-4" /> {t("common.print")}
              </Button>
              {canExport && (
                <div className="flex items-center rounded-xl bg-surface-2 p-1 ring-1 ring-border/70" role="group" aria-label={t("common.export")}>
                  {(["xlsx", "pdf", "csv"] as const).map((f) => (
                    <a
                      key={f}
                      href={`/api/v1/reports/${key}/export?${qs}&format=${f}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground/80 hover:bg-card hover:text-foreground hover:shadow-sm"
                    >
                      <Download className="size-3.5" /> {f === "xlsx" ? "Excel" : f.toUpperCase()}
                    </a>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </div>

      <Card className="px-4 sm:px-5 print:hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented<Preset>
            size="sm"
            aria-label={t("reports.dateRange")}
            value={preset}
            onChange={(p) => p !== "custom" && setRange(presetRange(p))}
            options={[
              { value: "7", label: t("reports.preset.last7") },
              { value: "30", label: t("reports.preset.last30") },
              { value: "month", label: t("common.thisMonth") },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              aria-label={t("common.from")}
              className="min-w-0 flex-1 sm:w-40 sm:flex-none"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
            <span className="text-sm text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label={t("common.to")}
              className="min-w-0 flex-1 sm:w-40 sm:flex-none"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
            {branches.length > 1 && (
              <select
                aria-label={t("common.branch")}
                className={cn(SELECT_CLASS, "w-full sm:w-48")}
                value={branchId ?? ""}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="gap-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </Card>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-status-danger/30 bg-status-danger-soft px-4 py-3 text-sm text-status-danger">
          {error instanceof ApiError ? error.message : t("reports.loadError")}
        </div>
      ) : data && data.rows.length > 0 ? (
        <Card className={cn(TABLE_CARD, "print:max-h-none print:border-0 print:[&_[data-slot=table-container]]:max-h-none")}>
          <Table>
            <TableHeader>
              <TableRow>
                {data.columns.map((c, j) => (
                  <TableHead key={c} className={cn(numericCols[j] && "text-end")}>
                    {labels.column(c)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r, i) => (
                <TableRow key={i}>
                  {r.map((cell, j) => (
                    <TableCell
                      key={j}
                      className={cn(
                        "tabular-nums",
                        numericCols[j] ? "text-end" : "",
                        j === 0 && "font-medium text-foreground",
                      )}
                    >
                      {cell ?? "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className={cn(TABLE_CARD_FOOT, "text-muted-foreground print:hidden")}>
            <span className="tabular-nums">{t("reports.rowCount", { n: formatNumber(data.rows.length) })}</span>
            <span className="tabular-nums">
              {t("reports.rangeLabel", { from: formatDate(range.from), to: formatDate(range.to) })}
            </span>
          </div>
        </Card>
      ) : (
        <EmptyState icon={ReportIcon} title={t("reports.empty")} />
      )}

      {canExport && (
        <SchedulesPanel
          branchId={branchId}
          reportKey={key}
          titles={Object.fromEntries((catalog ?? []).map((c) => [c.key, labels.title(c.key, c.title)]))}
        />
      )}
    </div>
  );
}
