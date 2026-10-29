"use client";

import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Download,
  Info,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Pause,
  Play,
  Plus,
  Send,
  TicketPercent,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SELECT_CLASS } from "@/components/reports/table-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { useBranch } from "@/hooks/use-branch";
import {
  useAudience,
  useCampaigns,
  useCoupons,
  useMarketingActions,
  usePromotions,
} from "@/hooks/use-marketing";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));
const DAYS = [0, 1, 2, 3, 4, 5, 6];
const TABS = ["coupons", "happy hour", "campaigns"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS: Record<Tab, string> = {
  coupons: "marketing.tab.coupons",
  "happy hour": "marketing.tab.happyHour",
  campaigns: "marketing.tab.campaigns",
};
const TAB_ICONS: Record<Tab, LucideIcon> = {
  coupons: TicketPercent,
  "happy hour": Clock,
  campaigns: Send,
};
const CHANNEL_ICON: Record<string, LucideIcon> = {
  SMS: MessageSquareText,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
};
const discountText = (kind: string, value: string) =>
  kind === "PERCENT"
    ? translate("marketing.percentOff", { value: Number(value) })
    : translate("marketing.amountOff", { amount: formatCurrency(value) });

const CARD_GRID = "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3";

function ListSkeleton() {
  return (
    <div className={CARD_GRID}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="px-4 sm:px-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Plus className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Help({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-xl bg-surface-2/70 px-3 py-2.5 text-xs text-muted-foreground">
      <Info className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Coupons({ branchId }: { branchId: string | null }) {
  const { data, isLoading } = useCoupons(branchId);
  const { createCoupon, couponActive, deleteCoupon } = useMarketingActions(branchId);
  const { t } = useI18n();
  const [f, setF] = useState({ code: "", kind: "PERCENT", value: "", minOrderAmount: "", usageLimit: "" });

  const submit = () => {
    createCoupon.mutate(
      {
        code: f.code,
        kind: f.kind,
        value: Number(f.value),
        minOrderAmount: f.minOrderAmount ? Number(f.minOrderAmount) : 0,
        usageLimit: f.usageLimit ? Number(f.usageLimit) : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("marketing.coupons.created"));
          setF({ ...f, code: "", value: "", minOrderAmount: "", usageLimit: "" });
        },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <FormCard title={t("marketing.coupons.newTitle")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
          <Input placeholder={t("marketing.coupons.codePlaceholder")} dir="ltr" className="font-mono uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
          <select aria-label={t("common.type")} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={SELECT_CLASS}>
            <option value="PERCENT">{t("marketing.kind.PERCENT")}</option>
            <option value="FLAT">{t("marketing.kind.FLAT")}</option>
          </select>
          <Input placeholder={t("marketing.value")} inputMode="decimal" dir="ltr" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <Input placeholder={t("marketing.coupons.minOrder")} inputMode="decimal" dir="ltr" value={f.minOrderAmount} onChange={(e) => setF({ ...f, minOrderAmount: e.target.value })} />
          <Input placeholder={t("marketing.coupons.maxUses")} inputMode="numeric" dir="ltr" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} />
          <Button className="h-10" onClick={submit} disabled={createCoupon.isPending}>
            <Plus className="size-4" />
            {t("common.create")}
          </Button>
        </div>
      </FormCard>

      {isLoading ? (
        <ListSkeleton />
      ) : data && data.length > 0 ? (
        <ul className={CARD_GRID}>
          {data.map((c) => {
            const pct = c.usageLimit ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : null;
            return (
              <li
                key={c.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card",
                  !c.isActive && "opacity-75",
                )}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span
                      dir="ltr"
                      className={cn(
                        "w-fit rounded-lg border border-dashed border-gold/60 bg-status-gold-soft px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-status-gold",
                        !c.isActive && "line-through",
                      )}
                    >
                      {c.code}
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-foreground">{discountText(c.kind, c.value)}</span>
                  </div>
                  <StatusPill tone={c.isActive ? "success" : "neutral"}>
                    {c.isActive ? t("common.active") : t("common.disabled")}
                  </StatusPill>
                </div>
                <div className="flex flex-col gap-2 px-4 pb-4 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {Number(c.minOrderAmount) > 0 && (
                      <span>{t("marketing.coupons.min", { amount: formatCurrency(c.minOrderAmount) })}</span>
                    )}
                    <span className="tabular-nums">
                      {t("marketing.coupons.used", { count: c.usageLimit ? `${c.usedCount} / ${c.usageLimit}` : c.usedCount })}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden>
                      <div
                        className={cn("h-full rounded-full", pct >= 100 ? "bg-status-danger" : pct >= 80 ? "bg-status-warning" : "bg-primary")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/60 bg-surface-2/40 px-3 py-2">
                  <Button size="sm" variant="ghost" onClick={() => couponActive.mutate({ id: c.id, isActive: !c.isActive })}>
                    {c.isActive ? <Pause /> : <Play className="rtl:-scale-x-100" />}
                    {c.isActive ? t("common.disable") : t("common.enable")}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.delete")}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => confirm(t("marketing.coupons.confirmDelete", { code: c.code })) && deleteCoupon.mutate(c.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={TicketPercent} title={t("marketing.coupons.empty")} />
      )}
      <Help>{t("marketing.coupons.help")}</Help>
    </div>
  );
}

function HappyHour({ branchId }: { branchId: string | null }) {
  const { data, isLoading } = usePromotions(branchId);
  const { createPromotion, promotionActive, deletePromotion } = useMarketingActions(branchId);
  const { t } = useI18n();
  const [f, setF] = useState({ name: "", kind: "PERCENT", value: "", start: "16:00", end: "19:00", days: [1, 2, 3, 4, 5] as number[] });
  const toggleDay = (d: number) => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] });

  const submit = () =>
    createPromotion.mutate(
      { name: f.name, kind: f.kind, value: Number(f.value), daysOfWeek: f.days, startTime: f.start, endTime: f.end },
      {
        onSuccess: () => { toast.success(t("marketing.happyHour.created")); setF({ ...f, name: "", value: "" }); },
        onError: (e) => toast.error(errMsg(e)),
      },
    );

  return (
    <div className="flex flex-col gap-4">
      <FormCard title={t("marketing.happyHour.newTitle")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <Input className="sm:col-span-2 lg:col-span-1" placeholder={t("marketing.happyHour.namePlaceholder")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select aria-label={t("common.type")} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={SELECT_CLASS}>
            <option value="PERCENT">{t("marketing.kind.PERCENT")}</option>
            <option value="FLAT">{t("marketing.kind.FLAT")}</option>
          </select>
          <Input placeholder={t("marketing.value")} inputMode="decimal" dir="ltr" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <Input type="time" aria-label={t("common.from")} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
          <Input type="time" aria-label={t("common.to")} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("marketing.happyHour.days")}>
            {DAYS.map((d) => {
              const on = f.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "h-9 min-w-11 rounded-xl px-3 text-xs font-medium transition-colors",
                    on
                      ? "bg-accent text-accent-foreground ring-1 ring-primary/30"
                      : "bg-surface-2 text-muted-foreground ring-1 ring-border/70 hover:text-foreground",
                  )}
                >
                  {t(`common.dayShort.${d}`)}
                </button>
              );
            })}
          </div>
          <Button className="h-10" onClick={submit} disabled={createPromotion.isPending}>
            <Plus className="size-4" />
            {t("common.create")}
          </Button>
        </div>
      </FormCard>

      {isLoading ? (
        <ListSkeleton />
      ) : data && data.length > 0 ? (
        <ul className={CARD_GRID}>
          {data.map((p) => (
            <li
              key={p.id}
              className={cn("flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card", !p.isActive && "opacity-75")}
            >
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={cn("truncate font-medium text-foreground", !p.isActive && "line-through")}>{p.name}</p>
                    <p className="text-lg font-semibold tracking-tight text-foreground">{discountText(p.kind, p.value)}</p>
                  </div>
                  <StatusPill tone={p.isActive ? "success" : "neutral"}>
                    {p.isActive ? t("common.active") : t("marketing.paused")}
                  </StatusPill>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="size-4 text-muted-foreground" />
                  <bdi dir="ltr" className="tabular-nums">{p.startTime}–{p.endTime}</bdi>
                </div>
                <div className="flex flex-wrap gap-1" aria-label={p.daysOfWeek.map((d) => t(`common.dayShort.${d}`)).join(t("marketing.listSeparator"))}>
                  {DAYS.map((d) => (
                    <span
                      key={d}
                      aria-hidden
                      className={cn(
                        "flex h-6 min-w-8 items-center justify-center rounded-md px-1.5 text-[11px] font-medium",
                        p.daysOfWeek.includes(d) ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted-foreground/60",
                      )}
                    >
                      {t(`common.dayShort.${d}`)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/60 bg-surface-2/40 px-3 py-2">
                <Button size="sm" variant="ghost" onClick={() => promotionActive.mutate({ id: p.id, isActive: !p.isActive })}>
                  {p.isActive ? <Pause /> : <Play className="rtl:-scale-x-100" />}
                  {p.isActive ? t("marketing.happyHour.pause") : t("marketing.happyHour.resume")}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={t("common.delete")}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => confirm(t("marketing.confirmDelete", { name: p.name })) && deletePromotion.mutate(p.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Clock} title={t("marketing.happyHour.empty")} />
      )}
      <Help>{t("marketing.happyHour.help")}</Help>
    </div>
  );
}

function AudienceCount({ branchId, id }: { branchId: string | null; id: string }) {
  const { data } = useAudience(branchId, id);
  const { t } = useI18n();
  return <span>{data ? t("marketing.campaigns.recipients", { n: data.count }) : "…"}</span>;
}

function Campaigns({ branchId }: { branchId: string | null }) {
  const { data, isLoading } = useCampaigns(branchId);
  const { createCampaign, deleteCampaign, sendCampaign } = useMarketingActions(branchId);
  const { t } = useI18n();
  const [f, setF] = useState({ name: "", channel: "SMS", segment: "ALL", message: "" });

  return (
    <div className="flex flex-col gap-4">
      <FormCard title={t("marketing.campaigns.newTitle")}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder={t("marketing.campaigns.namePlaceholder")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select aria-label={t("marketing.campaigns.channel")} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} className={SELECT_CLASS}>
            <option value="SMS">{t("marketing.channel.SMS")}</option>
            <option value="WHATSAPP">{t("marketing.channel.WHATSAPP")}</option>
            <option value="EMAIL">{t("marketing.channel.EMAIL")}</option>
          </select>
          <select aria-label={t("marketing.campaigns.audience")} value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })} className={SELECT_CLASS}>
            <option value="ALL">{t("marketing.segment.ALL")}</option>
            <option value="LOYAL">{t("marketing.segment.LOYAL")}</option>
            <option value="LAPSED">{t("marketing.segment.LAPSED")}</option>
            <option value="BIRTHDAY_MONTH">{t("marketing.segment.BIRTHDAY_MONTH")}</option>
          </select>
        </div>
        <div className="relative">
          <textarea
            aria-label={t("marketing.campaigns.message")}
            placeholder={t("marketing.campaigns.message")}
            maxLength={600}
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
            className="min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 pb-6 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <span className="pointer-events-none absolute end-3 bottom-2 text-[11px] text-muted-foreground tabular-nums">
            {formatNumber(f.message.length)} / {formatNumber(600)}
          </span>
        </div>
        <div>
          <Button
            disabled={createCampaign.isPending}
            onClick={() =>
              createCampaign.mutate(f, {
                onSuccess: () => { toast.success(t("marketing.campaigns.saved")); setF({ ...f, name: "", message: "" }); },
                onError: (e) => toast.error(errMsg(e)),
              })
            }
          >
            {t("marketing.campaigns.save")}
          </Button>
        </div>
      </FormCard>

      {isLoading ? (
        <ListSkeleton />
      ) : data && data.length > 0 ? (
        <ul className={CARD_GRID}>
          {data.map((c) => {
            const ChannelIcon = CHANNEL_ICON[c.channel] ?? Send;
            return (
              <li key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card">
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <ChannelIcon className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{t(`marketing.channel.${c.channel}`)}</p>
                      </div>
                    </div>
                    <StatusPill tone={c.lastSentAt ? "success" : "neutral"}>
                      {c.lastSentAt ? t("marketing.campaigns.status.sent") : t("marketing.campaigns.status.draft")}
                    </StatusPill>
                  </div>
                  <p className="line-clamp-3 rounded-xl bg-surface-2/70 px-3 py-2 text-sm whitespace-pre-wrap text-foreground/90">{c.message}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {t(`marketing.segment.${c.segment}`)} · <AudienceCount branchId={branchId} id={c.id} />
                    </span>
                    {c.lastSentAt && (
                      <span>{t("marketing.campaigns.lastSent", { date: formatDateTime(c.lastSentAt), n: c.lastSentCount ?? 0 })}</span>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-border/60 bg-surface-2/40 px-3 py-2">
                  <a
                    href={`/api/v1/marketing/campaigns/${c.id}/audience.csv?branchId=${branchId}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium text-foreground hover:bg-muted"
                  >
                    <Download className="size-3.5" /> {t("marketing.campaigns.audienceCsv")}
                  </a>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("common.delete")}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => confirm(t("marketing.confirmDelete", { name: c.name })) && deleteCampaign.mutate(c.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    disabled={sendCampaign.isPending}
                    onClick={() =>
                      confirm(t("marketing.campaigns.confirmSend", { name: c.name })) &&
                      sendCampaign.mutate(c.id, {
                        onSuccess: (r) => toast.success(t("marketing.campaigns.sent", { n: r.sent }) + (r.failed ? t("marketing.campaigns.sentFailed", { n: r.failed }) : "")),
                        onError: (e) => toast.error(errMsg(e)),
                      })
                    }
                  >
                    <Send className="rtl:-scale-x-100" />
                    {t("marketing.campaigns.sendNow")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Megaphone} title={t("marketing.campaigns.empty")} />
      )}
      <Help>
        {t("marketing.campaigns.helpEmail")} <code>EMAIL_API_KEY</code>, <code>EMAIL_FROM</code>.{" "}
        {t("marketing.campaigns.helpWebhook")} <code>campaign.message</code> ({t("marketing.campaigns.helpWebhookPath")}).{" "}
        {t("marketing.campaigns.helpOptOut")}
      </Help>
    </div>
  );
}

export default function MarketingPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<Tab>("coupons");
  const { t } = useI18n();
  const { data: coupons } = useCoupons(branchId);
  const { data: promotions } = usePromotions(branchId);
  const { data: campaigns } = useCampaigns(branchId);
  const counts: Record<Tab, number | undefined> = {
    coupons: coupons?.filter((c) => c.isActive).length,
    "happy hour": promotions?.filter((p) => p.isActive).length,
    campaigns: campaigns?.length,
  };
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("marketing.title")} description={t("marketing.subtitle")} icon={Megaphone}>
        <Segmented<Tab>
          aria-label={t("marketing.title")}
          value={tab}
          onChange={setTab}
          options={TABS.map((id) => ({ value: id, label: t(TAB_KEYS[id]), icon: TAB_ICONS[id], count: counts[id] }))}
        />
      </PageHeader>
      {tab === "coupons" && <Coupons branchId={branchId} />}
      {tab === "happy hour" && <HappyHour branchId={branchId} />}
      {tab === "campaigns" && <Campaigns branchId={branchId} />}
    </div>
  );
}
