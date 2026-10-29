"use client";

import {
  BadgeDollarSign,
  CalendarClock,
  CalendarOff,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Plus,
  Trash2,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/customers/initials-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { type Tone } from "@/components/ui/stat-card";
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
  useHrActions,
  useLeave,
  usePay,
  usePayrollRun,
  usePayrollRuns,
  usePerformance,
  useShifts,
  type Shift,
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

const LEAVE_TONE: Record<string, Tone> = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };
const RUN_TONE: Record<string, Tone> = { DRAFT: "gold", FINALIZED: "success" };

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function SectionTitle({ icon: Icon, children }: { icon: typeof Plus; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  );
}

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

  // Group the week's shifts by calendar day (in the restaurant's time zone).
  const byDay = new Map<string, { key: string; label: string; shifts: Shift[] }>();
  for (const s of [...(shifts ?? [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const label = formatDate(s.startsAt, { weekday: "long", day: "numeric", month: "short" });
    const day = byDay.get(label);
    if (day) day.shifts.push(s);
    else byDay.set(label, { key: s.id, label, shifts: [s] });
  }
  const days = [...byDay.values()];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <Card className="flex flex-col gap-4 rounded-2xl p-5 lg:col-span-4 lg:self-start">
        <SectionTitle icon={Plus}>{t("team.addShift")}</SectionTitle>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="shift-staff">{t("team.staff")}</Label>
            <select
              id="shift-staff"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className={selectClass}
            >
              <option value="">{t("team.staffPlaceholder")}</option>
              {staff?.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="shift-date">{t("common.date")}</Label>
            <Input id="shift-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-start">{t("team.start")}</Label>
            <Input id="shift-start" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shift-end">{t("team.end")}</Label>
            <Input id="shift-end" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </div>
          <Button type="submit" className="col-span-2" disabled={addShift.isPending}>
            <Plus />
            {t("team.addShift")}
          </Button>
        </form>
      </Card>

      <div className="flex min-w-0 flex-col gap-3 lg:col-span-8">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card p-1.5">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t("common.previous")}
            title={t("common.previous")}
            onClick={() => setFrom(iso(addDays(new Date(from), -7)))}
          >
            <ChevronLeft className="rtl:-scale-x-100" />
          </Button>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {fmtDate(from)} – {fmtDate(to)}
          </span>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t("common.next")}
            title={t("common.next")}
            onClick={() => setFrom(iso(addDays(new Date(from), 7)))}
          >
            <ChevronRight className="rtl:-scale-x-100" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : days.length > 0 ? (
          days.map((day) => (
            <Card key={day.key} className="flex flex-col gap-0 rounded-2xl p-0">
              <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/50 px-4 py-2.5 sm:px-5">
                <span className="text-sm font-semibold text-foreground">{day.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {t("team.shiftCount", { n: formatNumber(day.shifts.length) })}
                </span>
              </div>
              <ul className="flex flex-col divide-y divide-border/70">
                {day.shifts.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <InitialsAvatar name={s.user.name} seed={s.user.id} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{s.user.name}</span>
                    <span className="shrink-0 rounded-lg bg-accent px-2 py-1 text-xs font-medium text-accent-foreground tabular-nums">
                      <bdi>
                        {fmtTime(s.startsAt)} – {fmtTime(s.endsAt)}
                      </bdi>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={t("common.remove")}
                      title={t("common.remove")}
                      onClick={() => deleteShift.mutate(s.id)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        ) : (
          <EmptyState icon={CalendarClock} title={t("team.noShifts")} />
        )}
      </div>
    </div>
  );
}

function Leave({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const { data, isLoading } = useLeave(branchId);
  const { decideLeave } = useHrActions(branchId);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) return <EmptyState icon={CalendarOff} title={t("team.noLeave")} />;
  return (
    <Card className="flex flex-col gap-0 rounded-2xl p-0">
      <ul className="flex flex-col divide-y divide-border/70">
        {data.map((l) => (
          <li key={l.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <InitialsAvatar name={l.user?.name} seed={l.user?.id ?? l.id} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                  <span className="truncate">{l.user?.name}</span>
                  <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                    {t(`team.leaveType.${l.type}`)}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="tabular-nums">
                    {fmtDate(l.startDate)} – {fmtDate(l.endDate)}
                  </span>
                  {l.reason && ` · ${l.reason}`}
                </p>
              </div>
            </div>
            {l.status === "PENDING" ? (
              <div className="flex gap-2 sm:shrink-0">
                <Button
                  className="flex-1 sm:flex-none"
                  onClick={() => decideLeave.mutate({ id: l.id, status: "APPROVED" }, { onError: (e) => toast.error(errMsg(e)) })}
                >
                  <Check />
                  {t("team.approve")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => decideLeave.mutate({ id: l.id, status: "REJECTED" }, { onError: (e) => toast.error(errMsg(e)) })}
                >
                  <X />
                  {t("team.reject")}
                </Button>
              </div>
            ) : (
              <StatusPill tone={LEAVE_TONE[l.status] ?? "neutral"} className="w-fit capitalize sm:shrink-0">
                {t(`team.leaveStatus.${l.status}`)}
              </StatusPill>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RunDetail({ branchId, id }: { branchId: string | null; id: string }) {
  const { t } = useI18n();
  const { data } = usePayrollRun(branchId, id);
  const { finalizeRun, deleteRun } = useHrActions(branchId);
  if (!data) return <Skeleton className="h-24 rounded-2xl" />;
  return (
    <div className="flex flex-col gap-3 border-t border-border/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("team.tipPool", { amount: formatCurrency(data.tipPool) })}
        </p>
        {data.status === "DRAFT" && (
          <div className="flex gap-2">
            <Button
              onClick={() =>
                finalizeRun.mutate(id, {
                  onSuccess: () => toast.success(t("team.payrollFinalized")),
                  onError: (e) => toast.error(errMsg(e)),
                })
              }
            >
              <Check />
              {t("team.finalize")}
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteRun.mutate(id)}>
              {t("team.discardDraft")}
            </Button>
          </div>
        )}
      </div>
      <div className="-mx-4 overflow-x-auto sm:-mx-5">
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="ps-4 sm:ps-5">{t("team.staff")}</TableHead>
              <TableHead className="text-end">{t("team.hours")}</TableHead>
              <TableHead className="text-end">{t("team.base")}</TableHead>
              <TableHead className="text-end">{t("team.leaveDeduction")}</TableHead>
              <TableHead className="text-end">{t("team.tips")}</TableHead>
              <TableHead className="pe-4 text-end sm:pe-5">{t("team.net")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.lines.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="ps-4 sm:ps-5">
                  <div className="flex items-center gap-2">
                    <InitialsAvatar name={l.user.name} seed={l.user.id} size="sm" />
                    <span className="font-medium text-foreground">{l.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-end tabular-nums">{formatNumber(l.hoursWorked)}</TableCell>
                <TableCell className="text-end tabular-nums">{formatCurrency(l.basePay)}</TableCell>
                <TableCell className="text-end tabular-nums text-muted-foreground">
                  {formatCurrency(l.unpaidLeaveDeduction)}
                </TableCell>
                <TableCell className="text-end tabular-nums">{formatCurrency(l.tipShare)}</TableCell>
                <TableCell className="pe-4 text-end font-semibold tabular-nums sm:pe-5">{formatCurrency(l.netPay)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-end text-sm font-semibold tabular-nums">
        {t("team.totalAmount", { amount: formatCurrency(data.totalNet) })}
      </p>
    </div>
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        <Card className="flex flex-col gap-4 rounded-2xl p-5">
          <SectionTitle icon={BadgeDollarSign}>{t("team.runPayroll")}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-from">{t("common.from")}</Label>
              <Input id="pay-from" type="date" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-to">{t("common.to")}</Label>
              <Input id="pay-to" type="date" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} />
            </div>
          </div>
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
          <p className="text-xs text-muted-foreground">{t("team.payrollHelp")}</p>
        </Card>

        <Card className="flex flex-col gap-0 rounded-2xl p-0">
          <div className="p-5 pb-3">
            <SectionTitle icon={UsersRound}>{t("team.payRates")}</SectionTitle>
          </div>
          <ul className="flex flex-col divide-y divide-border/70">
            {pay?.map((p) => {
              const d = draft[p.userId] ?? { payType: p.payType ?? "MONTHLY", rate: String(p.rate ?? "") };
              return (
                <li key={p.userId} className="flex flex-col gap-2 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <InitialsAvatar name={p.name} seed={p.userId} size="sm" />
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={t("team.payType")}
                      value={d.payType}
                      onChange={(e) =>
                        setDraft({ ...draft, [p.userId]: { ...d, payType: e.target.value as "MONTHLY" | "HOURLY" } })
                      }
                      className={cn(selectClass, "w-auto min-w-0 flex-1")}
                    >
                      <option value="MONTHLY">{t("team.monthly")}</option>
                      <option value="HOURLY">{t("team.hourly")}</option>
                    </select>
                    <Input
                      className="w-28 shrink-0"
                      inputMode="decimal"
                      dir="ltr"
                      placeholder={t("team.rate")}
                      aria-label={t("team.rate")}
                      value={d.rate}
                      onChange={(e) => setDraft({ ...draft, [p.userId]: { ...d, rate: e.target.value } })}
                    />
                    <Button
                      variant="outline"
                      className="shrink-0"
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
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:col-span-7">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">{t("team.payrollRuns")}</h2>
        {runs && runs.length > 0 ? (
          runs.map((r) => {
            const isOpen = open === r.id;
            return (
              <Card key={r.id} className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className="flex items-center gap-3 px-4 py-3.5 text-start text-sm transition-colors hover:bg-surface-2/60 sm:px-5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
                    <BadgeDollarSign className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-semibold text-foreground tabular-nums">
                      {fmtDate(r.periodStart)} – {fmtDate(r.periodEnd)}
                    </span>
                    <StatusPill tone={RUN_TONE[r.status] ?? "neutral"} className="h-5 w-fit px-2 text-[11px] capitalize">
                      {t(`team.runStatus.${r.status}`)}
                    </StatusPill>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">{formatCurrency(r.totalNet)}</span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && <RunDetail branchId={branchId} id={r.id} />}
              </Card>
            );
          })
        ) : (
          <EmptyState compact icon={BadgeDollarSign} title={t("team.noRuns")} />
        )}
      </div>
    </div>
  );
}

function Performance({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [range, setRange] = useState(() => ({ from: iso(addDays(new Date(), -29)), to: iso(new Date()) }));
  const { data, isLoading } = usePerformance(branchId, range.from, range.to);
  const topSales = Math.max(0, ...(data ?? []).map((r) => r.sales));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full grid-cols-2 gap-3 sm:w-fit">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perf-from">{t("common.from")}</Label>
          <Input id="perf-from" type="date" className="sm:w-44" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="perf-to">{t("common.to")}</Label>
          <Input id="perf-to" type="date" className="sm:w-44" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </div>
      </div>
      <Card className="flex min-w-0 flex-col gap-0 rounded-2xl p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[40rem]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-4 sm:ps-5">{t("team.staff")}</TableHead>
                  <TableHead className="text-end">{t("common.orders")}</TableHead>
                  <TableHead className="text-end">{t("team.sales")}</TableHead>
                  <TableHead className="text-end">{t("team.tips")}</TableHead>
                  <TableHead className="text-end">{t("team.hours")}</TableHead>
                  <TableHead className="pe-4 text-end sm:pe-5">{t("team.salesPerHour")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => {
                  const isTop = topSales > 0 && r.sales === topSales;
                  return (
                    <TableRow key={r.userId}>
                      <TableCell className="ps-4 sm:ps-5">
                        <div className="flex items-center gap-2">
                          <InitialsAvatar name={r.name} seed={r.userId} size="sm" />
                          <span className="font-medium text-foreground">{r.name}</span>
                          {isTop && (
                            <Trophy className="size-3.5 text-gold" aria-label={t("team.topSeller")} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{formatNumber(r.orders)}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold tabular-nums">{formatCurrency(r.sales)}</span>
                          <span className="h-1 w-20 overflow-hidden rounded-full bg-surface-2">
                            <span
                              className="block h-full rounded-full bg-chart-1"
                              style={{ width: `${topSales > 0 ? (r.sales / topSales) * 100 : 0}%` }}
                            />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{formatCurrency(r.tips)}</TableCell>
                      <TableCell className="text-end tabular-nums">{formatNumber(r.hoursWorked)}</TableCell>
                      <TableCell className="pe-4 text-end tabular-nums sm:pe-5">
                        {r.salesPerHour == null ? "—" : formatCurrency(r.salesPerHour)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState compact icon={Gauge} title={t("team.noPerformance")} className="m-4 border-0 bg-transparent" />
        )}
      </Card>
    </div>
  );
}

const TAB_ICON = { schedule: CalendarClock, leave: CalendarOff, payroll: BadgeDollarSign, performance: Gauge };

export default function TeamPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const [tab, setTab] = useState<Tab>("schedule");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("team.title")} description={t("team.subtitle")} icon={UsersRound}>
        <Segmented
          aria-label={t("team.title")}
          value={tab}
          onChange={setTab}
          options={TABS.map((key) => ({ value: key, label: t(`team.tab.${key}`), icon: TAB_ICON[key] }))}
        />
      </PageHeader>
      {tab === "schedule" && <Schedule branchId={branchId} />}
      {tab === "leave" && <Leave branchId={branchId} />}
      {tab === "payroll" && <Payroll branchId={branchId} />}
      {tab === "performance" && <Performance branchId={branchId} />}
    </div>
  );
}
