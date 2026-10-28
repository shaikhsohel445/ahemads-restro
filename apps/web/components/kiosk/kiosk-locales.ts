import type { Locale } from "@/lib/i18n/locales";

// Kiosk languages (Saudi edition): Arabic first, English as the second
// language. Every new customer starts in KIOSK_DEFAULT_LOCALE (the page pins
// it with <I18nProvider fixedLocale> and an idle/new-order reset returns to
// it), so one guest's pick never sticks for the next. Spanish and French have
// kiosk copy too and can be added to KIOSK_LOCALES for other markets.
// No "use client": the manifest route and layout metadata read these too.
export const KIOSK_DEFAULT_LOCALE: Locale = "ar";
export const KIOSK_LOCALES: Locale[] = ["ar", "en"];
