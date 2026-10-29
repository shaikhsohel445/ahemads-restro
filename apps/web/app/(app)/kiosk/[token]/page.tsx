"use client";

import { use } from "react";
import { KioskApp } from "@/components/kiosk/kiosk-app";
import { KIOSK_DEFAULT_LOCALE } from "@/components/kiosk/kiosk-locales";
import { I18nProvider } from "@/lib/i18n/context";

export default function KioskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  // Pinned to the kiosk's default language (Arabic) and independent of the
  // staff UI's saved language; guests switch with the on-screen buttons.
  return (
    <I18nProvider fixedLocale={KIOSK_DEFAULT_LOCALE}>
      <KioskApp token={token} />
    </I18nProvider>
  );
}
