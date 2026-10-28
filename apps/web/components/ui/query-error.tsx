"use client";

import { RefreshCw } from "lucide-react";
import { ApiError } from "@/lib/api";
import { translate } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Plain-language reason a request failed, naming a permission problem as one. */
export function describeLoadError(error: unknown, what: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return translate("errors.load.session", { what });
    if (error.status === 403) return translate("errors.load.forbidden", { what });
    if (error.status >= 500) return translate("errors.load.server", { what });
    return error.message || translate("errors.load.generic", { what });
  }
  return translate("errors.load.network", { what });
}

// Shown in place of a list/grid whose request failed, so a failure is never
// mistaken for "nothing here yet". Always offers a retry.
export function QueryError({
  error,
  what,
  onRetry,
  retrying = false,
  className,
}: {
  error: unknown;
  what: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center",
        className,
      )}
    >
      <p className="max-w-sm text-sm text-foreground">{describeLoadError(error, what)}</p>
      <Button type="button" variant="outline" className="h-11 px-4" disabled={retrying} onClick={onRetry}>
        <RefreshCw className={cn("h-4 w-4", retrying && "animate-spin")} aria-hidden />
        {translate(retrying ? "errors.load.retrying" : "errors.load.retry")}
      </Button>
    </div>
  );
}
