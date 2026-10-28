"use client";

import { useState } from "react";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAuditLog,
  useAuditLogEntities,
  type AuditLogEntry,
} from "@/hooks/use-audit-log";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

interface Filters {
  entity?: string;
  from?: string;
  to?: string;
  page: number;
}

export default function AuditLogPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<Filters>({ page: 1 });
  const { data, isLoading, isFetching } = useAuditLog({
    ...filters,
    pageSize: PAGE_SIZE,
  });
  const { data: entities } = useAuditLogEntities();

  const setEntityFilter = (entity: string | undefined) =>
    setFilters((prev) => ({ ...prev, entity, page: 1 }));

  const setDateFilter = (key: "from" | "to", value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));

  const clearDates = () =>
    setFilters((prev) => ({ ...prev, from: undefined, to: undefined, page: 1 }));

  const goToPage = (page: number) => setFilters((prev) => ({ ...prev, page }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <SettingsTabs />

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-medium text-foreground">{t("settings.audit.title")}</h2>
            {data ? (
              <p className="text-sm text-muted-foreground">
                {t("settings.audit.entries", { n: formatNumber(data.total) })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EntityChip
              label={t("common.all")}
              active={!filters.entity}
              onClick={() => setEntityFilter(undefined)}
            />
            {entities?.map((entity) => (
              <EntityChip
                key={entity}
                label={entity}
                active={filters.entity === entity}
                onClick={() => setEntityFilter(entity)}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="audit-from">{t("common.from")}</Label>
              <Input
                id="audit-from"
                type="date"
                value={filters.from ?? ""}
                onChange={(e) => setDateFilter("from", e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="audit-to">{t("common.to")}</Label>
              <Input
                id="audit-to"
                type="date"
                value={filters.to ?? ""}
                onChange={(e) => setDateFilter("to", e.target.value)}
                className="w-40"
              />
            </div>
            {filters.from || filters.to ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearDates}>
                {t("settings.audit.clearDates")}
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("settings.audit.actor")}</TableHead>
                  <TableHead>{t("settings.audit.action")}</TableHead>
                  <TableHead>{t("settings.audit.entity")}</TableHead>
                  <TableHead>{t("settings.audit.timestamp")}</TableHead>
                  <TableHead className="text-end">{t("common.details")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((entry) => (
                  <AuditLogRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {t("common.pageOf", { page: data.page, pages: data.totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1 || isFetching}
                  onClick={() => goToPage(data.page - 1)}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages || isFetching}
                  onClick={() => goToPage(data.page + 1)}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("settings.audit.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("settings.audit.emptyDescription")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function EntityChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

// Owns its own expand/collapse state so toggling one row's JSON metadata
// never touches the parent list's state (and doesn't need an effect to
// "reset" anything — each row is keyed by entry.id, so a fresh mount already
// starts collapsed).
function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = entry.metadata !== null && entry.metadata !== undefined;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {entry.user?.name ?? t("settings.audit.system")}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-normal">
            <bdi>{entry.action}</bdi>
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          <bdi>
            {entry.entity}
            {entry.entityId ? <span className="text-xs"> #{entry.entityId.slice(-8)}</span> : null}
          </bdi>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDateTime(entry.createdAt)}
        </TableCell>
        <TableCell className="text-end">
          {hasMetadata ? (
            <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t("settings.audit.hide") : t("common.view")}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && hasMetadata ? (
        <TableRow>
          <TableCell colSpan={5} className="whitespace-normal bg-muted/30">
            <pre dir="ltr" className="max-h-64 overflow-auto rounded-lg bg-background p-3 text-xs text-muted-foreground">
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
