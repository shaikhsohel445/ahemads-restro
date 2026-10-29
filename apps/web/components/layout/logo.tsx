import { BRAND } from "@ahemads-restro/types";
import { cn } from "@/lib/utils";

/** The Ahemad's Restro brand mark (emerald tile with the cloche). */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    <img
      src={BRAND.assets.mark}
      alt={BRAND.productName}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

/** Full horizontal logo; `dark` for dark backgrounds. */
export function Wordmark({
  className,
  dark = false,
  height = 32,
}: {
  className?: string;
  dark?: boolean;
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    <img
      src={dark ? "/brand/logo-compact-dark.svg" : "/brand/logo-compact.svg"}
      alt={BRAND.productName}
      height={height}
      style={{ height, width: "auto" }}
      className={cn("shrink-0", className)}
    />
  );
}
