import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral" | "gold";

export const TONE_SOFT: Record<Tone, string> = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-status-success-soft text-status-success",
  warning: "bg-status-warning-soft text-status-warning",
  danger: "bg-status-danger-soft text-status-danger",
  info: "bg-status-info-soft text-status-info",
  neutral: "bg-status-neutral-soft text-status-neutral",
  gold: "bg-status-gold-soft text-status-gold",
};

/** KPI tile: label, big tabular value, optional icon, hint and tone. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className,
  onClick,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-slot="card"
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 text-start sm:p-5",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", TONE_SOFT[tone])}>
            <Icon className="size-[18px]" />
          </span>
        )}
      </div>
      <div className="truncate text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-[28px]">
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </Comp>
  );
}
