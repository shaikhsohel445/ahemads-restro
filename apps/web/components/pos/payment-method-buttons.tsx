"use client";

import {
  Banknote,
  Building2,
  CreditCard,
  Gift,
  QrCode,
  Smartphone,
  SmartphoneNfc,
  Undo2,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Labels come from common.paymentMethod.<METHOD> at render time.
const ICONS: Record<string, LucideIcon> = {
  CASH: Banknote,
  CARD: CreditCard,
  MADA: WalletCards,
  STC_PAY: Smartphone,
  APPLE_PAY: SmartphoneNfc,
  UPI: QrCode,
  WALLET: Wallet,
  BANK_TRANSFER: Building2,
  GIFT_CARD: Gift,
  STORE_CREDIT: Undo2,
  OTHER: Wallet,
};

// One-tap payment method picker (replaces the dropdowns): big icon buttons
// that are quick to hit on a touch screen and show every choice at once.
export function PaymentMethodButtons<T extends string>({
  methods,
  value,
  onChange,
  label,
}: {
  methods: readonly T[];
  value: T;
  onChange: (m: T) => void;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "grid gap-2",
        methods.length > 4 ? "grid-cols-3" : "grid-cols-4",
        // Roomier panels (the POS order panel) fit four tiles per row.
        methods.length > 4 && "@[22rem]:grid-cols-4",
      )}
      role="radiogroup"
      aria-label={label ?? t("pos.paymentMethod")}
    >
      {methods.map((m) => {
        const Icon = ICONS[m] ?? Wallet;
        const text = ICONS[m] ? t(`common.paymentMethod.${m}`) : m;
        const active = value === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className={cn(
              "relative flex min-h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-xs font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
              active
                ? "border-primary bg-accent text-accent-foreground shadow-sm ring-1 ring-primary/30"
                : "border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-surface-2",
              )}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="max-w-full truncate">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
