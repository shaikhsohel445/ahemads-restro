"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, CircleCheck, CircleDashed, CornerDownRight, Landmark, PiggyBank, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FIELD_LABEL, TABLE_CARD, TABLE_CARD_HEAD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const err = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const thisMonth = () => new Date().toISOString().slice(0, 7);

/* ----------------------------- Budgets ----------------------------- */

interface BudgetView {
  month: string;
  rows: { id: string; category: string; budget: number; actual: number; remaining: number; percentUsed: number }[];
  unbudgeted: { category: string; actual: number }[];
  totalBudget: number;
  totalActual: number;
  remaining: number;
}

export function BudgetsTab({ branchId }: { branchId: string | null }) {
  const qc = useQueryClient();
  const { t } = useI18n();
  const [month, setMonth] = useState(thisMonth);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const key = ["acct", "budgets", branchId, month];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => api.get<BudgetView>(`/accounting/budgets?branchId=${branchId}&month=${month}`),
    enabled: !!branchId,
  });
  const save = useMutation({
    mutationFn: (dto: { month: string; category: string; amount: number }) =>
      api.put(`/accounting/budgets?branchId=${branchId}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["acct", "budgets"] });
      setCategory("");
      setAmount("");
      toast.success(t("accounting.budgets.saved"));
    },
    onError: (e) => toast.error(err(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/accounting/budgets/${id}?branchId=${branchId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acct", "budgets"] }),
    onError: (e) => toast.error(err(e)),
  });

  const usedTone = (pct: number) => (pct > 100 ? "danger" : pct >= 80 ? "warning" : "success");
  const BAR: Record<string, string> = {
    danger: "bg-status-danger",
    warning: "bg-status-warning",
    success: "bg-status-success",
  };
  const totalPct = data && data.totalBudget > 0 ? Math.round((data.totalActual / data.totalBudget) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="px-4 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,12rem)_auto] lg:items-end">
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL} htmlFor="bud-month">{t("accounting.budgets.month")}</label>
            <Input id="bud-month" type="month" className="lg:w-44" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL} htmlFor="bud-cat">{t("accounting.budgets.expenseCategory")}</label>
            <Input id="bud-cat" placeholder={t("accounting.budgets.categoryPlaceholder")} value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL} htmlFor="bud-amt">{t("accounting.budgets.budget")}</label>
            <Input id="bud-amt" type="number" min="0" step="0.01" className="tabular-nums" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button
            className="h-10"
            disabled={!category.trim() || !amount || save.isPending}
            onClick={() => save.mutate({ month, category: category.trim(), amount: Number(amount) })}
          >
            <Plus className="size-4" />
            {t("accounting.budgets.set")}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : data && data.rows.length > 0 ? (
        <>
          <Card className="px-4 sm:px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{t("accounting.budgets.spent")}</p>
                <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                  {formatCurrency(data.totalActual)}
                  <span className="ms-2 text-sm font-normal text-muted-foreground">
                    / {formatCurrency(data.totalBudget)}
                  </span>
                </p>
              </div>
              <StatusPill tone={usedTone(totalPct)}>
                {data.remaining < 0
                  ? t("accounting.budgets.overBy", { amount: formatCurrency(Math.abs(data.remaining)) })
                  : t("accounting.budgets.leftAmount", { amount: formatCurrency(data.remaining) })}
              </StatusPill>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={totalPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("accounting.budgets.used")}
            >
              <div className={cn("h-full rounded-full transition-all", BAR[usedTone(totalPct)])} style={{ width: `${Math.min(100, totalPct)}%` }} />
            </div>
          </Card>

          <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
            {data.rows.map((r) => {
              const tone = usedTone(r.percentUsed);
              return (
                <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{r.category}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(r.actual)} / {formatCurrency(r.budget)}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="-me-1.5 -mt-1 text-muted-foreground hover:text-destructive"
                      aria-label={t("common.remove")}
                      onClick={() => remove.mutate(r.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
                    role="progressbar"
                    aria-valuenow={r.percentUsed}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("accounting.budgets.usedAria", { category: r.category })}
                  >
                    <div className={cn("h-full rounded-full transition-all", BAR[tone])} style={{ width: `${Math.min(100, r.percentUsed)}%` }} />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <StatusPill tone={tone}>
                      <span className="tabular-nums">{r.percentUsed}%</span> {t("accounting.budgets.used")}
                    </StatusPill>
                    <span className={cn("tabular-nums", r.remaining < 0 ? "text-status-danger" : "text-muted-foreground")}>
                      {t("accounting.budgets.left")}: {formatCurrency(r.remaining)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {data.unbudgeted.length > 0 && (
            <p className="rounded-xl bg-status-warning-soft px-4 py-3 text-xs text-status-warning">
              {t("accounting.budgets.unbudgeted", {
                list: data.unbudgeted.map((u) => `${u.category} (${formatCurrency(u.actual)})`).join(t("accounting.listSeparator")),
              })}
            </p>
          )}
        </>
      ) : (
        <EmptyState icon={PiggyBank} title={t("accounting.budgets.empty", { month })} />
      )}
    </div>
  );
}

/* --------------------------- Bank reconciliation --------------------------- */

interface BankView {
  summary: { total: number; matched: number; unmatched: number; ignored: number; moneyIn: number; moneyOut: number };
  transactions: {
    id: string;
    postedOn: string;
    description: string;
    reference: string;
    amount: number;
    status: "UNMATCHED" | "MATCHED" | "IGNORED";
    expense: { id: string; category: string; note: string | null; spentOn: string } | null;
  }[];
}
const BANK_TONE: Record<BankView["transactions"][number]["status"], Tone> = {
  MATCHED: "success",
  UNMATCHED: "warning",
  IGNORED: "neutral",
};

interface Candidate { id: string; category: string; amount: string; spentOn: string; note: string | null }

export function BankTab({ branchId }: { branchId: string | null }) {
  const qc = useQueryClient();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["acct", "bank", branchId],
    queryFn: () => api.get<BankView>(`/accounting/bank?branchId=${branchId}`),
    enabled: !!branchId,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["acct", "bank"] });
  const importCsv = useMutation({
    mutationFn: (csv: string) =>
      api.post<{ imported: number; duplicatesIgnored: number; autoMatched: number; skippedLines: number[] }>(
        `/accounting/bank/import?branchId=${branchId}`,
        { csv },
      ),
    onSuccess: (r) => {
      refresh();
      toast.success(
        t("accounting.bank.imported", { n: r.imported, matched: r.autoMatched }) +
          (r.duplicatesIgnored ? t("accounting.bank.importedDuplicates", { n: r.duplicatesIgnored }) : "") +
          (r.skippedLines.length ? t("accounting.bank.importedUnreadable", { n: r.skippedLines.length }) : ""),
      );
    },
    onError: (e) => toast.error(err(e)),
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "UNMATCHED" | "IGNORED" }) =>
      api.patch(`/accounting/bank/${id}?branchId=${branchId}`, { status }),
    onSuccess: refresh,
    onError: (e) => toast.error(err(e)),
  });
  const autoMatch = useMutation({
    mutationFn: () => api.post<{ matched: number }>(`/accounting/bank/auto-match?branchId=${branchId}`),
    onSuccess: (r) => {
      refresh();
      toast.success(t("accounting.bank.newMatches", { n: r.matched }));
    },
  });
  const match = useMutation({
    mutationFn: ({ id, expenseId }: { id: string; expenseId: string }) =>
      api.post(`/accounting/bank/${id}/match?branchId=${branchId}`, { expenseId }),
    onSuccess: () => {
      setPicking(null);
      refresh();
    },
    onError: (e) => toast.error(err(e)),
  });
  const candidates = useQuery({
    queryKey: ["acct", "bank-cand", picking],
    queryFn: () => api.get<Candidate[]>(`/accounting/bank/${picking}/candidates?branchId=${branchId}`),
    enabled: !!picking && !!branchId,
  });

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 1_500_000) return toast.error(t("accounting.bank.tooLarge"));
    importCsv.mutate(await f.text());
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="px-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs text-muted-foreground">{t("accounting.bank.help")}</p>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" id="bank-csv" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button variant="outline" onClick={() => autoMatch.mutate()} disabled={autoMatch.isPending}>
              <Sparkles className="size-4 text-gold" />
              {t("accounting.bank.autoMatch")}
            </Button>
            <Button onClick={() => fileRef.current?.click()} disabled={importCsv.isPending}>
              <Upload className="size-4" /> {t("accounting.bank.import")}
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label={t("accounting.bank.status.MATCHED")} value={formatNumber(data.summary.matched)} icon={CircleCheck} tone="success" />
          <StatCard
            label={t("accounting.bank.status.UNMATCHED")}
            value={formatNumber(data.summary.unmatched)}
            icon={CircleDashed}
            tone={data.summary.unmatched > 0 ? "warning" : "neutral"}
          />
          <StatCard label={t("accounting.bank.moneyIn")} value={formatCurrency(data.summary.moneyIn)} icon={ArrowDownLeft} tone="info" />
          <StatCard label={t("accounting.bank.moneyOut")} value={formatCurrency(Math.abs(data.summary.moneyOut))} icon={ArrowUpRight} tone="neutral" />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : data && data.transactions.length > 0 ? (
        <Card className={TABLE_CARD}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.description")}</TableHead>
                <TableHead className="text-end">{t("common.amount")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-end">
                  <span className="sr-only">{t("common.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((tx) => (
                <TableRow key={tx.id} className="align-top">
                  <TableCell className="text-muted-foreground tabular-nums">{tx.postedOn.slice(0, 10)}</TableCell>
                  <TableCell className="min-w-56 whitespace-normal">
                    <span className="text-foreground">{tx.description}</span>
                    {tx.expense && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CornerDownRight className="size-3 shrink-0 rtl:-scale-x-100" />
                        {tx.expense.category}{tx.expense.note ? ` · ${tx.expense.note}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={cn("text-end font-medium tabular-nums", tx.amount < 0 ? "text-foreground" : "text-status-success")}>
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={BANK_TONE[tx.status]}>{t(`accounting.bank.status.${tx.status}`)}</StatusPill>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      {tx.status === "UNMATCHED" && tx.amount < 0 && (
                        <Button size="sm" variant="outline" aria-expanded={picking === tx.id} onClick={() => setPicking(picking === tx.id ? null : tx.id)}>
                          {t("accounting.bank.match")}
                        </Button>
                      )}
                      {tx.status === "UNMATCHED" && (
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setStatus.mutate({ id: tx.id, status: "IGNORED" })}>
                          {t("accounting.bank.ignore")}
                        </Button>
                      )}
                      {tx.status !== "UNMATCHED" && (
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setStatus.mutate({ id: tx.id, status: "UNMATCHED" })}>
                          {t("accounting.bank.undo")}
                        </Button>
                      )}
                    </div>
                    {picking === tx.id && (
                      <div className="mt-2 flex min-w-60 flex-col gap-1 rounded-xl border border-border/80 bg-card p-1.5 text-start text-xs shadow-sm">
                        {candidates.isLoading && <span className="px-2 py-1.5 text-muted-foreground">{t("accounting.bank.looking")}</span>}
                        {candidates.data?.length === 0 && <span className="px-2 py-1.5 text-muted-foreground">{t("accounting.bank.noCandidates")}</span>}
                        {candidates.data?.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-accent"
                            onClick={() => match.mutate({ id: tx.id, expenseId: c.id })}
                          >
                            <span className="truncate">
                              <span className="tabular-nums text-muted-foreground">{c.spentOn.slice(0, 10)}</span> · {c.category}
                            </span>
                            <span className="shrink-0 font-medium tabular-nums">{formatCurrency(Number(c.amount))}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={Landmark} title={t("accounting.bank.empty")} />
      )}
    </div>
  );
}

/* ----------------------------- Balance sheet ----------------------------- */

interface BalanceSheet {
  asOf: string;
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  note: string;
}

function Line({ label, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm sm:px-5",
        strong && "border-t border-border/70 bg-surface-2/60 font-semibold",
      )}
    >
      <span className={strong ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className="shrink-0 tabular-nums text-foreground">{formatCurrency(amount)}</span>
    </div>
  );
}

export function BalanceSheetTab({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));
  const { data, isLoading } = useQuery({
    queryKey: ["acct", "balance", branchId, asOf],
    queryFn: () => api.get<BalanceSheet>(`/accounting/balance-sheet?branchId=${branchId}&asOf=${asOf}`),
    enabled: !!branchId,
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bs-asof" className={FIELD_LABEL}>{t("accounting.balance.asOf")}</label>
        <Input id="bs-asof" type="date" className="w-full sm:w-44" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </div>
      {isLoading || !data ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          <Card className="gap-0 py-0">
            <div className={TABLE_CARD_HEAD}>
              <h3 className="text-sm font-semibold text-foreground">{t("accounting.balance.assets")}</h3>
              <span className="text-xs text-muted-foreground tabular-nums">{formatDate(asOf)}</span>
            </div>
            <div className="py-1">
              {data.assets.map((a) => <Line key={a.label} {...a} />)}
            </div>
            <Line label={t("accounting.balance.totalAssets")} amount={data.totalAssets} strong />
          </Card>
          <Card className="gap-0 py-0">
            <div className={TABLE_CARD_HEAD}>
              <h3 className="text-sm font-semibold text-foreground">{t("accounting.balance.liabilitiesEquity")}</h3>
              <span className="text-xs text-muted-foreground tabular-nums">{formatDate(asOf)}</span>
            </div>
            <div className="py-1">
              {data.liabilities.map((a) => <Line key={a.label} {...a} />)}
            </div>
            <Line label={t("accounting.balance.totalLiabilities")} amount={data.totalLiabilities} strong />
            <Line label={t("accounting.balance.equity")} amount={data.equity} strong />
          </Card>
          <p className="text-xs text-muted-foreground md:col-span-2">{data.note}</p>
        </div>
      )}
    </div>
  );
}
