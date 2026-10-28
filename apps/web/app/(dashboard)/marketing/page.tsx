"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/hooks/use-branch";
import {
  useAudience,
  useCampaigns,
  useCoupons,
  useMarketingActions,
  usePromotions,
} from "@/hooks/use-marketing";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
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
const discountText = (kind: string, value: string) =>
  kind === "PERCENT"
    ? translate("marketing.percentOff", { value: Number(value) })
    : translate("marketing.amountOff", { amount: formatCurrency(value) });

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
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input placeholder={t("marketing.coupons.codePlaceholder")} dir="ltr" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <select aria-label={t("common.type")} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
          <option value="PERCENT">{t("marketing.kind.PERCENT")}</option>
          <option value="FLAT">{t("marketing.kind.FLAT")}</option>
        </select>
        <Input placeholder={t("marketing.value")} inputMode="decimal" dir="ltr" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        <Input placeholder={t("marketing.coupons.minOrder")} inputMode="decimal" dir="ltr" value={f.minOrderAmount} onChange={(e) => setF({ ...f, minOrderAmount: e.target.value })} />
        <Input placeholder={t("marketing.coupons.maxUses")} inputMode="numeric" dir="ltr" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} />
        <Button onClick={submit} disabled={createCoupon.isPending}>{t("common.create")}</Button>
      </Card>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : data && data.length > 0 ? (
          data.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className={cn("font-mono font-medium", !c.isActive && "text-muted-foreground line-through")}>{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {discountText(c.kind, c.value)}
                  {Number(c.minOrderAmount) > 0 && ` · ${t("marketing.coupons.min", { amount: formatCurrency(c.minOrderAmount) })}`}
                  {` · ${t("marketing.coupons.used", { count: c.usageLimit ? `${c.usedCount} / ${c.usageLimit}` : c.usedCount })}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => couponActive.mutate({ id: c.id, isActive: !c.isActive })}>
                  {c.isActive ? t("common.disable") : t("common.enable")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => confirm(t("marketing.coupons.confirmDelete", { code: c.code })) && deleteCoupon.mutate(c.id)}>
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("marketing.coupons.empty")}</p>
        )}
      </Card>
      <p className="text-xs text-muted-foreground">
        {t("marketing.coupons.help")}
      </p>
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
      <Card className="flex flex-col gap-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input placeholder={t("marketing.happyHour.namePlaceholder")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select aria-label={t("common.type")} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
            <option value="PERCENT">{t("marketing.kind.PERCENT")}</option>
            <option value="FLAT">{t("marketing.kind.FLAT")}</option>
          </select>
          <Input placeholder={t("marketing.value")} inputMode="decimal" dir="ltr" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <Input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
          <Input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {DAYS.map((d) => (
            <button key={d} type="button" onClick={() => toggleDay(d)} className={cn("rounded-full border px-3 py-1 text-xs", f.days.includes(d) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
              {t(`common.dayShort.${d}`)}
            </button>
          ))}
          <Button className="ms-auto" onClick={submit} disabled={createPromotion.isPending}>{t("common.create")}</Button>
        </div>
      </Card>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : data && data.length > 0 ? (
          data.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className={cn("font-medium", !p.isActive && "text-muted-foreground line-through")}>{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {discountText(p.kind, p.value)} · {p.daysOfWeek.map((d) => t(`common.dayShort.${d}`)).join(t("marketing.listSeparator"))} · <bdi>{p.startTime}–{p.endTime}</bdi>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => promotionActive.mutate({ id: p.id, isActive: !p.isActive })}>
                  {p.isActive ? t("marketing.happyHour.pause") : t("marketing.happyHour.resume")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => confirm(t("marketing.confirmDelete", { name: p.name })) && deletePromotion.mutate(p.id)}>
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("marketing.happyHour.empty")}</p>
        )}
      </Card>
      <p className="text-xs text-muted-foreground">{t("marketing.happyHour.help")}</p>
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
      <Card className="flex flex-col gap-3 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder={t("marketing.campaigns.namePlaceholder")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select aria-label={t("marketing.campaigns.channel")} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
            <option value="SMS">{t("marketing.channel.SMS")}</option>
            <option value="WHATSAPP">{t("marketing.channel.WHATSAPP")}</option>
            <option value="EMAIL">{t("marketing.channel.EMAIL")}</option>
          </select>
          <select aria-label={t("marketing.campaigns.audience")} value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
            <option value="ALL">{t("marketing.segment.ALL")}</option>
            <option value="LOYAL">{t("marketing.segment.LOYAL")}</option>
            <option value="LAPSED">{t("marketing.segment.LAPSED")}</option>
            <option value="BIRTHDAY_MONTH">{t("marketing.segment.BIRTHDAY_MONTH")}</option>
          </select>
        </div>
        <textarea
          aria-label={t("marketing.campaigns.message")}
          placeholder={t("marketing.campaigns.message")}
          maxLength={600}
          value={f.message}
          onChange={(e) => setF({ ...f, message: e.target.value })}
          className="min-h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
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
      </Card>
      <Card className="flex flex-col divide-y divide-border p-2">
        {isLoading ? (
          <Skeleton className="m-4 h-12" />
        ) : data && data.length > 0 ? (
          data.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{c.name} <span className="text-xs text-muted-foreground">· {t(`marketing.channel.${c.channel}`)} · {t(`marketing.segment.${c.segment}`)}</span></p>
                <p className="text-xs text-muted-foreground">{c.message}</p>
                <p className="text-xs text-muted-foreground">
                  <AudienceCount branchId={branchId} id={c.id} />
                  {c.lastSentAt && ` · ${t("marketing.campaigns.lastSent", { date: formatDateTime(c.lastSentAt), n: c.lastSentCount ?? 0 })}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a href={`/api/v1/marketing/campaigns/${c.id}/audience.csv?branchId=${branchId}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-secondary">
                  <Download className="me-2 h-4 w-4" /> {t("marketing.campaigns.audienceCsv")}
                </a>
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
                  {t("marketing.campaigns.sendNow")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => confirm(t("marketing.confirmDelete", { name: c.name })) && deleteCampaign.mutate(c.id)}>{t("common.delete")}</Button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("marketing.campaigns.empty")}</p>
        )}
      </Card>
      <p className="text-xs text-muted-foreground">
        {t("marketing.campaigns.helpEmail")} <code>EMAIL_API_KEY</code>, <code>EMAIL_FROM</code>.{" "}
        {t("marketing.campaigns.helpWebhook")} <code>campaign.message</code> ({t("marketing.campaigns.helpWebhookPath")}).{" "}
        {t("marketing.campaigns.helpOptOut")}
      </p>
    </div>
  );
}

export default function MarketingPage() {
  const { branchId } = useBranch();
  const [tab, setTab] = useState<Tab>("coupons");
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("marketing.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("marketing.subtitle")}</p>
      </div>
      <div className="flex gap-2">
        {TABS.map((id) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-full border px-3.5 py-1 text-xs transition-colors", tab === id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary")}>
            {t(TAB_KEYS[id])}
          </button>
        ))}
      </div>
      {tab === "coupons" && <Coupons branchId={branchId} />}
      {tab === "happy hour" && <HappyHour branchId={branchId} />}
      {tab === "campaigns" && <Campaigns branchId={branchId} />}
    </div>
  );
}
