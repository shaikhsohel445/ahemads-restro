"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function MobileNav({
  links,
  label,
  switchHref,
  switchLabel,
  switchLang,
  signIn,
}: {
  links: { href: string; label: string }[];
  label: string;
  switchHref: string;
  switchLabel: string;
  switchLang: string;
  signIn: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-xl text-foreground hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav
          id="site-mobile-nav"
          aria-label={label}
          className="absolute inset-x-0 top-16 border-b border-border bg-background px-4 pb-5 pt-2 shadow-lg"
        >
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex h-12 items-center rounded-xl px-3 text-[15px] font-medium hover:bg-muted">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2 border-t border-border pt-4">
            <Link href={switchHref} hrefLang={switchLang} lang={switchLang} className="flex h-11 flex-1 items-center justify-center rounded-xl border border-border font-medium">
              {switchLabel}
            </Link>
            <Link href="/login" className="flex h-11 flex-1 items-center justify-center rounded-xl border border-border font-medium">
              {signIn}
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
