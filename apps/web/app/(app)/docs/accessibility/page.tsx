import type { Metadata } from "next";
import { AccessibilityContent } from "./content";

export const metadata: Metadata = {
  title: "Accessibility statement — Ahemad's Restro",
  description: "Ahemad's Restro's accessibility conformance target, testing methodology, and known gaps.",
};

export default function AccessibilityPage() {
  return <AccessibilityContent />;
}
