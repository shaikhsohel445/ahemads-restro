"use client";

import { CalendarDays, CalendarOff, Clock, LogIn, LogOut, Timer, Users, UserCheck } from "lucide-react";
import { useState } from "react";
import { InitialsAvatar } from "@/components/customers/initials-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useAttendance, useClock, useMyShift } from "@/hooks/use-attendance";
import { useBranch } from "@/hooks/use-branch";
import { useHrActions, useMyLeave } from "@/hooks/use-hr";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { formatDate, formatNumber, formatTime } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const time = (iso: string) => formatTime(iso, { hour: "2-digit", minute: "2-digit" });

function minutesBetween(from: string, to: string | null) {
  return Math.max(0, Math.round(((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) / 60000));
}

function duration(from: string, to: string | null) {
  const mins = minutesBetween(from, to);
  return translate("attendance.duration", { h: Math.floor(mins / 60), m: mins % 60 });
}

const LEAVE_TONE: Record<string, Tone> = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function LeaveRequestCard({ branchId }: { branchId: string | null }) {
  const { data: mine } = useMyLeave();
  const { requestLeave } = useHrActions(branchId);
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ type: "ANNUAL", startDate: today, endDate: today, reason: "" });
  return (
    <Card className="flex flex-col gap-4 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
          <CalendarOff className="size-4" />
        </span>
        {t("attendance.leave.title")}
      </h2>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          requestLeave.mutate(
            { ...f, reason: f.reason || undefined },
            {
              onSuccess: () => toast.success(t("attendance.leave.requested")),
              onError: (e) => toast.error(e instanceof ApiError ? e.message : t("attendance.leave.requestError")),
            },
          );
        }}
      >
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="leave-type">{t("attendance.leave.type")}</Label>
          <select
            id="leave-type"
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value })}
            className={selectClass}
          >
            <option value="ANNUAL">{t("attendance.leave.kind.ANNUAL")}</option>
            <option value="SICK">{t("attendance.leave.kind.SICK")}</option>
            <option value="UNPAID">{t("attendance.leave.kind.UNPAID")}</option>
            <option value="OTHER">{t("attendance.leave.kind.OTHER")}</option>
          </select>
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
          <Label htmlFor="leave-start">{t("attendance.leave.start")}</Label>
          <Input id="leave-start" type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
          <Label htmlFor="leave-end">{t("attendance.leave.end")}</Label>
          <Input id="leave-end" type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="leave-reason">{t("attendance.leave.reason")}</Label>
          <Input id="leave-reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
        </div>
        <Button type="submit" variant="outline" className="col-span-2" disabled={!branchId || requestLeave.isPending}>
          {t("attendance.leave.request")}
        </Button>
      </form>
      {mine && mine.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t("attendance.leave.mine")}
          </p>
          <ul className="flex flex-col gap-2">
            {mine.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/70 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t(`attendance.leave.kind.${l.type}`)}</p>
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {t("attendance.leave.range", { from: formatDate(l.startDate), to: formatDate(l.endDate) })}
                  </p>
                </div>
                <StatusPill tone={LEAVE_TONE[l.status] ?? "neutral"}>{t(`attendance.leave.status.${l.status}`)}</StatusPill>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default function AttendancePage() {
  const { branchId } = useBranch();
  const { data: me } = useCurrentUser();
  const canManage = hasPermission(me?.user, "attendance.manage");
  const { data: shift, isLoading: shiftLoading } = useMyShift();
  const { clockIn, clockOut } = useClock(branchId);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: records, isLoading } = useAttendance(branchId, date, canManage);
  const { t } = useI18n();

  const onShiftNow = (records ?? []).filter((r) => !r.clockOutAt).length;
  const totalMins = (records ?? []).reduce((s, r) => s + minutesBetween(r.clockInAt, r.clockOutAt), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("attendance.title")} description={t("attendance.subtitle")} icon={Clock} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* My shift — the clock in/out action is the hero of this page. */}
        <Card
          className={cn(
            "relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-5 sm:p-6 lg:col-span-7",
            shift && "border-primary/25 bg-accent/50",
          )}
        >
          {shiftLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-12 w-56 rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl sm:w-48" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={me?.user?.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{me?.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{t("attendance.myShift")}</p>
                  </div>
                </div>
                <StatusPill tone={shift ? "success" : "neutral"} pulse={!!shift}>
                  {shift ? t("attendance.status.on") : t("attendance.status.off")}
                </StatusPill>
              </div>

              <div>
                {shift ? (
                  <>
                    <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground sm:text-5xl">
                      {duration(shift.clockInAt, null)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("attendance.onShiftSince", { time: time(shift.clockInAt) })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {t("attendance.readyTitle")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{t("attendance.notClockedIn")}</p>
                  </>
                )}
              </div>

              {shift ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-card sm:w-fit sm:min-w-48"
                  disabled={clockOut.isPending}
                  onClick={() => clockOut.mutate()}
                >
                  <LogOut className="rtl:-scale-x-100" />
                  {t("attendance.clockOut")}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-fit sm:min-w-48"
                  disabled={!branchId || clockIn.isPending}
                  onClick={() => clockIn.mutate()}
                >
                  <LogIn className="rtl:-scale-x-100" />
                  {t("attendance.clockIn")}
                </Button>
              )}
            </>
          )}
        </Card>

        <div className="lg:col-span-5">
          <LeaveRequestCard branchId={branchId} />
        </div>
      </div>

      {canManage && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("attendance.team.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("attendance.team.subtitle")}</p>
            </div>
            <div className="relative w-full sm:w-52">
              <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label={t("common.date")}
                className="ps-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard
              label={t("attendance.team.present")}
              value={isLoading ? "—" : formatNumber(records?.length ?? 0)}
              icon={Users}
            />
            <StatCard
              label={t("attendance.team.onShiftNow")}
              value={isLoading ? "—" : formatNumber(onShiftNow)}
              icon={UserCheck}
              tone="success"
            />
            <StatCard
              className="col-span-2 sm:col-span-1"
              label={t("attendance.team.hours")}
              value={isLoading ? "—" : t("attendance.duration", { h: Math.floor(totalMins / 60), m: totalMins % 60 })}
              icon={Timer}
              tone="gold"
            />
          </div>

          <Card className="flex flex-col gap-0 rounded-2xl p-0">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : records && records.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border/70">
                {records.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <InitialsAvatar name={r.user.name} seed={r.user.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        <bdi>{time(r.clockInAt)}</bdi> –{" "}
                        {r.clockOutAt ? <bdi>{time(r.clockOutAt)}</bdi> : t("attendance.onShift")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {duration(r.clockInAt, r.clockOutAt)}
                      </span>
                      <StatusPill tone={r.clockOutAt ? "neutral" : "success"} pulse={!r.clockOutAt}>
                        {r.clockOutAt ? t("attendance.status.done") : t("attendance.status.on")}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={CalendarDays}
                title={t("attendance.empty")}
                className="m-4 border-0 bg-transparent"
              />
            )}
          </Card>
        </section>
      )}
    </div>
  );
}
