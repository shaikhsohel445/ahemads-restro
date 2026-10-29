"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  Archive,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  FileText,
  FolderOpen,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  ScrollText,
  Trash2,
  TriangleAlert,
  Utensils,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentFiles } from "@/components/operations/document-files";
import { FIELD_LABEL, SELECT_CLASS } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, TONE_SOFT, type Tone } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useBranch } from "@/hooks/use-branch";
import { useDocument, useDocuments, useEquipment, useOpsActions, type EquipmentRow } from "@/hooks/use-marketing";
import { ApiError } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const today = () => new Date().toISOString().slice(0, 10);
const CATEGORIES = ["SOP", "CONTRACT", "RECIPE", "PURCHASE", "OTHER"] as const;
const CATEGORY_STYLE: Record<string, { icon: LucideIcon; tone: Tone }> = {
  SOP: { icon: ClipboardCheck, tone: "primary" },
  CONTRACT: { icon: FileSignature, tone: "gold" },
  RECIPE: { icon: Utensils, tone: "success" },
  PURCHASE: { icon: Receipt, tone: "info" },
  OTHER: { icon: FileText, tone: "neutral" },
};
const TONE_RING: Record<Tone, string> = {
  primary: "",
  success: "border-border/80",
  warning: "border-status-warning/40",
  danger: "border-status-danger/40",
  info: "border-border/80",
  neutral: "border-border/80",
  gold: "border-border/80",
};
const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-status-success",
  warning: "text-status-warning",
  danger: "text-status-danger",
  info: "text-status-info",
  neutral: "text-muted-foreground",
  gold: "text-status-gold",
};

/** Due-date tone and label for one piece of equipment. */
function dueInfo(e: EquipmentRow): { tone: Tone; label: string; detail: string } {
  if (!e.nextDueAt) {
    return { tone: "neutral", label: translate("operations.equipment.unscheduled"), detail: translate("operations.equipment.noSchedule") };
  }
  const days = Math.ceil((new Date(e.nextDueAt).getTime() - Date.now()) / 86_400_000);
  const detail =
    days < 0
      ? translate("operations.equipment.daysOverdue", { n: formatNumber(Math.abs(days)) })
      : days === 0
        ? translate("operations.equipment.dueToday")
        : translate("operations.equipment.inDays", { n: formatNumber(days) });
  if (e.overdue) return { tone: "danger", label: translate("operations.equipment.overdue"), detail };
  if (e.dueSoon) return { tone: "warning", label: translate("operations.equipment.dueSoon"), detail };
  return { tone: "success", label: translate("operations.equipment.onTrack"), detail };
}

function EquipmentTab({ branchId }: { branchId: string | null }) {
  const { data, isLoading } = useEquipment(branchId);
  const { createEquipment, retireEquipment, logService } = useOpsActions(branchId);
  const { t } = useI18n();
  const [f, setF] = useState({ name: "", location: "", serviceIntervalDays: "", lastServicedAt: "" });

  const submit = () =>
    createEquipment.mutate(
      {
        name: f.name,
        location: f.location || undefined,
        serviceIntervalDays: f.serviceIntervalDays ? Number(f.serviceIntervalDays) : undefined,
        lastServicedAt: f.lastServicedAt || undefined,
      },
      {
        onSuccess: () => { toast.success(t("operations.equipment.added")); setF({ name: "", location: "", serviceIntervalDays: "", lastServicedAt: "" }); },
        onError: (e) => toast.error(errMsg(e)),
      },
    );

  const overdue = data?.filter((e) => e.overdue).length ?? 0;
  const dueSoon = data?.filter((e) => e.dueSoon && !e.overdue).length ?? 0;
  // Most urgent first: overdue, due soon, then by next due date; unscheduled last.
  const sorted = data
    ? [...data].sort((a, b) => {
        const rank = (e: EquipmentRow) => (e.overdue ? 0 : e.dueSoon ? 1 : e.nextDueAt ? 2 : 3);
        return rank(a) - rank(b) || (a.nextDueAt ?? "").localeCompare(b.nextDueAt ?? "");
      })
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard className="col-span-2 lg:col-span-1" label={t("operations.equipment.tracked")} value={isLoading ? "…" : formatNumber(data?.length ?? 0)} icon={Wrench} />
        <StatCard label={t("operations.equipment.overdue")} value={isLoading ? "…" : formatNumber(overdue)} icon={TriangleAlert} tone={overdue > 0 ? "danger" : "neutral"} />
        <StatCard label={t("operations.equipment.dueSoon")} value={isLoading ? "…" : formatNumber(dueSoon)} icon={AlarmClock} tone={dueSoon > 0 ? "warning" : "neutral"} />
      </div>

      <Card className="px-4 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Plus className="size-4" />
          </span>
          {t("operations.equipment.newTitle")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <Input placeholder={t("operations.equipment.name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input placeholder={t("operations.equipment.location")} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          <Input placeholder={t("operations.equipment.interval")} inputMode="numeric" dir="ltr" value={f.serviceIntervalDays} onChange={(e) => setF({ ...f, serviceIntervalDays: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="eq-last" className={cn(FIELD_LABEL, "lg:sr-only")}>{t("operations.equipment.lastServiced")}</label>
            <Input id="eq-last" type="date" aria-label={t("operations.equipment.lastServiced")} value={f.lastServicedAt} onChange={(e) => setF({ ...f, lastServicedAt: e.target.value })} />
          </div>
          <Button className="h-10" onClick={submit} disabled={createEquipment.isPending}>
            <Plus className="size-4" />
            {t("common.add")}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : sorted && sorted.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
          {sorted.map((e) => {
            const due = dueInfo(e);
            return (
              <li key={e.id} className={cn("flex flex-col overflow-hidden rounded-2xl border bg-card", TONE_RING[due.tone])}>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{e.name}</p>
                      {e.location && (
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {e.location}
                        </p>
                      )}
                    </div>
                    <StatusPill tone={due.tone} pulse={due.tone === "danger"}>{due.label}</StatusPill>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-surface-2/70 p-3">
                    <CalendarClock className={cn("size-5 shrink-0", TONE_TEXT[due.tone])} />
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {e.nextDueAt ? formatDate(e.nextDueAt) : t("operations.equipment.unscheduled")}
                      </span>
                      <span className={cn("text-xs", e.nextDueAt ? TONE_TEXT[due.tone] : "text-muted-foreground")}>{due.detail}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {e.serviceIntervalDays ? <span>{t("operations.equipment.every", { n: formatNumber(e.serviceIntervalDays) })}</span> : null}
                    {e.lastServicedAt && <span>{t("operations.equipment.last", { date: formatDate(e.lastServicedAt) })}</span>}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/60 bg-surface-2/40 px-3 py-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => confirm(t("operations.equipment.confirmRetire", { name: e.name })) && retireEquipment.mutate(e.id)}
                  >
                    <Archive />
                    {t("operations.equipment.retire")}
                  </Button>
                  <Button
                    size="sm"
                    variant={e.overdue || e.dueSoon ? "default" : "outline"}
                    onClick={() => logService.mutate({ id: e.id, servicedAt: today() }, { onSuccess: () => toast.success(t("operations.equipment.serviceLogged")), onError: (err) => toast.error(errMsg(err)) })}
                  >
                    <CheckCircle2 />
                    {t("operations.equipment.servicedToday")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Wrench} title={t("operations.equipment.empty")} />
      )}
    </div>
  );
}

function DocumentsTab({ branchId }: { branchId: string | null }) {
  const { data, isLoading } = useDocuments(branchId);
  const { createDocument, updateDocument, deleteDocument } = useOpsActions(branchId);
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: doc } = useDocument(branchId, openId);
  const [draft, setDraft] = useState<{ title: string; category: string; body: string } | null>(null);

  const startNew = () => { setOpenId(null); setDraft({ title: "", category: "SOP", body: "" }); };
  const startEdit = () => doc && setDraft({ title: doc.title, category: doc.category, body: doc.body });
  const save = () => {
    if (!draft) return;
    const done = { onSuccess: () => { toast.success(t("common.saved")); setDraft(null); }, onError: (e: unknown) => toast.error(errMsg(e)) };
    if (openId) updateDocument.mutate({ id: openId, dto: draft }, done);
    else createDocument.mutate(draft, done);
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{t("operations.tab.documents")}</h2>
          <Button size="sm" onClick={startNew}>
            <Plus />
            {t("operations.documents.new")}
          </Button>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto p-2">
          {isLoading ? (
            <Skeleton className="m-2 h-12 rounded-xl" />
          ) : (
            data?.map((d) => {
              const { icon: Icon, tone } = CATEGORY_STYLE[d.category] ?? CATEGORY_STYLE.OTHER;
              const active = openId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => { setOpenId(d.id); setDraft(null); }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted",
                    active && "bg-accent hover:bg-accent",
                  )}
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONE_SOFT[tone])}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-foreground">{d.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {t(`operations.documents.category.${d.category}`)} · {formatDate(d.updatedAt)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
          {data && data.length === 0 && (
            <p className="p-3 text-center text-xs text-muted-foreground">{t("operations.documents.empty")}</p>
          )}
        </div>
      </Card>

      <Card className="min-h-72 px-4 sm:px-6">
        {draft ? (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <Input placeholder={t("operations.documents.title")} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <select aria-label={t("common.category")} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={SELECT_CLASS}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`operations.documents.category.${c}`)}</option>)}
              </select>
            </div>
            <textarea
              aria-label={t("operations.documents.body")}
              placeholder={t("operations.documents.body")}
              className="min-h-72 rounded-xl border border-input bg-card px-3 py-2 text-sm leading-relaxed shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={!draft.title.trim() || !draft.body.trim()}>{t("common.save")}</Button>
              <Button variant="outline" onClick={() => setDraft(null)}>{t("common.cancel")}</Button>
            </div>
          </div>
        ) : doc ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <StatusPill tone={(CATEGORY_STYLE[doc.category] ?? CATEGORY_STYLE.OTHER).tone}>
                  {t(`operations.documents.category.${doc.category}`)}
                </StatusPill>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{doc.title}</h2>
                <p className="text-xs text-muted-foreground">{t("operations.documents.updated", { date: formatDate(doc.updatedAt) })}</p>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <Button size="sm" variant="outline" onClick={startEdit}>
                  <Pencil />
                  {t("common.edit")}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={t("common.delete")}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => confirm(t("operations.documents.confirmDelete", { title: doc.title })) && deleteDocument.mutate(doc.id, { onSuccess: () => setOpenId(null) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <pre className="rounded-xl bg-surface-2/50 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">{doc.body}</pre>
            <DocumentFiles branchId={branchId} docId={doc.id} files={doc.files ?? []} />
          </div>
        ) : (
          <EmptyState className="border-0 bg-transparent" icon={FolderOpen} title={t("operations.documents.placeholder")} />
        )}
      </Card>
    </div>
  );
}

export default function OperationsPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<"equipment" | "documents">("equipment");
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("operations.title")} description={t("operations.subtitle")} icon={Wrench}>
        <Segmented<"equipment" | "documents">
          aria-label={t("operations.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "equipment", label: t("operations.tab.equipment"), icon: Wrench },
            { value: "documents", label: t("operations.tab.documents"), icon: ScrollText },
          ]}
        />
      </PageHeader>
      {tab === "equipment" ? <EquipmentTab branchId={branchId} /> : <DocumentsTab branchId={branchId} />}
    </div>
  );
}
