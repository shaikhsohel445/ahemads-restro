import type { Metadata } from "next";
import { DocsIndexContent } from "./content";

export const metadata: Metadata = {
  title: "Documentation — Nodedr OrderRestro",
  description:
    "API & MCP, accessibility, and Saudi Arabia VAT / ZATCA compliance notes for Nodedr OrderRestro.",
};

export default function DocsIndexPage() {
  return <DocsIndexContent />;
}
