import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/config";

// Crawl the public site; keep crawlers out of the API and the signed-in app
// (those pages also send noindex). Guest QR and kiosk links are per-table /
// per-device tokens and must not be indexed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en", "/ar"],
        disallow: [
          "/api/",
          "/dashboard",
          "/pos",
          "/orders",
          "/tables",
          "/reservations",
          "/kds",
          "/menu",
          "/customers",
          "/inventory",
          "/delivery",
          "/team",
          "/accounting",
          "/reports",
          "/marketing",
          "/operations",
          "/attendance",
          "/settings",
          "/login",
          "/signup",
          "/order/",
          "/kiosk/",
          "/customer-display",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
