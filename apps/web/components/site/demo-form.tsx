"use client";

import { demoRequestSchema } from "@ahemads-restro/types";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { track } from "./analytics";

export interface DemoFormCopy {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  branches: string;
  branchOptions: Record<"1" | "2-5" | "6-20" | "21+", string>;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
  errorRate: string;
  errorInvalid: string;
  privacy: string;
  required: string;
}

type Status = "idle" | "sending" | "sent" | "error";

// Posts to POST /api/v1/public/demo-requests (same origin). "Sent" is shown
// only after the API confirms it stored the request.
export function DemoForm({ copy, lang, privacyHref }: { copy: DemoFormCopy; lang: "en" | "ar"; privacyHref: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const parsed = demoRequestSchema.safeParse({ ...payload, locale: lang });
    if (!parsed.success) {
      const bad: Record<string, boolean> = {};
      for (const issue of parsed.error.issues) bad[String(issue.path[0])] = true;
      setFieldErrors(bad);
      setError(copy.errorInvalid);
      setStatus("error");
      return;
    }
    setFieldErrors({});
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/v1/public/demo-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 429) throw new Error(copy.errorRate);
      if (res.status === 400) throw new Error(copy.errorInvalid);
      if (!res.ok) throw new Error(copy.errorGeneric);
      setStatus("sent");
      track("generate_lead", { form: "demo_request", branches: parsed.data.branches });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-[#BFE3D3] bg-[#E8F5EF] p-8 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <p className="text-lg font-semibold text-foreground">{copy.successTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{copy.successBody}</p>
      </div>
    );
  }

  const field = "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive";
  const label = "flex flex-col gap-1.5 text-sm font-medium text-foreground";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <label className={label}>
        <span>{copy.name} <span aria-hidden className="text-destructive">*</span></span>
        <input name="name" autoComplete="name" required maxLength={100} aria-invalid={fieldErrors.name || undefined} className={field} />
      </label>
      <label className={label}>
        <span>{copy.company} <span aria-hidden className="text-destructive">*</span></span>
        <input name="company" autoComplete="organization" required maxLength={150} aria-invalid={fieldErrors.company || undefined} className={field} />
      </label>
      <label className={label}>
        <span>{copy.email} <span aria-hidden className="text-destructive">*</span></span>
        <input name="email" type="email" autoComplete="email" dir="ltr" required maxLength={200} aria-invalid={fieldErrors.email || undefined} className={field} />
      </label>
      <label className={label}>
        <span>{copy.phone} <span aria-hidden className="text-destructive">*</span></span>
        <input name="phone" type="tel" autoComplete="tel" dir="ltr" required maxLength={30} aria-invalid={fieldErrors.phone || undefined} className={field} />
      </label>
      <label className={label}>
        <span>{copy.country} <span aria-hidden className="text-destructive">*</span></span>
        <input name="country" autoComplete="country-name" required maxLength={80} aria-invalid={fieldErrors.country || undefined} className={field} />
      </label>
      <label className={label}>
        <span>{copy.branches} <span aria-hidden className="text-destructive">*</span></span>
        <select name="branches" required defaultValue="1" className={field}>
          {(Object.keys(copy.branchOptions) as (keyof DemoFormCopy["branchOptions"])[]).map((k) => (
            <option key={k} value={k}>{copy.branchOptions[k]}</option>
          ))}
        </select>
      </label>
      <label className={`${label} sm:col-span-2`}>
        <span>{copy.message}</span>
        <textarea name="message" rows={4} maxLength={2000} placeholder={copy.messagePlaceholder} className={`${field} h-auto py-2.5`} />
      </label>
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        {status === "error" && (
          <p role="alert" className="rounded-xl bg-[#FCEBE2] px-3 py-2 text-sm text-[#9A3412]">{error}</p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4 rtl:-scale-x-100" aria-hidden />}
          {status === "sending" ? copy.sending : copy.submit}
        </button>
        <p className="text-xs text-muted-foreground">
          {copy.required}{" "}
          <a href={privacyHref} className="underline underline-offset-2">{copy.privacy}</a>
        </p>
      </div>
    </form>
  );
}
