import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Building blocks shared by every settings screen so they read as one
// product: a section card (icon, title, one-line description, actions), a
// body of divided form rows, and a save bar that sticks to the bottom of the
// viewport while its section is on screen.
//
// Responsive rules: the settings content column is a `@container` (see
// settings/layout.tsx), so rows and lists switch layout on the width they
// actually get — not the viewport — which matters next to the sub-navigation.

export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}: {
  /** Anchor target for the sub-navigation (`/settings#printer`). */
  id?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons or a status pill on the inline-end side of the header. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-slot="card"
      className={cn(
        "min-w-0 scroll-mt-4 rounded-2xl border border-border/80 bg-card text-sm text-card-foreground",
        className,
      )}
    >
      <header className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground ring-1 ring-primary/10">
              <Icon className="size-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>
        )}
      </header>
      {children}
    </section>
  );
}

/** Padded section body; rows inside are separated by hairlines. */
export function SettingsBody({
  children,
  className,
  divided = true,
}: {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-t border-border/70 px-4 sm:px-6",
        divided ? "divide-y divide-border/70" : "flex flex-col gap-4 py-4 sm:py-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * One form row: label and help text, then the control. Stacked in narrow
 * columns; label on the inline-start side and control on the inline-end
 * side once the content column is wide enough.
 */
export function SettingsField({
  label,
  htmlFor,
  help,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  help?: React.ReactNode;
  /** Replaces the help text and turns it warning-coloured. */
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 py-4 @2xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] @2xl:gap-8 @2xl:py-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1 @2xl:pt-2">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        ) : (
          <span className="text-sm font-medium text-foreground">{label}</span>
        )}
        {(error || help) && (
          <p className={cn("hidden text-xs leading-relaxed @2xl:block", error ? "text-warning" : "text-muted-foreground")}>
            {error || help}
          </p>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {children}
        {(error || help) && (
          <p className={cn("text-xs leading-relaxed @2xl:hidden", error ? "text-warning" : "text-muted-foreground")}>
            {error || help}
          </p>
        )}
      </div>
    </div>
  );
}

/** A label + help text with a compact control (switch, button) always on the inline-end side. */
export function SettingsRow({
  label,
  htmlFor,
  help,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  help?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-4 @2xl:py-5", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        ) : (
          <span className="text-sm font-medium text-foreground">{label}</span>
        )}
        {help && <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{help}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-0.5">{children}</div>
    </div>
  );
}

/** Small uppercase heading that starts a group of rows inside a section body. */
export function SettingsGroupTitle({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 pt-6 pb-1">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

/**
 * Footer with the section's primary action. Sticks to the bottom of the
 * scrolling page while its section is visible — above the floating tab bar
 * on phones/tablets.
 */
export function SaveBar({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  /** Short text on the inline-start side ("Applies to this branch"). */
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-border/70 bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:px-6 lg:bottom-0",
        className,
      )}
    >
      {hint && <p className="me-auto min-w-0 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

/** Tinted note inside a section (info, warning, legal disclaimers). */
export function SettingsCallout({
  icon: Icon,
  tone = "neutral",
  title,
  children,
  className,
  role,
}: {
  icon?: LucideIcon;
  tone?: "neutral" | "info" | "warning" | "danger" | "gold" | "success";
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  role?: string;
}) {
  const toneClass = {
    neutral: "bg-surface-2 ring-border/70 [&_[data-icon]]:text-muted-foreground",
    info: "bg-status-info-soft ring-status-info/15 [&_[data-icon]]:text-status-info",
    warning: "bg-status-warning-soft ring-status-warning/20 [&_[data-icon]]:text-status-warning",
    danger: "bg-status-danger-soft ring-status-danger/20 [&_[data-icon]]:text-status-danger",
    gold: "bg-status-gold-soft ring-status-gold/20 [&_[data-icon]]:text-status-gold",
    success: "bg-status-success-soft ring-status-success/20 [&_[data-icon]]:text-status-success",
  }[tone];
  return (
    <div role={role} className={cn("flex gap-3 rounded-xl p-3.5 text-sm ring-1 sm:p-4", toneClass, className)}>
      {Icon && <Icon data-icon className="mt-0.5 size-4 shrink-0" />}
      <div className="flex min-w-0 flex-col gap-1 text-muted-foreground">
        {title && <p className="font-medium text-foreground">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/**
 * Table on wide content columns, card list on narrow ones. Pass both
 * renderings; only one is visible at a time.
 */
export function ResponsiveList({ table, cards }: { table: React.ReactNode; cards: React.ReactNode }) {
  return (
    <>
      <SettingsTableFrame className="hidden overflow-hidden @2xl:block [&:nth-last-child(2)]:rounded-b-2xl">{table}</SettingsTableFrame>
      <div className="flex flex-col gap-2 border-t border-border/70 p-3 sm:p-4 @2xl:hidden">{cards}</div>
    </>
  );
}

/** One item of the phone card list. */
export function ListCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5", className)}>
      {children}
    </div>
  );
}

/**
 * Edge-to-edge table styling for a list inside a section: recessed header,
 * roomier cells, padding that lines up with the section header.
 */
export function SettingsTableFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-border/70",
        "[&_[data-slot=table-header]]:bg-surface-2/70 [&_[data-slot=table-head]]:h-10 [&_[data-slot=table-head]]:px-3 [&_[data-slot=table-head]]:text-xs [&_[data-slot=table-head]]:font-medium [&_[data-slot=table-head]]:text-muted-foreground",
        "[&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-cell]]:py-3 [&_[data-slot=table-row]]:border-border/70",
        "[&_td:first-child]:ps-4 [&_th:first-child]:ps-4 [&_td:last-child]:pe-4 [&_th:last-child]:pe-4 sm:[&_td:first-child]:ps-6 sm:[&_th:first-child]:ps-6 sm:[&_td:last-child]:pe-6 sm:[&_th:last-child]:pe-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Padded wrapper for the phone card list / empty state / skeletons. */
export function SettingsListBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-t border-border/70 p-4 sm:p-6", className)}>{children}</div>;
}
