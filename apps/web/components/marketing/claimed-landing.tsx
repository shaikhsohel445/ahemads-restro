"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

// Shown at "/" once a restaurant is already registered on this deployment
// (see useSetupStatus / MarketingHomePage) — a returning staff member should
// get to Sign in fast, with a way to reach the docs, not a repeat of the
// product's own sales page.
export function ClaimedLanding() {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <div className="absolute end-4 top-4 sm:end-6">
        <LanguageSwitcher compact />
      </div>
      <Logo size={44} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        {t("landing.brandFull")}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("landing.claimed.body")}</p>
      <div className="mt-8 flex items-center gap-3">
        <Button size="lg" render={<Link href="/login" />}>
          {t("landing.cta.signIn")}
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/docs" />}>
          {t("landing.claimed.viewDocs")}
        </Button>
      </div>
    </div>
  );
}
