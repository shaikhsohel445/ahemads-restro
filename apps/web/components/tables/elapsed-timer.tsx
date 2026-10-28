"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

function formatElapsed(ms: number, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return t("tables.elapsedHm", { h: hours, m: minutes });
  return t("tables.elapsedM", { m: minutes });
}

/**
 * Live "how long has this table been in its current state" badge — counts
 * up from `statusSince` (set server-side the moment a table's status last
 * changed, see Table.statusSince in schema.prisma). Ticks once a minute:
 * a floor/POS glance doesn't need second-level precision, and a slower
 * interval means many tiles on screen at once don't all restart timers
 * needlessly often.
 */
export function ElapsedTimer({ since, className }: { since: string; className?: string }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const elapsed = now - new Date(since).getTime();

  return (
    <span className={className}>
      <Clock className="h-3 w-3" />
      <bdi>{formatElapsed(elapsed, t)}</bdi>
    </span>
  );
}
