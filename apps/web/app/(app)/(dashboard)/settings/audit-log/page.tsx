"use client";

import { ChevronLeft, ChevronRight, ScrollText, X } from "lucide-react";
import { Fragment, useState } from "react";
import {
  ListCard,
  ResponsiveList,
  SettingsListBody,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toolbar } from "@/components/ui/toolbar";
import {
  useAuditLog,
  useAuditLogEntities,
  type AuditLogEntry,
} from "@/hooks/use-audit-log";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const PAGE_SIZE = 20;
const ALL = "__all__";

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
    <SettingsSection
      icon={ScrollText}
      title={t("settings.audit.title")}
      description={t("settings.audit.description")}
      actions={
        data ? (
          <Badge variant="neutral" className="tabular-nums">
            {t("settings.audit.entries", { n: formatNumber(data.total) })}
          </Badge>
        ) : null
      }
    >
      <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-4 sm:px-6">
        <Segmented
          size="sm"
          aria-label={t("settings.audit.entity")}
          value={filters.entity ?? ALL}
          onChange={(v) => setEntityFilter(v === ALL ? undefined : v)}
          options={[
            { value: ALL, label: t("common.all") },
            ...(entities ?? []).map((entity) => ({ value: entity, label: <bdi>{entity}</bdi> })),
          ]}
        />
        <Toolbar className="items-end gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
            <Label htmlFor="audit-from" className="text-xs text-muted-foreground">
              {t("common.from")}
            </Label>
            <Input
              id="audit-from"
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => setDateFilter("from", e.target.value)}
              className="w-full sm:w-44"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
            <Label htmlFor="audit-to" className="text-xs text-muted-foreground">
              {t("common.to")}
            </Label>
            <Input
              id="audit-to"
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => setDateFilter("to", e.target.value)}
              className="w-full sm:w-44"
            />
          </div>
          {filters.from || filters.to ? (
            <Button type="button" variant="ghost" size="sm" className="mb-0.5" onClick={clearDates}>
              <X className="size-3.5" />
              {t("settings.audit.clearDates")}
            </Button>
          ) : null}
        </Toolbar>
      </div>

      {isLoading ? (
        <SettingsListBody className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </SettingsListBody>
      ) : data && data.data.length > 0 ? (
        <>
          <ResponsiveList
            table={
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
            }
            cards={data.data.map((entry) => (
              <AuditLogCard key={entry.id} entry={entry} />
            ))}
          />

          <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 sm:px-6">
            <p className="text-sm text-muted-foreground tabular-nums">
              {t("common.pageOf", { page: data.page, pages: data.totalPages })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1 || isFetching}
                onClick={() => goToPage(data.page - 1)}
              >
                <ChevronLeft className="size-4 rtl:-scale-x-100" />
                <span className="hidden sm:inline">{t("common.previous")}</span>
                <span className="sr-only sm:hidden">{t("common.previous")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages || isFetching}
                onClick={() => goToPage(data.page + 1)}
              >
                <span className="hidden sm:inline">{t("common.next")}</span>
                <span className="sr-only sm:hidden">{t("common.next")}</span>
                <ChevronRight className="size-4 rtl:-scale-x-100" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <SettingsListBody>
          <EmptyState
            compact
            icon={ScrollText}
            title={t("settings.audit.emptyTitle")}
            description={t("settings.audit.emptyDescription")}
          />
        </SettingsListBody>
      )}
    </SettingsSection>
  );
}

function EntityRef({ entry }: { entry: AuditLogEntry }) {
  return (
    <bdi>
      {entry.entity}
      {entry.entityId ? (
        <span className="font-mono text-xs text-muted-foreground"> #{entry.entityId.slice(-8)}</span>
      ) : null}
    </bdi>
  );
}

function Metadata({ entry }: { entry: AuditLogEntry }) {
  return (
    <pre
      dir="ltr"
      className="max-h-64 overflow-auto rounded-xl bg-card p-3 text-start text-xs text-muted-foreground ring-1 ring-border/70"
    >
      {JSON.stringify(entry.metadata, null, 2)}
    </pre>
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
    <Fragment>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {entry.user?.name ?? t("settings.audit.system")}
        </TableCell>
        <TableCell>
          <Badge variant="neutral" className="font-mono">
            <bdi>{entry.action}</bdi>
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          <EntityRef entry={entry} />
        </TableCell>
        <TableCell className="text-muted-foreground tabular-nums">{formatDateTime(entry.createdAt)}</TableCell>
        <TableCell className="text-end">
          {hasMetadata ? (
            <Button variant="ghost" size="sm" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
              {expanded ? t("settings.audit.hide") : t("common.view")}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && hasMetadata ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="whitespace-normal bg-surface-2/50">
            <Metadata entry={entry} />
          </TableCell>
        </TableRow>
      ) : null}
    </Fragment>
  );
}

function AuditLogCard({ entry }: { entry: AuditLogEntry }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const hasMetadata = entry.metadata !== null && entry.metadata !== undefined;

  return (
    <ListCard className="gap-2">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="neutral" className="max-w-full font-mono">
          <bdi className="truncate">{entry.action}</bdi>
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDateTime(entry.createdAt)}</span>
      </div>
      <p className="text-sm text-foreground">
        <span className="font-medium">{entry.user?.name ?? t("settings.audit.system")}</span>
        <span className="text-muted-foreground"> · </span>
        <span className="text-muted-foreground">
          <EntityRef entry={entry} />
        </span>
      </p>
      {hasMetadata && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="-ms-2 self-start"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? t("settings.audit.hide") : t("common.view")}
          </Button>
          {expanded && <Metadata entry={entry} />}
        </>
      )}
    </ListCard>
  );
}
