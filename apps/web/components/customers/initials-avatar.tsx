import { cn } from "@/lib/utils";

// Soft, token-based backgrounds so avatars stay calm on the sand background
// and adapt to dark mode. Picked deterministically from the name.
const PALETTE = [
  "bg-accent text-accent-foreground",
  "bg-status-gold-soft text-status-gold",
  "bg-status-info-soft text-status-info",
  "bg-status-success-soft text-status-success",
  "bg-status-warning-soft text-status-warning",
  "bg-status-neutral-soft text-status-neutral",
];

export function initialsOf(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = Array.from(parts[0])[0] ?? "";
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Round avatar with up to two initials on a soft tone derived from the name (or a stable id). */
export function InitialsAvatar({
  name,
  seed,
  size = "md",
  className,
}: {
  name?: string | null;
  /** Stable key for the colour when the name is empty or shared (e.g. the record id). */
  seed?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const tone = PALETTE[hash(seed ?? name ?? "") % PALETTE.length];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        size === "xl" && "size-16 text-xl",
        tone,
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
