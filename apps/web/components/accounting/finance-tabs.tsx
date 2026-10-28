"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
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

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="bud-month">{t("accounting.budgets.month")}</label>
          <Input id="bud-month" type="month" className="w-44" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="bud-cat">{t("accounting.budgets.expenseCategory")}</label>
          <Input id="bud-cat" className="w-48" placeholder={t("accounting.budgets.categoryPlaceholder")} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="bud-amt">{t("accounting.budgets.budget")}</label>
          <Input id="bud-amt" type="number" min="0" step="0.01" className="w-36" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Button
          disabled={!category.trim() || !amount || save.isPending}
          onClick={() => save.mutate({ month, category: category.trim(), amount: Number(amount) })}
        >
          {t("accounting.budgets.set")}
        </Button>
      </Card>

      <Card className="overflow-x-auto p-4">
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : data && data.rows.length > 0 ? (
          <>
            <table className="w-full text-sm">
              <thead className="text-start text-xs text-muted-foreground">
                <tr><th className="py-1">{t("common.category")}</th><th>{t("accounting.budgets.budget")}</th><th>{t("accounting.budgets.spent")}</th><th>{t("accounting.budgets.left")}</th><th className="w-40">{t("accounting.budgets.used")}</th><th /></tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-1.5">{r.category}</td>
                    <td className="tabular-nums">{formatCurrency(r.budget)}</td>
                    <td className="tabular-nums">{formatCurrency(r.actual)}</td>
                    <td className={cn("tabular-nums", r.remaining < 0 && "text-destructive")}>{formatCurrency(r.remaining)}</td>
                    <td>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={r.percentUsed} aria-valuemin={0} aria-valuemax={100} aria-label={t("accounting.budgets.usedAria", { category: r.category })}>
                        <div
                          className={cn("h-full rounded-full", r.percentUsed > 100 ? "bg-destructive" : r.percentUsed >= 80 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${Math.min(100, r.percentUsed)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{r.percentUsed}%</span>
                    </td>
                    <td className="text-end">
                      <button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => remove.mutate(r.id)}>{t("common.remove")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td className="py-1.5">{t("common.total")}</td>
                  <td className="tabular-nums">{formatCurrency(data.totalBudget)}</td>
                  <td className="tabular-nums">{formatCurrency(data.totalActual)}</td>
                  <td className={cn("tabular-nums", data.remaining < 0 && "text-destructive")}>{formatCurrency(data.remaining)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
            {data.unbudgeted.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("accounting.budgets.unbudgeted", {
                  list: data.unbudgeted.map((u) => `${u.category} (${formatCurrency(u.actual)})`).join(t("accounting.listSeparator")),
                })}
              </p>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("accounting.budgets.empty", { month })}</p>
        )}
      </Card>
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
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" id="bank-csv" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button onClick={() => fileRef.current?.click()} disabled={importCsv.isPending}>
          <Upload className="me-2 h-4 w-4" /> {t("accounting.bank.import")}
        </Button>
        <Button variant="outline" onClick={() => autoMatch.mutate()} disabled={autoMatch.isPending}>{t("accounting.bank.autoMatch")}</Button>
        <p className="text-xs text-muted-foreground">
          {t("accounting.bank.help")}
        </p>
      </Card>

      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [t("accounting.bank.status.MATCHED"), data.summary.matched],
            [t("accounting.bank.status.UNMATCHED"), data.summary.unmatched],
            [t("accounting.bank.moneyIn"), formatCurrency(data.summary.moneyIn)],
            [t("accounting.bank.moneyOut"), formatCurrency(Math.abs(data.summary.moneyOut))],
          ].map(([l, v]) => (
            <Card key={String(l)} className="p-3">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="text-lg font-semibold tabular-nums">{v}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="overflow-x-auto p-4">
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : data && data.transactions.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-start text-xs text-muted-foreground">
              <tr><th className="py-1">{t("common.date")}</th><th>{t("common.description")}</th><th className="text-end">{t("common.amount")}</th><th>{t("common.status")}</th><th /></tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-border align-top">
                  <td className="py-1.5 whitespace-nowrap">{tx.postedOn.slice(0, 10)}</td>
                  <td>
                    {tx.description}
                    {tx.expense && <span className="block text-xs text-muted-foreground">↳ {tx.expense.category}{tx.expense.note ? ` · ${tx.expense.note}` : ""}</span>}
                  </td>
                  <td className={cn("text-end tabular-nums", tx.amount < 0 ? "text-foreground" : "text-emerald-600")}>{formatCurrency(tx.amount)}</td>
                  <td>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", tx.status === "MATCHED" ? "bg-emerald-500/15 text-emerald-600" : tx.status === "IGNORED" ? "bg-secondary text-muted-foreground" : "bg-amber-500/15 text-amber-600")}>
                      {t(`accounting.bank.status.${tx.status}`)}
                    </span>
                  </td>
                  <td className="space-x-3 text-end text-xs">
                    {tx.status === "UNMATCHED" && tx.amount < 0 && (
                      <button type="button" className="text-primary hover:underline" onClick={() => setPicking(picking === tx.id ? null : tx.id)}>{t("accounting.bank.match")}</button>
                    )}
                    {tx.status === "UNMATCHED" && (
                      <button type="button" className="text-muted-foreground hover:underline" onClick={() => setStatus.mutate({ id: tx.id, status: "IGNORED" })}>{t("accounting.bank.ignore")}</button>
                    )}
                    {tx.status !== "UNMATCHED" && (
                      <button type="button" className="text-muted-foreground hover:underline" onClick={() => setStatus.mutate({ id: tx.id, status: "UNMATCHED" })}>{t("accounting.bank.undo")}</button>
                    )}
                    {picking === tx.id && (
                      <div className="mt-2 flex flex-col gap-1 rounded-lg border border-border bg-card p-2 text-start">
                        {candidates.isLoading && <span className="text-muted-foreground">{t("accounting.bank.looking")}</span>}
                        {candidates.data?.length === 0 && <span className="text-muted-foreground">{t("accounting.bank.noCandidates")}</span>}
                        {candidates.data?.map((c) => (
                          <button key={c.id} type="button" className="rounded px-2 py-1 text-start hover:bg-secondary" onClick={() => match.mutate({ id: tx.id, expenseId: c.id })}>
                            {c.spentOn.slice(0, 10)} · {c.category} · {formatCurrency(Number(c.amount))}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("accounting.bank.empty")}</p>
        )}
      </Card>
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
    <div className={cn("flex justify-between py-1.5 text-sm", strong && "border-t border-border font-semibold")}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{formatCurrency(amount)}</span>
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
      <Input type="date" className="w-44" value={asOf} onChange={(e) => setAsOf(e.target.value)} aria-label={t("accounting.balance.asOf")} />
      {isLoading || !data ? (
        <Skeleton className="h-48" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 font-medium">{t("accounting.balance.assets")}</h3>
            {data.assets.map((a) => <Line key={a.label} {...a} />)}
            <Line label={t("accounting.balance.totalAssets")} amount={data.totalAssets} strong />
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 font-medium">{t("accounting.balance.liabilitiesEquity")}</h3>
            {data.liabilities.map((a) => <Line key={a.label} {...a} />)}
            <Line label={t("accounting.balance.totalLiabilities")} amount={data.totalLiabilities} strong />
            <Line label={t("accounting.balance.equity")} amount={data.equity} strong />
          </Card>
          <p className="text-xs text-muted-foreground md:col-span-2">{data.note}</p>
        </div>
      )}
    </div>
  );
}
