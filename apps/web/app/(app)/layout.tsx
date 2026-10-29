import type { Metadata, Viewport } from "next";
import { BRAND } from "@ahemads-restro/types";
import { AppProviders } from "@/components/providers/app-providers";
import { LOCALE_BOOTSTRAP_SCRIPT } from "@/lib/i18n/locales";
import { FONT_VARIABLES } from "@/lib/fonts";
import "../globals.css";

// The signed-in application, guest QR/kiosk pages and sign-in screens are
// not for search engines (the public marketing site lives in app/(site)).
// Icons come from the app/ metadata files (icon.svg, favicon.ico,
// apple-icon.png) and the manifest from app/manifest.ts.
export const metadata: Metadata = {
  title: { default: BRAND.productName, template: `%s · ${BRAND.productName}` },
  description: BRAND.description,
  applicationName: BRAND.productName,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b5d4a",
  // Lets the bottom nav / sheets sit inside the notch + home-indicator safe areas.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${FONT_VARIABLES} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets lang/dir from the saved language before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
