// Per-kiosk web app manifest so the browser's "Add to Home screen" / install
// creates a shortcut that opens THIS kiosk URL full-screen in landscape. It
// is a PWA/browser shortcut only: there is no APK and no Play Store listing.

import { KIOSK_DEFAULT_LOCALE } from "@/components/kiosk/kiosk-locales";
import { MESSAGES } from "@/lib/i18n/messages";

const TOKEN = /^[a-f0-9]{32}$/;
const text = (key: string) => MESSAGES[KIOSK_DEFAULT_LOCALE][key] ?? MESSAGES.en[key] ?? key;

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN.test(token)) return new Response("Not found", { status: 404 });
  const base = `/kiosk/${token}`;
  const manifest = {
    id: base,
    name: text("kiosk.app.name"),
    short_name: text("kiosk.app.name"),
    description: text("kiosk.app.description"),
    start_url: base,
    scope: `${base}`,
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "landscape",
    background_color: "#fbf9f8",
    theme_color: "#0b5d4a",
    lang: KIOSK_DEFAULT_LOCALE,
    dir: "auto",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache",
    },
  });
}
