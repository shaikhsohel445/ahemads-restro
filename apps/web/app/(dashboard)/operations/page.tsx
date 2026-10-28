"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import { DocumentFiles } from "@/components/operations/document-files";
import { useDocument, useDocuments, useEquipment, useOpsActions } from "@/hooks/use-marketing";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const today = () => new Date().toISOString().slice(0, 10);
const CATEGORIES = ["SOP", "CONTRACT", "RECIPE", "PURCHASE", "OTHER"] as const;

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

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder={t("operations.equipment.name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder={t("operations.equipment.location")} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
        <Input placeholder={t("operations.equipment.interval")} inputMode="numeric" dir="ltr" value={f.serviceIntervalDays} onChange={(e) => setF({ ...f, serviceIntervalDays: e.target.value })} />
        <Input type="date" aria-label={t("operations.equipment.lastServiced")} value={f.lastServicedAt} onChange={(e) => setF({ ...f, lastServicedAt: e.target.value })} />
        <Button onClick={submit} disabled={createEquipment.isPending}>{t("common.add")}</Button>
      </Card>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : data && data.length > 0 ? (
          data.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {e.name}
                  {e.overdue && <span className="ms-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{t("operations.equipment.overdue")}</span>}
                  {e.dueSoon && <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t("operations.equipment.dueSoon")}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.location && `${e.location} · `}
                  {e.nextDueAt ? t("operations.equipment.nextService", { date: formatDate(e.nextDueAt) }) : t("operations.equipment.noSchedule")}
                  {e.lastServicedAt && ` · ${t("operations.equipment.last", { date: formatDate(e.lastServicedAt) })}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => logService.mutate({ id: e.id, servicedAt: today() }, { onSuccess: () => toast.success(t("operations.equipment.serviceLogged")), onError: (err) => toast.error(errMsg(err)) })}>
                  {t("operations.equipment.servicedToday")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => confirm(t("operations.equipment.confirmRetire", { name: e.name })) && retireEquipment.mutate(e.id)}>
                  {t("operations.equipment.retire")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("operations.equipment.empty")}</p>
        )}
      </Card>
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
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card className="flex flex-col gap-1 p-2">
        <Button size="sm" className="m-2" onClick={startNew}>{t("operations.documents.new")}</Button>
        {isLoading ? <Skeleton className="m-2 h-10" /> : data?.map((d) => (
          <button key={d.id} type="button" onClick={() => { setOpenId(d.id); setDraft(null); }} className={cn("rounded-lg px-3 py-2 text-start text-sm hover:bg-secondary", openId === d.id && "bg-secondary")}>
            <span className="block font-medium text-foreground">{d.title}</span>
            <span className="text-xs text-muted-foreground">{t(`operations.documents.category.${d.category}`)}</span>
          </button>
        ))}
        {data && data.length === 0 && <p className="p-3 text-xs text-muted-foreground">{t("operations.documents.empty")}</p>}
      </Card>
      <Card className="min-h-64 p-4">
        {draft ? (
          <div className="flex flex-col gap-3">
            <Input placeholder={t("operations.documents.title")} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <select aria-label={t("common.category")} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-fit rounded-lg border border-border bg-background px-2 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`operations.documents.category.${c}`)}</option>)}
            </select>
            <textarea aria-label={t("operations.documents.body")} className="min-h-56 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={save} disabled={!draft.title.trim() || !draft.body.trim()}>{t("common.save")}</Button>
              <Button variant="outline" onClick={() => setDraft(null)}>{t("common.cancel")}</Button>
            </div>
          </div>
        ) : doc ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{doc.title}</h2>
                <p className="text-xs text-muted-foreground">{t(`operations.documents.category.${doc.category}`)} · {t("operations.documents.updated", { date: formatDate(doc.updatedAt) })}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={startEdit}>{t("common.edit")}</Button>
                <Button size="sm" variant="outline" onClick={() => confirm(t("operations.documents.confirmDelete", { title: doc.title })) && deleteDocument.mutate(doc.id, { onSuccess: () => setOpenId(null) })}>{t("common.delete")}</Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{doc.body}</pre>
            <DocumentFiles branchId={branchId} docId={doc.id} files={doc.files ?? []} />
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("operations.documents.placeholder")}</p>
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
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("operations.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("operations.subtitle")}</p>
      </div>
      <div className="flex gap-2">
        {(["equipment", "documents"] as const).map((id) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-full border px-3.5 py-1 text-xs transition-colors", tab === id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary")}>
            {t(`operations.tab.${id}`)}
          </button>
        ))}
      </div>
      {tab === "equipment" ? <EquipmentTab branchId={branchId} /> : <DocumentsTab branchId={branchId} />}
    </div>
  );
}
