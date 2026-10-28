"use client";

// Client-side i18n: a locale is a piece of client state, persisted to
// localStorage, with a dictionary lookup per namespace (./messages.ts). The
// dashboard is a client-rendered app, so there is no locale routing.
//
// Arabic (2026, Saudi edition): switching to "ar" also sets
// <html lang="ar" dir="rtl">, so every layout built with logical utilities
// (ms-/me-/ps-/pe-/start-/end-, text-start/end) mirrors automatically, and
// it updates the defaults used by formatCurrency/formatDateTime.
//
// Usage: const { t } = useI18n(); t("<namespace>.<key>", { n: 3 }).
// Outside React (mutation toasts in hooks, lib code): translate("…").

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setFormatLocale } from "@/lib/format";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  intlLocaleTag,
  isLocale,
  localeDir,
  type Locale,
} from "./locales";
import { MESSAGES } from "./messages";

type Vars = Record<string, string | number>;

let currentLocale: Locale = DEFAULT_LOCALE;

function lookup(locale: Locale, key: string, vars?: Vars): string {
  const template = MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

/** Translate outside React (e.g. toast text inside a mutation hook). */
export function translate(key: string, vars?: Vars): string {
  return lookup(currentLocale, key, vars);
}

export function currentUiLocale(): Locale {
  return currentLocale;
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  for (const lang of navigator.languages ?? [navigator.language]) {
    const short = lang.slice(0, 2).toLowerCase();
    if (isLocale(short)) return short;
  }
  return DEFAULT_LOCALE;
}

interface I18nContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  fixedLocale,
}: {
  children: React.ReactNode;
  /**
   * Pins the starting language and never reads or writes the saved choice or
   * the browser language — for a shared public screen (the kiosk), where one
   * customer's language pick must not leak into the staff UI or stick for the
   * next customer.
   */
  fixedLocale?: Locale;
}) {
  // Starts at the fixed default on both server and first client render
  // (so hydration matches), then swaps to the saved/browser locale right
  // after mount.
  const [locale, setLocaleState] = useState<Locale>(fixedLocale ?? DEFAULT_LOCALE);

  useEffect(() => {
    if (fixedLocale) return;
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(isLocale(saved) ? saved : detectBrowserLocale());
  }, [fixedLocale]);

  // Keep <html lang/dir> and the formatting defaults in step with the locale.
  useEffect(() => {
    currentLocale = locale;
    setFormatLocale(intlLocaleTag(locale));
    const root = document.documentElement;
    root.lang = locale;
    root.dir = localeDir(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (!fixedLocale) localStorage.setItem(LOCALE_STORAGE_KEY, next);
      setLocaleState(next);
    },
    [fixedLocale],
  );

  const t = useCallback((key: string, vars?: Vars) => lookup(locale, key, vars), [locale]);

  const value = useMemo(
    () => ({ locale, dir: localeDir(locale), setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LOCALES, LOCALE_LABELS } from "./locales";
export type { Locale } from "./locales";
