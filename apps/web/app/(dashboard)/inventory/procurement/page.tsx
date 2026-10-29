"use client";

import type { LucideIcon } from "lucide-react";
import { ClipboardPen, FileSpreadsheet, MoreHorizontal, ReceiptText } from "lucide-react";
import { CreateInvoiceDialog } from "@/components/inventory/create-invoice-dialog";
import { CreatePurchaseRequestDialog } from "@/components/inventory/create-purchase-request-dialog";
import { CreateQuotationDialog } from "@/components/inventory/create-quotation-dialog";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import {
  INVOICE_STATUS_TONE,
  PR_STATUS_TONE,
  QUOTATION_STATUS_TONE,
} from "@/components/inventory/status-tones";
import { RecordPaymentDialog } from "@/components/inventory/record-payment-dialog";
import { TABLE_CARD, TABLE_CARD_HEAD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/hooks/use-branch";
import {
  usePurchaseRequests,
  useQuotations,
  useSupplierInvoices,
  useUpdatePurchaseRequestStatus,
  useUpdateQuotationStatus,
  type PurchaseRequest,
  type SupplierQuotation,
} from "@/hooks/use-inventory";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const REQUEST_NEXT: Record<PurchaseRequest["status"], PurchaseRequest["status"][]> = {
  DRAFT: ["PENDING_APPROVAL"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
  CONVERTED: [],
};

const QUOTATION_NEXT: Record<SupplierQuotation["status"], SupplierQuotation["status"][]> = {
  DRAFT: ["RECEIVED"],
  RECEIVED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

function SectionHead({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) {
  return (
    <div className={TABLE_CARD_HEAD}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-xl" />
      ))}
    </div>
  );
}

function PurchaseRequestsSection({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data: requests, isLoading } = usePurchaseRequests(branchId);
  const updateStatus = useUpdatePurchaseRequestStatus(branchId);

  return (
    <Card className={TABLE_CARD}>
      <SectionHead
        icon={ClipboardPen}
        title={t("inventory.pr.title")}
        subtitle={t("inventory.pr.subtitle")}
        action={<CreatePurchaseRequestDialog branchId={branchId} />}
      />
      {isLoading ? (
        <SectionSkeleton />
      ) : requests && requests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.pr.number")}</TableHead>
              <TableHead>{t("inventory.pr.requestedBy")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.items")}</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">{t("common.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => {
              const next = REQUEST_NEXT[r.status];
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.requestNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{r.requestedBy.name}</TableCell>
                  <TableCell>
                    <StatusPill tone={PR_STATUS_TONE[r.status]}>{t(`inventory.prStatus.${r.status}`)}</StatusPill>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{formatNumber(r.items.length)}</TableCell>
                  <TableCell className="w-10">
                    {next.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={t("common.actions")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {next.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => updateStatus.mutate({ id: r.id, status })}
                            >
                              {t("inventory.pr.moveTo", { status: t(`inventory.prStatus.${status}`) })}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          compact
          className="m-4"
          icon={ClipboardPen}
          title={t("inventory.pr.emptyTitle")}
          description={t("inventory.pr.emptyDescription")}
        />
      )}
    </Card>
  );
}

function QuotationsSection({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data: quotations, isLoading } = useQuotations(branchId);
  const updateStatus = useUpdateQuotationStatus(branchId);

  return (
    <Card className={TABLE_CARD}>
      <SectionHead
        icon={FileSpreadsheet}
        title={t("inventory.quotation.title")}
        subtitle={t("inventory.quotation.subtitle")}
        action={<CreateQuotationDialog branchId={branchId} />}
      />
      {isLoading ? (
        <SectionSkeleton />
      ) : quotations && quotations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.quotation.number")}</TableHead>
              <TableHead>{t("inventory.supplier")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.items")}</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">{t("common.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((q) => {
              const next = QUOTATION_NEXT[q.status];
              return (
                <TableRow key={q.id}>
                  <TableCell className="font-medium text-foreground">{q.quotationNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{q.supplier.name}</TableCell>
                  <TableCell>
                    <StatusPill tone={QUOTATION_STATUS_TONE[q.status]}>{t(`inventory.quotationStatus.${q.status}`)}</StatusPill>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{formatNumber(q.items.length)}</TableCell>
                  <TableCell className="w-10">
                    {next.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={t("common.actions")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {next.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => updateStatus.mutate({ id: q.id, status })}
                            >
                              {t(`inventory.quotation.mark.${status}`)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          compact
          className="m-4"
          icon={FileSpreadsheet}
          title={t("inventory.quotation.emptyTitle")}
          description={t("inventory.quotation.emptyDescription")}
        />
      )}
    </Card>
  );
}

function SupplierInvoicesSection({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data: invoices, isLoading } = useSupplierInvoices(branchId);

  return (
    <Card className={TABLE_CARD}>
      <SectionHead
        icon={ReceiptText}
        title={t("inventory.invoice.title")}
        subtitle={t("inventory.invoice.subtitle")}
        action={<CreateInvoiceDialog branchId={branchId} />}
      />
      {isLoading ? (
        <SectionSkeleton />
      ) : invoices && invoices.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.invoice.numberShort")}</TableHead>
              <TableHead>{t("inventory.supplier")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.total")}</TableHead>
              <TableHead className="text-end">{t("common.paid")}</TableHead>
              <TableHead className="w-0">
                <span className="sr-only">{t("common.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-foreground">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-muted-foreground">{inv.supplier.name}</TableCell>
                <TableCell>
                  <StatusPill tone={INVOICE_STATUS_TONE[inv.status]}>{t(`inventory.invoiceStatus.${inv.status}`)}</StatusPill>
                </TableCell>
                <TableCell className="text-end font-medium tabular-nums">
                  {formatCurrency(Number(inv.totalAmount))}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {formatCurrency(Number(inv.amountPaid))}
                </TableCell>
                <TableCell className="w-32 text-end">
                  {(inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID") && (
                    <RecordPaymentDialog branchId={branchId} invoice={inv} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          compact
          className="m-4"
          icon={ReceiptText}
          title={t("inventory.invoice.emptyTitle")}
          description={t("inventory.invoice.emptyDescription")}
        />
      )}
    </Card>
  );
}

export default function ProcurementPage() {
  const { branchId } = useBranch();

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader />

      <div className="grid gap-6">
        <PurchaseRequestsSection branchId={branchId} />
        <QuotationsSection branchId={branchId} />
        <SupplierInvoicesSection branchId={branchId} />
      </div>
    </div>
  );
}
