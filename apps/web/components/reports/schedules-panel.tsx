"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Mail, Pause, Play, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SELECT_CLASS, TABLE_CARD_HEAD } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

interface Schedule {
  id: string;
  reportKey: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  format: string;
  recipients: string[];
  isActive: boolean;
  lastSentAt: string | null;
  lastError: string | null;
}

const WHEN_KEYS = {
  DAILY: "reports.schedules.when.DAILY",
  WEEKLY: "reports.schedules.when.WEEKLY",
  MONTHLY: "reports.schedules.when.MONTHLY",
};

export function SchedulesPanel({
  branchId,
  reportKey,
  titles,
}: {
  branchId: string | null;
  reportKey: string;
  titles: Record<string, string>;
}) {
  const qc = useQueryClient();
  const { t } = useI18n();
  const [frequency, setFrequency] = useState<Schedule["frequency"]>("WEEKLY");
  const [format, setFormat] = useState("xlsx");
  const [recipients, setRecipients] = useState("");
  const { data } = useQuery({
    queryKey: ["report-schedules", branchId],
    queryFn: () => api.get<{ emailConfigured: boolean; schedules: Schedule[] }>(`/report-schedules?branchId=${branchId}`),
    enabled: !!branchId,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["report-schedules"] });
  const msg = (e: unknown) => (e instanceof ApiError ? e.message : t("common.error"));

  const create = useMutation({
    mutationFn: () =>
      api.post(`/report-schedules?branchId=${branchId}`, {
        reportKey,
        frequency,
        format,
        recipients: recipients.split(/[,\s;]+/).filter(Boolean),
      }),
    onSuccess: () => {
      setRecipients("");
      refresh();
      toast.success(t("reports.schedules.created"));
    },
    onError: (e) => toast.error(msg(e)),
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/report-schedules/${id}?branchId=${branchId}`, { isActive }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/report-schedules/${id}?branchId=${branchId}`),
    onSuccess: refresh,
  });
  const sendNow = useMutation({
    mutationFn: (id: string) => api.post(`/report-schedules/${id}/send?branchId=${branchId}`),
    onSuccess: () => {
      refresh();
      toast.success(t("reports.schedules.emailed"));
    },
    onError: (e) => toast.error(msg(e)),
  });
  return (
    <Card className="gap-0 py-0 print:hidden">
      <div className={TABLE_CARD_HEAD}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-status-gold-soft text-status-gold">
            <CalendarClock className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{t("reports.schedules.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("reports.schedules.help")}</p>
          </div>
        </div>
      </div>
      {data && !data.emailConfigured && (
        <p className="mx-4 mt-4 rounded-xl bg-status-warning-soft px-3 py-2 text-xs text-status-warning sm:mx-5">
          {t("reports.schedules.notConfigured")} (<code>EMAIL_API_KEY</code>, <code>EMAIL_FROM</code>)
        </p>
      )}
      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-[10rem_10rem_minmax(0,1fr)_auto]">
        <select aria-label={t("reports.schedules.frequency")} className={SELECT_CLASS} value={frequency} onChange={(e) => setFrequency(e.target.value as Schedule["frequency"])}>
          <option value="DAILY">{t("reports.schedules.freq.DAILY")}</option>
          <option value="WEEKLY">{t("reports.schedules.freq.WEEKLY")}</option>
          <option value="MONTHLY">{t("reports.schedules.freq.MONTHLY")}</option>
        </select>
        <select aria-label={t("reports.schedules.fileFormat")} className={SELECT_CLASS} value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
        </select>
        <Input aria-label={t("reports.schedules.recipients")} dir="ltr" className="sm:col-span-2 lg:col-span-1" placeholder={t("reports.schedules.recipientsPlaceholder")} value={recipients} onChange={(e) => setRecipients(e.target.value)} />
        <Button className="h-10 sm:col-span-2 lg:col-span-1" disabled={!recipients.trim() || create.isPending} onClick={() => create.mutate()}>
          <Mail className="size-4" />
          {t("reports.schedules.schedule")}
        </Button>
      </div>
      {data && data.schedules.length > 0 && (
        <ul className="flex flex-col divide-y divide-border/60 border-t border-border/70">
          {data.schedules.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 px-4 py-3 text-sm sm:px-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{titles[s.reportKey] ?? s.reportKey}</span>
                  <StatusPill tone={s.isActive ? "success" : "neutral"}>
                    {s.isActive ? t("common.active") : t("reports.schedules.paused")}
                  </StatusPill>
                  {s.lastError && <StatusPill tone="danger">{t("common.error")}</StatusPill>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.format.toUpperCase()} · {t(WHEN_KEYS[s.frequency])}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("reports.schedules.to")} <bdi>{s.recipients.join(", ")}</bdi>
                  {s.lastSentAt ? ` · ${t("reports.schedules.lastSent", { date: formatDateTime(s.lastSentAt) })}` : ""}
                  {s.lastError ? <span className="text-status-danger"> · {s.lastError}</span> : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:shrink-0">
                <Button size="sm" variant="outline" disabled={sendNow.isPending} onClick={() => sendNow.mutate(s.id)}>
                  <Send className="rtl:-scale-x-100" />
                  {t("reports.schedules.sendNow")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggle.mutate({ id: s.id, isActive: !s.isActive })}>
                  {s.isActive ? <Pause /> : <Play className="rtl:-scale-x-100" />}
                  {s.isActive ? t("reports.schedules.pause") : t("reports.schedules.resume")}
                </Button>
                <Button size="icon-sm" variant="ghost" className="text-muted-foreground hover:text-destructive" aria-label={t("common.delete")} onClick={() => remove.mutate(s.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
