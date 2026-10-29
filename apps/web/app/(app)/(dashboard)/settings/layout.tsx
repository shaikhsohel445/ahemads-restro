"use client";

import { Settings } from "lucide-react";
import { SettingsNav } from "@/components/settings/settings-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/lib/i18n/context";

// Shared frame for every settings screen: page header, then a sticky
// inline-start sub-navigation next to the content on desktop, or a
// horizontally scrolling section bar above it on phones and tablets.
// The content column is a size container so sections can switch between
// table/card and split/stacked layouts on the width they really get.
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-5 lg:gap-8">
      <PageHeader icon={Settings} title={t("settings.title")} description={t("settings.subtitle")} />
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-7.5rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
          <SettingsNav />
        </aside>
        <div className="@container flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
