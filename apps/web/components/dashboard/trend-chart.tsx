"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

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
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: Record<string, string | number>[];
  valueKey: string;
  color: string;
  valueFormatter: (value: number) => string;
  isLoading: boolean;
  emptyMessage: string;
}) {
  const hasData = data.some((d) => Number(d[valueKey]) > 0);
  // Re-render the chart when the UI language changes (tick labels).
  const { locale } = useI18n();

  return (
    <Card className="flex flex-col gap-3 p-6">
      <h2 className="flex items-center gap-2 text-[18px] font-medium text-foreground">
        <Icon className="h-[18px] w-[18px] text-muted-foreground" />
        {title}
      </h2>

      {isLoading ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : !hasData ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        // Time runs left-to-right even in Arabic, so the chart keeps LTR axes.
        <div className="h-56" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart key={locale} data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(v: number) => valueFormatter(v)}
              />
              <Tooltip
                formatter={(value: number) => valueFormatter(value)}
                labelFormatter={(label: string) => formatDayLabel(label)}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
