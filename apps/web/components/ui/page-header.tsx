import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard page heading: icon tile, title, one-line description, actions on
 * the inline-end side (wrapping under the title on phones), and an optional
 * row below for tabs or filters. Every dashboard page starts with one.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  /** Tabs, filters or a segmented control shown under the title row. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground ring-1 ring-primary/10 sm:flex">
              <Icon className="size-5" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>
        )}
      </div>
      {children}
    </header>
  );
}
