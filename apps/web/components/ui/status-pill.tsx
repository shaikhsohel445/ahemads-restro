import { cn } from "@/lib/utils";
import type { Tone } from "./stat-card";
import { TONE_SOFT } from "./stat-card";

const DOT: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info",
  neutral: "bg-status-neutral",
  gold: "bg-status-gold",
};

/** Rounded status label with a coloured dot — orders, tables, tickets, stock. */
export function StatusPill({
  tone = "neutral",
  children,
  pulse = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  /** Animate the dot for states that need attention (new ticket, waiting). */
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        TONE_SOFT[tone],
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {pulse && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-70", DOT[tone])} />}
        <span className={cn("relative inline-flex size-1.5 rounded-full", DOT[tone])} />
      </span>
      {children}
    </span>
  );
}

/** Shared status → tone maps so every screen colours the same state the same way. */
export const ORDER_STATUS_TONE: Record<string, Tone> = {
  OPEN: "info",
  BILLED: "gold",
  PAID: "success",
  CANCELLED: "neutral",
};
export const TABLE_STATUS_TONE: Record<string, Tone> = {
  AVAILABLE: "success",
  OCCUPIED: "warning",
  RESERVED: "info",
  CLEANING: "neutral",
  OUT_OF_SERVICE: "neutral",
};
export const KOT_STATUS_TONE: Record<string, Tone> = {
  NEW: "gold",
  ACCEPTED: "info",
  PREPARING: "warning",
  READY: "success",
  SERVED: "neutral",
  REJECTED: "danger",
  CANCELLED: "neutral",
};
