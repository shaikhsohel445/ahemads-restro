"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/context";

type Status = "new" | "preparing" | "ready";

const statusColor: Record<Status, string> = {
  new: "bg-warning/15 text-warning",
  preparing: "bg-primary/15 text-primary",
  ready: "bg-success/15 text-success",
};

// A stylized, illustrative mockup of the KDS/POS surface — not a screenshot
// of a real customer's data, drawn purely from this app's own UI language
// (see DESIGN_SYSTEM.md) so the hero has something concrete to show without
// implying a claim about a specific deployment. Labels are translated; the
// layout mirrors with the page direction.
export function PosMockup() {
  const { t, dir } = useI18n();

  const tickets: { id: string; table: string; items: string[]; status: Status }[] = [
    {
      id: "t4",
      table: t("landing.mockup.table", { n: 4 }),
      items: [t("landing.mockup.item.kabsa"), t("landing.mockup.item.laban")],
      status: "preparing",
    },
    {
      id: "t9",
      table: t("landing.mockup.table", { n: 9 }),
      items: [t("landing.mockup.item.shawarma"), t("landing.mockup.item.hummus")],
      status: "ready",
    },
    {
      id: "ta182",
      table: t("landing.mockup.takeaway", { n: 182 }),
      items: [t("landing.mockup.item.coffee")],
      status: "new",
    },
  ];

  const statusLabel: Record<Status, string> = {
    new: t("landing.mockup.status.new"),
    preparing: t("landing.mockup.status.preparing"),
    ready: t("landing.mockup.status.ready"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative mx-auto w-full max-w-2xl"
      aria-hidden
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_20px_70px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/50" />
          <span className="size-2.5 rounded-full bg-warning/50" />
          <span className="size-2.5 rounded-full bg-success/50" />
          <span className="ms-3 text-xs font-medium text-muted-foreground">
            {t("landing.mockup.title")}
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{ticket.table}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[ticket.status]}`}
                >
                  {statusLabel[ticket.status]}
                </span>
              </div>
              <ul className="flex flex-col gap-1">
                {ticket.items.map((it) => (
                  <li key={it} className="text-xs text-muted-foreground">
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating KPI card — pure decoration, positioned to read as a
          companion dashboard glance, not a data claim. It slides in from
          the inline-end side, so the offset flips in RTL. */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -16 : 16, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -end-4 -bottom-6 hidden w-40 rounded-xl border border-border/60 bg-card p-3 shadow-lg sm:block"
      >
        <p className="text-[11px] font-medium text-muted-foreground">
          {t("landing.mockup.occupancy")}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">72%</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "72%" }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
