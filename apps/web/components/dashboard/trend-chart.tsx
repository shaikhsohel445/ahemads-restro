"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Trend points are calendar days ("YYYY-MM-DD", parsed as UTC midnight), so
// format them in UTC to keep the day from shifting with the time zone.
function formatDayLabel(dateStr: string) {
  return formatDate(dateStr, { day: "numeric", month: "short", timeZone: "UTC" });
}

export function TrendChart({
  title,
  icon: Icon,
  data,
  valueKey,
  color,
  valueFormatter,
  isLoading,
  emptyMessage,
  summary,
  className,
  height = "h-56",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: Record<string, string | number>[];
  valueKey: string;
  color: string;
  valueFormatter: (value: number) => string;
  isLoading: boolean;
  emptyMessage: string;
  /** Optional headline figure shown under the title (e.g. the period total). */
  summary?: React.ReactNode;
  className?: string;
  /** Tailwind height class for the plot area. */
  height?: string;
}) {
  const hasData = data.some((d) => Number(d[valueKey]) > 0);
  // Re-render the chart when the UI language changes (tick labels).
  const { locale } = useI18n();
  const gradientId = `trend-${useId().replace(/:/g, "")}`;

  return (
    <Card className={cn("flex min-w-0 flex-col gap-4 rounded-2xl p-5 sm:p-6", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <span className="truncate">{title}</span>
        </h2>
        {summary && !isLoading && hasData && (
          <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{summary}</div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className={cn(height, "rounded-xl")} />
      ) : !hasData ? (
        <div
          className={cn(
            height,
            "flex items-center justify-center rounded-xl bg-surface-2/60 px-6 text-center text-sm text-muted-foreground",
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        // Time runs left-to-right even in Arabic, so the chart keeps LTR axes.
        <div className={cn(height, "min-w-0")} dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={locale} data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(v: number) => valueFormatter(v)}
              />
              <Tooltip
                formatter={(value: number) => valueFormatter(value)}
                labelFormatter={(label: string) => formatDayLabel(label)}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 8px 24px -12px rgb(0 0 0 / 0.18)",
                }}
              />
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
