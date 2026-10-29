import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

// Shared by both root layouts (the app and the public site). Self-hosted by
// next/font at build time: no request to Google from visitors' browsers.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic UI text, menu items and customer names (see globals.css :lang(ar)).
export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const FONT_VARIABLES = `${geistSans.variable} ${geistMono.variable} ${plexArabic.variable}`;
