"use client";

import { Check, Copy, FileLock2, KeySquare, Pause, Play, Plus, ScrollText, Send, Trash2, Webhook } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import {
  ListCard,
  ResponsiveList,
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsField,
  SettingsListBody,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import type { Tone } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWebhookActions, useWebhookDeliveries, useWebhookEvents, useWebhooks } from "@/hooks/use-webhooks";
import { ApiError } from "@/lib/api";
import { translate, useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : translate("common.error"));

const DELIVERY_TONE: Record<string, Tone> = {
  SUCCESS: "success",
  FAILED: "danger",
  PENDING: "neutral",
};

function Deliveries({ id }: { id: string }) {
  const { t } = useI18n();
  const { data } = useWebhookDeliveries(id);
  if (!data) return <Skeleton className="h-10 rounded-xl" />;
  if (data.length === 0) return <p className="text-xs text-muted-foreground">{t("settings.webhooks.nothingSent")}</p>;
  return (
    <ul className="flex flex-col divide-y divide-border/60 rounded-xl bg-card text-xs ring-1 ring-border/70">
      {data.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
          <bdi className="font-mono text-foreground">{d.event}</bdi>
          <span className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground">
            <StatusPill tone={DELIVERY_TONE[d.status] ?? "neutral"}>
              {t(`settings.webhooks.status.${d.status}`)}
            </StatusPill>
            <span className="tabular-nums">
              {d.attempts === 1
                ? t("settings.webhooks.oneAttempt")
                : t("settings.webhooks.attempts", { n: d.attempts })}
            </span>
            {d.lastError && <span className="min-w-0 break-all text-status-danger">{d.lastError}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function WebhooksPage() {
  const { t } = useI18n();
  const { data: hooks, isLoading } = useWebhooks();
  const { data: allEvents } = useWebhookEvents();
  const { create, setActive, remove, test } = useWebhookActions();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState<string[]>(["order.paid"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (e: string) => setEvents(events.includes(e) ? events.filter((x) => x !== e) : [...events, e]);

  type Hook = NonNullable<typeof hooks>[number];

  const statusPill = (h: Hook) => (
    <StatusPill tone={h.isActive ? "success" : "neutral"}>
      {h.isActive ? t("common.active") : t("settings.webhooks.paused")}
    </StatusPill>
  );

  const hookActions = (h: Hook) => (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        disabled={test.isPending}
        onClick={() =>
          test.mutate(h.id, {
            onSuccess: (r) =>
              r.status === "SUCCESS"
                ? toast.success(t("settings.webhooks.receiverAnswered", { code: r.lastStatusCode ?? "" }))
                : toast.error(r.lastError ?? t("settings.webhooks.testRejected")),
            onError: (e) => toast.error(errMsg(e)),
          })
        }
      >
        <Send className="size-3.5 rtl:-scale-x-100" />
        {t("settings.webhooks.sendTest")}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        aria-expanded={open === h.id}
        onClick={() => setOpen(open === h.id ? null : h.id)}
      >
        <ScrollText className="size-3.5" />
        {t("settings.webhooks.log")}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setActive.mutate({ id: h.id, isActive: !h.isActive })}>
        {h.isActive ? <Pause className="size-3.5" /> : <Play className="size-3.5 rtl:-scale-x-100" />}
        {h.isActive ? t("settings.webhooks.pause") : t("settings.webhooks.resume")}
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={t("common.delete")}
        title={t("common.delete")}
        onClick={() => confirm(t("settings.webhooks.deleteConfirm")) && remove.mutate(h.id)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );

  const hookSummary = (h: Hook) => (
    <div className="min-w-0">
      <p
        dir="ltr"
        className={cn(
          "truncate text-start font-mono text-sm text-foreground",
          !h.isActive && "text-muted-foreground line-through",
        )}
      >
        {h.url}
      </p>
      {h.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{h.description}</p>}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {h.events.map((e) => (
          <bdi key={e} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border/60">
            {e}
          </bdi>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SettingsSection
        icon={Webhook}
        title={t("settings.webhooks.title")}
        description={t("settings.webhooks.description")}
      >
        {secret && (
          <SettingsBody divided={false}>
            <SettingsCallout icon={KeySquare} tone="gold" title={t("settings.webhooks.secretTitle")}>
              <p
                dir="ltr"
                className="mt-1 rounded-lg bg-card px-3 py-2 text-start font-mono text-xs break-all text-foreground select-all ring-1 ring-border/60"
              >
                {secret}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(secret).then(() => toast.success(t("common.copied")))}
                >
                  <Copy className="size-3.5" />
                  {t("common.copy")}
                </Button>
                <Button size="sm" onClick={() => setSecret(null)}>
                  <Check className="size-3.5" />
                  {t("common.done")}
                </Button>
              </div>
            </SettingsCallout>
          </SettingsBody>
        )}

        <SettingsBody>
          <SettingsField label={t("settings.webhooks.url")} htmlFor="wh-url">
            <Input
              id="wh-url"
              dir="ltr"
              className="font-mono"
              placeholder="https://example.com/restaurant-hook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </SettingsField>
          <SettingsField label={t("settings.webhooks.descriptionLabel")} htmlFor="wh-desc">
            <Input
              id="wh-desc"
              placeholder={t("settings.webhooks.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </SettingsField>
          <SettingsField label={t("settings.webhooks.events")} help={t("settings.webhooks.eventsHelp")}>
            <div className="flex flex-wrap gap-1.5">
              {allEvents?.map((e) => {
                const on = events.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(e)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1 rounded-full border px-3 font-mono text-xs transition-colors",
                      on
                        ? "border-primary/30 bg-accent text-accent-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {on && <Check className="size-3" />}
                    <bdi>{e}</bdi>
                  </button>
                );
              })}
            </div>
          </SettingsField>
        </SettingsBody>
        <SaveBar>
          <Button
            disabled={!url.trim() || events.length === 0 || create.isPending}
            onClick={() =>
              create.mutate(
                { url: url.trim(), events, description: description.trim() || undefined },
                {
                  onSuccess: (r) => {
                    setSecret(r.secret);
                    setUrl("");
                    setDescription("");
                  },
                  onError: (e) => toast.error(errMsg(e)),
                },
              )
            }
          >
            <Plus className="size-4" />
            {t("settings.webhooks.add")}
          </Button>
        </SaveBar>
      </SettingsSection>

      <SettingsSection
        icon={Send}
        title={t("settings.webhooks.endpoints")}
        actions={
          hooks && hooks.length > 0 ? (
            <span className="text-sm text-muted-foreground tabular-nums">{hooks.length}</span>
          ) : null
        }
      >
        {isLoading ? (
          <SettingsListBody>
            <Skeleton className="h-14 rounded-xl" />
          </SettingsListBody>
        ) : hooks && hooks.length > 0 ? (
          <ResponsiveList
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("settings.webhooks.url")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hooks.map((h) => (
                    <Fragment key={h.id}>
                      <TableRow>
                        <TableCell className="max-w-0 w-full whitespace-normal">{hookSummary(h)}</TableCell>
                        <TableCell className="align-top">{statusPill(h)}</TableCell>
                        <TableCell className="align-top">{hookActions(h)}</TableCell>
                      </TableRow>
                      {open === h.id && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={3} className="whitespace-normal bg-surface-2/50">
                            <Deliveries id={h.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            }
            cards={hooks.map((h) => (
              <ListCard key={h.id}>
                <div className="flex items-start justify-between gap-3">
                  {hookSummary(h)}
                  {statusPill(h)}
                </div>
                <div className="-mx-1 border-t border-border/70 pt-2">{hookActions(h)}</div>
                {open === h.id && <Deliveries id={h.id} />}
              </ListCard>
            ))}
          />
        ) : (
          <SettingsListBody>
            <EmptyState compact icon={Webhook} title={t("settings.webhooks.empty")} />
          </SettingsListBody>
        )}
      </SettingsSection>

      <SettingsSection icon={FileLock2} title={t("settings.webhooks.verifyTitle")} description={t("settings.webhooks.verifyIntro")}>
        <SettingsBody divided={false}>
          <code
            dir="ltr"
            className="block overflow-x-auto rounded-xl bg-surface-2 p-3 text-start font-mono text-xs leading-relaxed text-foreground ring-1 ring-border/70"
          >
            X-OrderRestro-Signature: t=&lt;unix time&gt;,v1=&lt;hex&gt;
            <br />
            v1 = HMAC-SHA256(secret, {"\"{t}.{raw body}\""})
          </code>
          <p className="text-sm text-muted-foreground">{t("settings.webhooks.verifyBody")}</p>
        </SettingsBody>
      </SettingsSection>
    </>
  );
}
