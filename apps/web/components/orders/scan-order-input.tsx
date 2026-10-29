"use client";

import { ScanLine } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { openEntity } from "@/lib/entity-events";
import { useI18n } from "@/lib/i18n/context";
import { normalizeScan } from "@/lib/scan";
import { cn } from "@/lib/utils";

const TABS = ["pending", "active", "history"] as const;

// Find an order by scanning the QR on a kiosk ticket (or typing its number).
// A USB "keyboard wedge" scanner just types the code then presses Enter, so a
// plain focused text field is the whole integration: no scanner SDK, no
// camera API. Typing the number by hand works identically, which is the
// manual fallback. This only OPENS the order; it never changes it or marks it
// paid - payment stays a separate, deliberate action in the order window.
export function ScanOrderInput({ branchId, className }: { branchId: string | null; className?: string }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async () => {
    const scan = normalizeScan(value);
    if (scan.kind === "invalid" && scan.reason === "empty") return;
    if (scan.kind === "table") {
      setMessage(t("orders.scan.tableQr"));
      return;
    }
    if (scan.kind !== "order") {
      setMessage(t("orders.scan.unrecognized"));
      return;
    }
    if (!branchId) return;
    setBusy(true);
    setMessage(null);
    try {
      const lists = await Promise.all(
        TABS.map((tab) =>
          api.get<{ id: string; orderNumber: string }[]>(
            `/orders/manage?branchId=${encodeURIComponent(branchId)}&tab=${tab}`,
          ),
        ),
      );
      const hit = lists.flat().find((o) => o.orderNumber.toUpperCase() === scan.orderNumber);
      if (hit) {
        openEntity("Order", hit.id);
        setValue("");
      } else {
        setMessage(t("orders.scan.notFound", { number: scan.orderNumber }));
      }
    } catch {
      setMessage(t("orders.scan.lookupFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={cn("flex w-full max-w-md flex-col gap-1", className)}
      onSubmit={(e) => {
        e.preventDefault();
        void lookup();
      }}
    >
      <label htmlFor="scan-order" className="sr-only">
        {t("orders.scan.label")}
      </label>
      <div className="relative">
        <ScanLine
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="scan-order"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setMessage(null);
          }}
          disabled={busy}
          placeholder={t("orders.scan.placeholder")}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-11 rounded-xl bg-card ps-9"
        />
      </div>
      <p className={cn("text-xs text-muted-foreground", !message && "sr-only")} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
