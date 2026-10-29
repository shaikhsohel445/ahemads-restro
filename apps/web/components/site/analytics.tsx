"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

// Privacy-first analytics: nothing loads until the visitor accepts, and only
// when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured. The choice is stored in
// localStorage. `track()` sends conversion events (demo requests, CTA clicks)
// only after consent; before that it does nothing.

const CONSENT_KEY = "ar-analytics-consent";
type Consent = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function Analytics({
  gaId,
  copy,
  privacyHref,
}: {
  gaId: string;
  copy: { text: string; accept: string; decline: string; policy: string };
  privacyHref: string;
}) {
  const [consent, setConsent] = useState<Consent>("denied");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved choice after hydration
    setConsent(readConsent());
    setReady(true);
  }, []);

  if (!gaId) return null;

  const choose = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // not persisted; applies to this visit
    }
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {ready && consent === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={copy.policy}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-xl sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-muted-foreground">
            {copy.text}{" "}
            <Link href={privacyHref} className="font-medium text-primary underline underline-offset-4">
              {copy.policy}
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => choose("denied")} className="h-10 rounded-xl border border-border px-4 font-medium hover:bg-muted">
              {copy.decline}
            </button>
            <button type="button" onClick={() => choose("granted")} className="h-10 rounded-xl bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90">
              {copy.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Anchor that also records a CTA click (when analytics consent exists). */
export function TrackedLink({
  href,
  event,
  className,
  children,
  external = false,
}: {
  href: string;
  event: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track("cta_click", { cta: event })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
