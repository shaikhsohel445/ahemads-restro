import type { MetadataRoute } from "next";
import { BRAND } from "@ahemads-restro/types";

// Web app manifest (served at /manifest.webmanifest) for installing the
// restaurant app on tablets and phones. Kiosks get their own per-token
// manifest (app/(app)/kiosk/[token]/manifest.webmanifest).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.productName,
    short_name: BRAND.shortName,
    description: BRAND.description,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: BRAND.colors.sand,
    theme_color: BRAND.colors.emerald,
    lang: "en",
    dir: "auto",
    categories: ["business", "food", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
