"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: LucideIcon;
  /** Small count bubble, e.g. tickets in a column or orders in a filter. */
  count?: number;
}

/**
 * Pill segmented control for filters, order types and views. Scrolls
 * sideways on narrow screens instead of wrapping; `stretch` makes the
 * segments share the full width (good for 2–3 options in a panel).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "default",
  stretch = false,
  className,
  "aria-label": ariaLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "default" | "lg";
  stretch?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1 ring-1 ring-border/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        stretch ? "w-full" : "w-fit",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 font-medium whitespace-nowrap transition-all",
              size === "sm" && "h-8 text-xs",
              size === "default" && "h-9 text-sm",
              size === "lg" && "h-11 px-4 text-[0.95rem]",
              stretch && "flex-1",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className={cn("shrink-0", size === "sm" ? "size-3.5" : "size-4")} />}
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 tabular-nums",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
