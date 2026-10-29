import type { Tone } from "@/components/ui/stat-card";
import type {
  PurchaseOrder,
  PurchaseRequest,
  SupplierInvoice,
  SupplierQuotation,
} from "@/hooks/use-inventory";

/** One colour per procurement status, shared by lists and detail pages. */
export const PO_STATUS_TONE: Record<PurchaseOrder["status"], Tone> = {
  DRAFT: "neutral",
  SENT: "info",
  PARTIALLY_RECEIVED: "warning",
  RECEIVED: "success",
  CANCELLED: "danger",
};

export const PR_STATUS_TONE: Record<PurchaseRequest["status"], Tone> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CONVERTED: "info",
};

export const QUOTATION_STATUS_TONE: Record<SupplierQuotation["status"], Tone> = {
  DRAFT: "neutral",
  RECEIVED: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
};

export const INVOICE_STATUS_TONE: Record<SupplierInvoice["status"], Tone> = {
  UNPAID: "warning",
  PARTIALLY_PAID: "info",
  PAID: "success",
  CANCELLED: "neutral",
};
