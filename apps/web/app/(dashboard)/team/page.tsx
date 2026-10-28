"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import {
  useHrActions,
  useLeave,
  usePay,
  usePayrollRun,
  usePayrollRuns,
  usePerformance,
  useShifts,
} from "@/hooks/use-hr";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber, formatTime } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const fmtDate = (s: string) => formatDate(s, { day: "numeric", month: "short" });
const fmtTime = (s: string) => formatTime(s, { hour: "2-digit", minute: "2-digit" });
const TABS = ["schedule", "leave", "payroll", "performance"] as const;
type Tab = (typeof TABS)[number];

function Schedule({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [from, setFrom] = useState(() => iso(new Date()));
  const to = iso(addDays(new Date(from), 6));
  const { data: shifts, isLoading } = useShifts(branchId, from, to);
  const { data: staff } = usePay(branchId);
  const { addShift, deleteShift } = useHrActions(branchId);
  const [form, setForm] = useState({ userId: "", date: iso(new Date()), start: "09:00", end: "17:00" });

  const submit = () => {
    if (!form.userId) return toast.error(t("team.pickStaff"));
    addShift.mutate(
      {
        userId: form.userId,
        startsAt: new Date(`${form.date}T${form.start}`).toISOString(),
        endsAt: new Date(`${form.date}T${form.end}`).toISOString(),
      },
      { onSuccess: () => toast.success(t("team.shiftAdded")), onError: (e) => toast.error(errMsg(e)) },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid gap-3 p-4 sm:grid-cols-5">
        <select
          aria-label={t("team.staff")}
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
        >
          <option value="">{t("team.staffPlaceholder")}</option>
          {staff?.map((s) => (
            <option key={s.userId} value={s.userId}>
              {s.name}
            </option>
          ))}
        </select>
        <Input type="date" aria-label={t("common.date")} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input type="time" aria-label={t("team.start")} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        <Input type="time" aria-label={t("team.end")} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        <Button onClick={submit} disabled={addShift.isPending}>
          {t("team.addShift")}
        </Button>
      </Card>
      <div className="flex items-center gap-2 text-sm">
        <Button size="sm" variant="outline" onClick={() => setFrom(iso(addDays(new Date(from), -7)))}>
          <span className="rtl:-scale-x-100">←</span> {t("common.previous")}
        </Button>
        <span className="text-muted-foreground">{fmtDate(from)} – {fmtDate(to)}</span>
        <Button size="sm" variant="outline" onClick={() => setFrom(iso(addDays(new Date(from), 7)))}>
          {t("common.next")} <span className="rtl:-scale-x-100">→</span>
        </Button>
      </div>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : shifts && shifts.length > 0 ? (
          shifts.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{s.user.name}</span>
              <span className="text-muted-foreground">
                {fmtDate(s.startsAt)} · {fmtTime(s.startsAt)} – {fmtTime(s.endsAt)}
              </span>
              <Button size="sm" variant="outline" onClick={() => deleteShift.mutate(s.id)}>
                {t("common.remove")}
              </Button>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("team.noShifts")}</p>
        )}
      </Card>
    </div>
  );
}

function Leave({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data, isLoading } = useLeave(branchId);
  const { decideLeave } = useHrActions(branchId);
  return (
    <Card className="flex flex-col divide-y divide-border p-2">
      {isLoading ? (
        <Skeleton className="m-4 h-12" />
      ) : data && data.length > 0 ? (
        data.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-foreground">
                {l.user?.name} · {t(`team.leaveType.${l.type}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {fmtDate(l.startDate)} – {fmtDate(l.endDate)}
                {l.reason && ` · ${l.reason}`}
              </p>
            </div>
            {l.status === "PENDING" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decideLeave.mutate({ id: l.id, status: "APPROVED" }, { onError: (e) => toast.error(errMsg(e)) })}>
                  {t("team.approve")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => decideLeave.mutate({ id: l.id, status: "REJECTED" }, { onError: (e) => toast.error(errMsg(e)) })}>
                  {t("team.reject")}
                </Button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{t(`team.leaveStatus.${l.status}`)}</span>
            )}
          </div>
        ))
      ) : (
        <p className="p-6 text-center text-sm text-muted-foreground">{t("team.noLeave")}</p>
      )}
    </Card>
  );
}

function RunDetail({ branchId, id }: { branchId: string | null; id: string }) {
  const { t } = useI18n();
  const { data } = usePayrollRun(branchId, id);
  const { finalizeRun, deleteRun } = useHrActions(branchId);
  if (!data) return <Skeleton className="h-24" />;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {fmtDate(data.periodStart)} – {fmtDate(data.periodEnd)} · {t(`team.runStatus.${data.status}`)} ·{" "}
          {t("team.tipPool", { amount: formatCurrency(data.tipPool) })}
        </p>
        {data.status === "DRAFT" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => finalizeRun.mutate(id, { onSuccess: () => toast.success(t("team.payrollFinalized")), onError: (e) => toast.error(errMsg(e)) })}>
              {t("team.finalize")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => deleteRun.mutate(id)}>
              {t("team.discardDraft")}
            </Button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-start text-xs text-muted-foreground">
            <tr>
              <th className="py-1">{t("team.staff")}</th>
              <th>{t("team.hours")}</th>
              <th>{t("team.base")}</th>
              <th>{t("team.leaveDeduction")}</th>
              <th>{t("team.tips")}</th>
              <th className="text-end">{t("team.net")}</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="py-1.5">{l.user.name}</td>
                <td>{formatNumber(l.hoursWorked)}</td>
                <td>{formatCurrency(l.basePay)}</td>
                <td>{formatCurrency(l.unpaidLeaveDeduction)}</td>
                <td>{formatCurrency(l.tipShare)}</td>
                <td className="text-end font-medium">{formatCurrency(l.netPay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-end text-sm font-semibold">
        {t("team.totalAmount", { amount: formatCurrency(data.totalNet) })}
      </p>
    </Card>
  );
}

function Payroll({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data: pay } = usePay(branchId);
  const { data: runs } = usePayrollRuns(branchId);
  const { setPay, createRun } = useHrActions(branchId);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    return { start: iso(first), end: iso(last) };
  });
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { payType: "MONTHLY" | "HOURLY"; rate: string }>>({});

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-sm font-medium text-foreground">{t("team.payRates")}</p>
        {pay?.map((p) => {
          const d = draft[p.userId] ?? { payType: p.payType ?? "MONTHLY", rate: String(p.rate ?? "") };
          return (
            <div key={p.userId} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-40 truncate">{p.name}</span>
              <select
                aria-label={t("team.payType")}
                value={d.payType}
                onChange={(e) => setDraft({ ...draft, [p.userId]: { ...d, payType: e.target.value as "MONTHLY" | "HOURLY" } })}
                className="rounded-lg border border-border bg-background px-2 py-1.5"
              >
                <option value="MONTHLY">{t("team.monthly")}</option>
                <option value="HOURLY">{t("team.hourly")}</option>
              </select>
              <Input
                className="w-28"
                inputMode="decimal"
                placeholder={t("team.rate")}
                aria-label={t("team.rate")}
                value={d.rate}
                onChange={(e) => setDraft({ ...draft, [p.userId]: { ...d, rate: e.target.value } })}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPay.mutate(
                    { userId: p.userId, payType: d.payType, rate: Number(d.rate) },
                    { onSuccess: () => toast.success(t("common.saved")), onError: (e) => toast.error(errMsg(e)) },
                  )
                }
              >
                {t("common.save")}
              </Button>
            </div>
          );
        })}
      </Card>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Input type="date" className="w-40" aria-label={t("common.from")} value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} />
        <Input type="date" className="w-40" aria-label={t("common.to")} value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} />
        <Button
          disabled={createRun.isPending}
          onClick={() =>
            createRun.mutate(
              { periodStart: period.start, periodEnd: period.end },
              {
                onSuccess: (r) => setOpen((r as { id: string }).id),
                onError: (e) => toast.error(errMsg(e)),
              },
            )
          }
        >
          {t("team.runPayroll")}
        </Button>
        <p className="w-full text-xs text-muted-foreground">
          {t("team.payrollHelp")}
        </p>
      </Card>
      {runs?.map((r) => (
        <div key={r.id} className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(open === r.id ? null : r.id)}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-start text-sm hover:bg-secondary"
          >
            <span>
              {fmtDate(r.periodStart)} – {fmtDate(r.periodEnd)} · {t(`team.runStatus.${r.status}`)}
            </span>
            <span className="font-medium">{formatCurrency(r.totalNet)}</span>
          </button>
          {open === r.id && <RunDetail branchId={branchId} id={r.id} />}
        </div>
      ))}
    </div>
  );
}

function Performance({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [range, setRange] = useState(() => ({ from: iso(addDays(new Date(), -29)), to: iso(new Date()) }));
  const { data, isLoading } = usePerformance(branchId, range.from, range.to);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input type="date" className="w-40" aria-label={t("common.from")} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <Input type="date" className="w-40" aria-label={t("common.to")} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
      </div>
      <Card className="overflow-x-auto p-4">
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-start text-xs text-muted-foreground">
              <tr>
                <th className="py-1">{t("team.staff")}</th>
                <th>{t("common.orders")}</th>
                <th>{t("team.sales")}</th>
                <th>{t("team.tips")}</th>
                <th>{t("team.hours")}</th>
                <th className="text-end">{t("team.salesPerHour")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((r) => (
                <tr key={r.userId} className="border-t border-border">
                  <td className="py-1.5">{r.name}</td>
                  <td>{formatNumber(r.orders)}</td>
                  <td>{formatCurrency(r.sales)}</td>
                  <td>{formatCurrency(r.tips)}</td>
                  <td>{formatNumber(r.hoursWorked)}</td>
                  <td className="text-end">{r.salesPerHour == null ? "—" : formatCurrency(r.salesPerHour)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default function TeamPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [tab, setTab] = useState<Tab>("schedule");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("team.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("team.subtitle")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs transition-colors",
              tab === key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {t(`team.tab.${key}`)}
          </button>
        ))}
      </div>
      {tab === "schedule" && <Schedule branchId={branchId} />}
      {tab === "leave" && <Leave branchId={branchId} />}
      {tab === "payroll" && <Payroll branchId={branchId} />}
      {tab === "performance" && <Performance branchId={branchId} />}
    </div>
  );
}
