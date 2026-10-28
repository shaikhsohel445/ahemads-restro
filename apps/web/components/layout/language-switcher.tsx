"use client";

import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES, LOCALE_LABELS, useI18n, type Locale } from "@/lib/i18n/context";

/** Small reusable language picker — used in the staff top bar, on the
 * sign-in/sign-up pages and on the guest-facing QR ordering page. Each
 * language is shown in its own script ("English", "العربية") so it can be
 * found whichever language is currently active. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <Select value={locale} onValueChange={(v) => v && setLocale(v as Locale)}>
      <SelectTrigger
        aria-label={t("common.language")}
        className={compact ? "h-8 w-auto gap-1.5 px-2 text-xs" : undefined}
      >
        {compact && <Languages className="h-3.5 w-3.5 shrink-0" />}
        <SelectValue>
          <span lang={locale}>{LOCALE_LABELS[locale]}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((code) => (
          <SelectItem key={code} value={code} lang={code}>
            {LOCALE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
