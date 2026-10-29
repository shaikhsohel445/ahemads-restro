import type { Metadata } from "next";
import { ComplianceContent } from "./content";

// Kept at /docs/compliance-india so existing links keep working; for the
// Saudi Arabia edition this page now carries the Saudi VAT / ZATCA / PDPL
// notes. India GST/DPDP notes are out of scope for this edition.
export const metadata: Metadata = {
  title: "Saudi Arabia compliance notes — Ahemad's Restro",
  description:
    "How Ahemad's Restro handles Saudi VAT, ZATCA Phase 1 simplified tax invoices and QR codes, and what remains the operator's responsibility (Phase 2, PDPL). Not legal or tax advice.",
};

export default function ComplianceNotesPage() {
  return <ComplianceContent />;
}
