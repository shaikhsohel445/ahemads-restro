import { cn } from "@/lib/utils";

/** Page section with an optional eyebrow, title and lead paragraph. */
export function Section({
  id,
  eyebrow,
  title,
  body,
  children,
  className,
  tone = "default",
  align = "center",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
  tone?: "default" | "muted" | "dark";
  align?: "center" | "start";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-16 sm:py-24",
        tone === "muted" && "bg-[#F3EEE5]",
        tone === "dark" && "bg-[#0A3D31] text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(eyebrow || title || body) && (
          <div className={cn("mb-10 flex max-w-3xl flex-col gap-3 sm:mb-14", align === "center" && "mx-auto text-center")}>
            {eyebrow && (
              <p className={cn("text-sm font-semibold tracking-wide uppercase", tone === "dark" ? "text-[#E2C487]" : "text-primary")}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className={cn("text-3xl font-bold tracking-tight text-balance sm:text-4xl", tone !== "dark" && "text-foreground")}>
                {title}
              </h2>
            )}
            {body && (
              <p className={cn("text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-white/75" : "text-muted-foreground")}>
                {body}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
