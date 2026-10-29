import type { Metadata } from "next";
import { DocsIndexContent } from "./content";

export const metadata: Metadata = {
  title: "Documentation — Ahemad's Restro",
  description:
    "API & MCP, accessibility, and Saudi Arabia VAT / ZATCA compliance notes for Ahemad's Restro.",
};

export default function DocsIndexPage() {
  return <DocsIndexContent />;
}
