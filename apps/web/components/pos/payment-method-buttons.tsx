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
      className={cn("grid gap-2", methods.length > 4 ? "grid-cols-3" : "grid-cols-4")}
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
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-foreground shadow-sm"
                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {text}
          </button>
        );
      })}
    </div>
  );
}
