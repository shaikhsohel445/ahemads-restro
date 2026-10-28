import type { Metadata } from "next";
import { ApiDocsContent } from "./content";

export const metadata: Metadata = {
  title: "API & MCP — Nodedr OrderRestro",
  description:
    "The OrderRestro REST API reference (Swagger at /api/docs), cookie and API-key authentication, the MCP server, and the Integration API for your own website.",
};

export default function ApiDocsPage() {
  return <ApiDocsContent />;
}
