"use client";

import {
  Banknote,
  Building2,
  CalendarRange,
  Coins,
  HandCoins,
  Landmark,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Vault,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BalanceSheetTab, BankTab, BudgetsTab } from "@/components/accounting/finance-tabs";
import { FIELD_LABEL, TABLE_CARD, TABLE_CARD_HEAD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAccountingActions,
  useBranchOverview,
  useClosingPreview,
  useClosings,
  useExpenses,
  useGst,
  useProfitLoss,
} from "@/hooks/use-accounting";
import { useBranch } from "@/hooks/use-branch";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const TABS = ["expenses", "cash close", "profit & loss", "balance sheet", "budgets", "bank", "gst", "branches"] as const;
const TAB_KEYS: Record<(typeof TABS)[number], string> = {
  expenses: "accounting.tab.expenses",
  "cash close": "accounting.tab.cashClose",
  "profit & loss": "accounting.tab.profitLoss",
  "balance sheet": "accounting.tab.balanceSheet",
  budgets: "accounting.tab.budgets",
  bank: "accounting.tab.bank",
  gst: "accounting.tab.tax",
  branches: "accounting.tab.branches",
};
const TAB_ICONS = {
  expenses: Receipt,
  "cash close": Vault,
  "profit & loss": TrendingUp,
  "balance sheet": Scale,
  budgets: PiggyBank,
  bank: Landmark,
  gst: HandCoins,
  branches: Building2,
} as const;
type Tab = (typeof TABS)[number];

function monthRange() {
  const now = new Date();
  return {
    from: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))),
    to: iso(now),
  };
}

function RangePicker({
  range,
  onChange,
}: {
  range: { from: string; to: string };
  onChange: (r: { from: string; to: string }) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-fit">
      <span className="hidden size-10 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground ring-1 ring-border/70 sm:flex">
        <CalendarRange className="size-4" />
      </span>
      <Input
        type="date"
        aria-label={t("common.from")}
        className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        value={range.from}
        onChange={(e) => onChange({ ...range, from: e.target.value })}
      />
      <span className="text-sm text-muted-foreground">–</span>
      <Input
        type="date"
        aria-label={t("common.to")}
        className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        value={range.to}
        onChange={(e) => onChange({ ...range, to: e.target.value })}
      />
    </div>
  );
}

/** One line of a financial statement; `strong` rows are subtotals. */
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm sm:px-5",
        strong && "border-y border-border/70 bg-surface-2/60 font-semibold",
      )}
    >
      <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className="shrink-0 tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/** Month-to-date KPIs at the top of the page. */
function Summary({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [range] = useState(monthRange);
  const { data, isLoading } = useProfitLoss(branchId, range.from, range.to);
  const v = (n: number | undefined) => (isLoading || n === undefined ? "…" : formatCurrency(n));
  const hint = t("common.thisMonth");
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard label={t("accounting.pnl.netSales")} value={v(data?.netSales)} icon={Banknote} hint={hint} />
      <StatCard
        label={t("accounting.summary.expenses")}
        value={v(data ? data.totalExpenses + data.payrollCost : undefined)}
        icon={TrendingDown}
        tone="warning"
        hint={hint}
      />
      <StatCard
        label={t("accounting.pnl.netProfit")}
        value={v(data?.netProfit)}
        icon={data && data.netProfit < 0 ? TrendingDown : TrendingUp}
        tone={data && data.netProfit < 0 ? "danger" : "success"}
        hint={hint}
      />
      <StatCard label={t("accounting.pnl.taxCollected")} value={v(data?.taxCollected)} icon={Coins} tone="gold" hint={hint} />
    </div>
  );
}

function Expenses({ branchId }: { branchId: string | null }) {
  const [range, setRange] = useState(monthRange);
  const { data, isLoading } = useExpenses(branchId, range.from, range.to);
  const { addExpense, deleteExpense } = useAccountingActions(branchId);
  const { t } = useI18n();
  const [f, setF] = useState({ spentOn: iso(new Date()), category: "", amount: "", note: "", paidFromCash: false });
  const total = data?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  const submit = () => {
    const amount = Number(f.amount);
    if (!f.category.trim() || !(amount > 0)) return toast.error(t("accounting.expenses.validation"));
    addExpense.mutate(
      { spentOn: f.spentOn, category: f.category.trim(), amount, note: f.note || undefined, paidFromCash: f.paidFromCash },
      {
        onSuccess: () => {
          toast.success(t("accounting.expenses.added"));
          setF({ ...f, category: "", amount: "", note: "" });
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="px-4 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">{t("accounting.expenses.add")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto] lg:items-center">
          <Input type="date" aria-label={t("common.date")} value={f.spentOn} onChange={(e) => setF({ ...f, spentOn: e.target.value })} />
          <Input placeholder={t("accounting.expenses.categoryPlaceholder")} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          <Input placeholder={t("common.amount")} inputMode="decimal" dir="ltr" className="tabular-nums" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <Input placeholder={t("common.note")} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-surface-2 px-3 text-sm ring-1 ring-border/70 select-none">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={f.paidFromCash}
              onChange={(e) => setF({ ...f, paidFromCash: e.target.checked })}
            />
            {t("accounting.expenses.paidFromTill")}
          </label>
          <Button className="h-10" onClick={submit} disabled={addExpense.isPending}>
            <Plus className="size-4" />
            {t("accounting.expenses.add")}
          </Button>
        </div>
      </Card>

      <RangePicker range={range} onChange={setRange} />

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : data && data.length > 0 ? (
        <Card className={TABLE_CARD}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.category")}</TableHead>
                <TableHead>{t("common.note")}</TableHead>
                <TableHead className="text-end">{t("common.amount")}</TableHead>
                <TableHead className="w-0">
                  <span className="sr-only">{t("common.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{e.spentOn.slice(0, 10)}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {e.category}
                      {e.paidFromCash && <StatusPill tone="gold">{t("accounting.expenses.tillTag")}</StatusPill>}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">{e.note || "—"}</TableCell>
                  <TableCell className="text-end font-medium tabular-nums">{formatCurrency(e.amount)}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={t("common.delete")}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteExpense.mutate(e.id, { onError: (err) => toast.error(errMsg(err)) })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-surface-2/60">
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="font-semibold">{t("common.total")}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatCurrency(total)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      ) : (
        <EmptyState compact icon={Receipt} title={t("accounting.expenses.empty")} />
      )}
    </div>
  );
}

function CashClose({ branchId }: { branchId: string | null }) {
  const [date, setDate] = useState(() => iso(new Date()));
  const [floor, setFloor] = useState("0");
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const { data: preview } = useClosingPreview(branchId, date, Number(floor) || 0);
  const { data: closings } = useClosings(branchId);
  const { closeDay } = useAccountingActions(branchId);
  const { t } = useI18n();
  const variance = preview && counted !== "" ? Number(counted) - preview.expectedCash : null;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="gap-0 py-0">
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-date" className={FIELD_LABEL}>{t("common.date")}</label>
            <Input id="cc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-float" className={FIELD_LABEL}>{t("accounting.close.openingFloat")}</label>
            <Input id="cc-float" inputMode="decimal" dir="ltr" className="tabular-nums" placeholder={t("accounting.close.openingFloat")} value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>
        </div>
        {preview && (
          <div className="border-t border-border/70 pt-1">
            <Row label={t("accounting.close.openingFloat")} value={formatCurrency(preview.openingFloat)} />
            <Row label={t("accounting.close.cashSales")} value={formatCurrency(preview.cashSales)} />
            <Row label={t("accounting.close.cashExpenses")} value={`− ${formatCurrency(preview.cashExpenses)}`} />
            <Row strong label={t("accounting.close.expected")} value={formatCurrency(preview.expectedCash)} />
          </div>
        )}
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cc-counted" className={FIELD_LABEL}>{t("accounting.close.countedCash")}</label>
            <div className="flex flex-wrap items-center gap-3">
              <Input id="cc-counted" className="h-11 max-w-48 text-base tabular-nums" inputMode="decimal" dir="ltr" placeholder={t("accounting.close.countedCash")} value={counted} onChange={(e) => setCounted(e.target.value)} />
              {variance != null && (
                <StatusPill tone={variance === 0 ? "success" : variance > 0 ? "info" : "danger"}>
                  {variance === 0
                    ? t("accounting.close.balanced")
                    : t(variance > 0 ? "accounting.close.over" : "accounting.close.short", { amount: formatCurrency(Math.abs(variance)) })}
                </StatusPill>
              )}
            </div>
          </div>
          <Input placeholder={t("accounting.close.notePlaceholder")} value={note} onChange={(e) => setNote(e.target.value)} />
          <Button
            size="lg"
            className="w-full sm:w-fit"
            disabled={counted === "" || closeDay.isPending}
            onClick={() =>
              closeDay.mutate(
                { businessDate: date, openingFloat: Number(floor) || 0, countedCash: Number(counted), note: note || undefined },
                { onSuccess: () => { toast.success(t("accounting.close.closed")); setCounted(""); setNote(""); }, onError: (e) => toast.error(errMsg(e)) },
              )
            }
          >
            <Vault className="size-4" />
            {t("accounting.close.closeDay")}
          </Button>
        </div>
      </Card>

      <Card className={TABLE_CARD}>
        <div className={TABLE_CARD_HEAD}>
          <h2 className="text-sm font-semibold text-foreground">{t("accounting.close.history")}</h2>
        </div>
        {closings && closings.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border/60">
            {closings.map((c) => {
              const v = Number(c.variance);
              return (
                <li key={c.id} className="flex flex-col gap-1.5 px-4 py-3 text-sm sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground tabular-nums">{c.businessDate.slice(0, 10)}</span>
                    <StatusPill tone={v === 0 ? "success" : v > 0 ? "info" : "danger"}>
                      {v === 0
                        ? t("accounting.close.balanced")
                        : t(v > 0 ? "accounting.close.over" : "accounting.close.short", { amount: formatCurrency(Math.abs(v)) })}
                    </StatusPill>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("accounting.close.summary", {
                      expected: formatCurrency(c.expectedCash),
                      counted: formatCurrency(c.countedCash),
                      variance: formatCurrency(c.variance),
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState compact className="m-4" icon={Vault} title={t("accounting.close.empty")} />
        )}
      </Card>
    </div>
  );
}

function ProfitLossTab({ branchId }: { branchId: string | null }) {
  const [range, setRange] = useState(monthRange);
  const { data } = useProfitLoss(branchId, range.from, range.to);
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <RangePicker range={range} onChange={setRange} />
      {data ? (
        <Card className="max-w-3xl gap-0 py-0">
          <div className={TABLE_CARD_HEAD}>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t("accounting.tab.profitLoss")}</h2>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatDate(range.from)} – {formatDate(range.to)}
              </p>
            </div>
          </div>
          <div className="py-1">
            <Row label={t("accounting.pnl.collected", { n: data.orders })} value={formatCurrency(data.grossCollected)} />
            <Row label={t("accounting.pnl.taxCollected")} value={`− ${formatCurrency(data.taxCollected)}`} />
            <Row label={t("accounting.pnl.refunds")} value={`− ${formatCurrency(data.refunds)}`} />
            <Row strong label={t("accounting.pnl.netSales")} value={formatCurrency(data.netSales)} />
            {data.expenses.map((e) => (
              <Row key={e.category} label={e.category} value={`− ${formatCurrency(e.amount)}`} />
            ))}
            <Row label={t("accounting.pnl.payroll")} value={`− ${formatCurrency(data.payrollCost)}`} />
          </div>
          <div
            className={cn(
              "flex items-baseline justify-between gap-4 border-t border-border/70 px-4 py-4 sm:px-5",
              data.netProfit < 0 ? "bg-status-danger-soft" : "bg-status-success-soft",
            )}
          >
            <span className="font-semibold text-foreground">{t("accounting.pnl.netProfit")}</span>
            <span
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                data.netProfit < 0 ? "text-status-danger" : "text-status-success",
              )}
            >
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </Card>
      ) : (
        <Skeleton className="h-64 max-w-3xl rounded-2xl" />
      )}
    </div>
  );
}

function GstTab({ branchId }: { branchId: string | null }) {
  const [range, setRange] = useState(monthRange);
  const { data } = useGst(branchId, range.from, range.to);
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <RangePicker range={range} onChange={setRange} />
      {data ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatCard label={t("accounting.tax.taxableValue")} value={formatCurrency(data.totalTaxable)} icon={Wallet} />
          <StatCard label={t("common.tax")} value={formatCurrency(data.totalTax)} icon={HandCoins} tone="gold" />
          <StatCard
            className="col-span-2 lg:col-span-1"
            label={t("common.total")}
            value={formatCurrency(data.totalTaxable + data.totalTax)}
            icon={Coins}
            tone="neutral"
          />
        </div>
      ) : null}
      <Card className={TABLE_CARD}>
        {data ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("accounting.tax.rate")}</TableHead>
                <TableHead className="text-end">{t("accounting.tax.taxableValue")}</TableHead>
                <TableHead className="text-end">{t("common.tax")}</TableHead>
                <TableHead className="text-end">{t("common.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((r) => (
                <TableRow key={r.ratePercent}>
                  <TableCell>
                    <StatusPill tone="neutral"><bdi>{r.ratePercent}%</bdi></StatusPill>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{formatCurrency(r.taxableValue)}</TableCell>
                  <TableCell className="text-end tabular-nums">{formatCurrency(r.tax)}</TableCell>
                  <TableCell className="text-end font-medium tabular-nums">{formatCurrency(r.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-surface-2/60">
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-semibold">{t("common.total")}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatCurrency(data.totalTaxable)}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatCurrency(data.totalTax)}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatCurrency(data.totalTaxable + data.totalTax)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <Skeleton className="m-4 h-24" />
        )}
        <p className="border-t border-border/70 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          {t("accounting.tax.footnote")}
        </p>
      </Card>
    </div>
  );
}

function BranchesTab() {
  const [range, setRange] = useState(monthRange);
  const { data } = useBranchOverview(range.from, range.to);
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <RangePicker range={range} onChange={setRange} />
      <Card className={TABLE_CARD}>
        {!data ? (
          <Skeleton className="m-4 h-24" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.branch")}</TableHead>
                <TableHead className="text-end">{t("common.orders")}</TableHead>
                <TableHead className="text-end">{t("accounting.branches.sales")}</TableHead>
                <TableHead className="text-end">{t("accounting.branches.open")}</TableHead>
                <TableHead>{t("accounting.branches.lowStock")}</TableHead>
                <TableHead className="text-end">{t("accounting.branches.inventoryValue")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((b) => (
                <TableRow key={b.branchId}>
                  <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                  <TableCell className="text-end tabular-nums">{formatNumber(b.orders)}</TableCell>
                  <TableCell className="text-end font-medium tabular-nums">{formatCurrency(b.sales)}</TableCell>
                  <TableCell className="text-end tabular-nums">{formatNumber(b.openOrders)}</TableCell>
                  <TableCell>
                    <StatusPill tone={b.lowStockItems > 0 ? "warning" : "success"}>
                      {formatNumber(b.lowStockItems)}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{formatCurrency(b.inventoryValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default function AccountingPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<Tab>("expenses");
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("accounting.title")} description={t("accounting.subtitle")} icon={Landmark}>
        <Segmented<Tab>
          aria-label={t("accounting.title")}
          value={tab}
          onChange={setTab}
          options={TABS.map((id) => ({ value: id, label: t(TAB_KEYS[id]), icon: TAB_ICONS[id] }))}
        />
      </PageHeader>
      <Summary branchId={branchId} />
      {tab === "expenses" && <Expenses branchId={branchId} />}
      {tab === "cash close" && <CashClose branchId={branchId} />}
      {tab === "profit & loss" && <ProfitLossTab branchId={branchId} />}
      {tab === "balance sheet" && <BalanceSheetTab branchId={branchId} />}
      {tab === "budgets" && <BudgetsTab branchId={branchId} />}
      {tab === "bank" && <BankTab branchId={branchId} />}
      {tab === "gst" && <GstTab branchId={branchId} />}
      {tab === "branches" && <BranchesTab />}
    </div>
  );
}
