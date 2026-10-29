import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@ahemads-restro/types";
import { Analytics } from "@/components/site/analytics";
import { JsonLd } from "@/components/site/json-ld";
import { COMMON } from "@/content/site/common";
import { FONT_VARIABLES } from "@/lib/fonts";
import { DIR, GA_ID, SITE_LOCALES, isSiteLocale, sitePath } from "@/lib/site/config";
import { organizationLd, websiteLd } from "@/lib/site/jsonld";
import "../../globals.css";

// Root layout of the public marketing site (/en/…, /ar/…). Server-rendered
// <html lang dir> per language, so crawlers and screen readers get the right
// language without JavaScript. The restaurant app has its own root layout
// in app/(app).
export function generateStaticParams() {
  return SITE_LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: BRAND.colors.emerald,
  colorScheme: "light",
};

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSiteLocale(lang)) notFound();
  return (
    <html lang={lang} dir={DIR[lang]} className={`${FONT_VARIABLES} antialiased`}>
      <body className="min-h-screen bg-background text-foreground [background-image:none]">
        <JsonLd data={[organizationLd(), websiteLd(lang)]} />
        {children}
        <Analytics gaId={GA_ID} copy={COMMON[lang].cookie} privacyHref={sitePath(lang, "/privacy")} />
      </body>
    </html>
  );
}
