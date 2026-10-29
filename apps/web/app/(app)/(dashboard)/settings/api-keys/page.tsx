"use client";

import Link from "next/link";
import { Bot, KeyRound, Plug, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateIntegrationKeyDialog } from "@/components/settings/create-integration-key-dialog";
import { CreateStaffKeyDialog } from "@/components/settings/create-staff-key-dialog";
import { NewApiKeyDialog } from "@/components/settings/new-api-key-dialog";
import {
  ListCard,
  ResponsiveList,
  SettingsCallout,
  SettingsListBody,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import {
  useIntegrationApiKeys,
  useRevokeIntegrationApiKey,
  useRevokeStaffApiKey,
  useStaffApiKeys,
  type IntegrationApiKey,
  type StaffApiKey,
} from "@/hooks/use-api-keys";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export default function ApiKeysPage() {
  const { data } = useCurrentUser();
  const user = data?.user;
  const canManageIntegrations = hasPermission(user, "settings.manage");

  return (
    <>
      <StaffApiKeysCard />
      {canManageIntegrations ? <IntegrationApiKeysCard /> : null}
    </>
  );
}

function KeySuffix({ lastFour }: { lastFour: string }) {
  return (
    <code dir="ltr" className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-border/60">
      ••••{lastFour}
    </code>
  );
}

function KeyStatus({ revoked }: { revoked: boolean }) {
  const { t } = useI18n();
  return (
    <StatusPill tone={revoked ? "neutral" : "success"}>
      {revoked ? t("settings.apiKeys.revoked") : t("common.active")}
    </StatusPill>
  );
}

function StaffApiKeysCard() {
  const { t } = useI18n();
  const { data: keys, isLoading } = useStaffApiKeys();
  const revokeKey = useRevokeStaffApiKey();
  const [showCreate, setShowCreate] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  const onRevoke = (key: StaffApiKey) => {
    if (!confirm(t("settings.apiKeys.revokePersonalConfirm", { name: key.name }))) return;
    revokeKey.mutate(key.id, {
      onSuccess: () => toast.success(t("settings.apiKeys.revokedToast")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.apiKeys.revokeFailed")),
    });
  };

  const revokeButton = (key: StaffApiKey) =>
    key.revokedAt ? null : (
      <Button size="sm" variant="destructive" onClick={() => onRevoke(key)}>
        {t("settings.apiKeys.revoke")}
      </Button>
    );

  const lastUsed = (key: StaffApiKey) =>
    key.lastUsedAt ? formatDateTime(key.lastUsedAt) : t("settings.backup.never");

  return (
    <SettingsSection
      icon={KeyRound}
      title={t("settings.apiKeys.personalTitle")}
      description={t("settings.apiKeys.personalDescription")}
      actions={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t("settings.apiKeys.newKey")}
        </Button>
      }
    >
      <SettingsListBody>
        <SettingsCallout icon={Bot} title={t("settings.apiKeys.mcpUrl")}>
          <code
            dir="ltr"
            className="mt-1 block overflow-x-auto rounded-lg bg-card px-3 py-2 text-start font-mono text-xs text-foreground ring-1 ring-border/60"
          >
            {typeof window !== "undefined" ? window.location.origin : ""}/api/v1/mcp
          </code>
          <p className="mt-1.5 text-xs leading-relaxed">
            {t("settings.apiKeys.mcpHeaderBefore")}{" "}
            <code dir="ltr" className="font-mono text-foreground">
              Authorization: Bearer &lt;key&gt;
            </code>
            {t("settings.apiKeys.mcpHeaderAfter")}{" "}
            <Link href="/docs/api" className="font-medium text-primary underline underline-offset-2">
              {t("settings.apiKeys.apiDocs")}
            </Link>
            {t("settings.apiKeys.mcpDocsAfter")}
          </p>
        </SettingsCallout>
      </SettingsListBody>

      {isLoading ? (
        <SettingsListBody>
          <Skeleton className="h-24 rounded-xl" />
        </SettingsListBody>
      ) : keys && keys.length > 0 ? (
        <ResponsiveList
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("settings.apiKeys.key")}</TableHead>
                  <TableHead>{t("settings.apiKeys.lastUsed")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium text-foreground">{key.name}</TableCell>
                    <TableCell>
                      <KeySuffix lastFour={key.lastFour} />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{lastUsed(key)}</TableCell>
                    <TableCell>
                      <KeyStatus revoked={!!key.revokedAt} />
                    </TableCell>
                    <TableCell className="text-end">{revokeButton(key)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
          cards={keys.map((key) => (
            <ListCard key={key.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{key.name}</p>
                  <div className="mt-1">
                    <KeySuffix lastFour={key.lastFour} />
                  </div>
                </div>
                <KeyStatus revoked={!!key.revokedAt} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {t("settings.apiKeys.lastUsed")}: <span className="tabular-nums">{lastUsed(key)}</span>
                </span>
                {revokeButton(key)}
              </div>
            </ListCard>
          ))}
        />
      ) : (
        <SettingsListBody>
          <EmptyState compact icon={KeyRound} title={t("settings.apiKeys.emptyPersonal")} />
        </SettingsListBody>
      )}

      {showCreate ? (
        <CreateStaffKeyDialog
          onClose={() => setShowCreate(false)}
          onCreated={(token) => {
            setShowCreate(false);
            setNewToken(token);
          }}
        />
      ) : null}
      {newToken ? <NewApiKeyDialog token={newToken} onClose={() => setNewToken(null)} /> : null}
    </SettingsSection>
  );
}

function IntegrationApiKeysCard() {
  const { t } = useI18n();
  const { data: keys, isLoading } = useIntegrationApiKeys();
  const revokeKey = useRevokeIntegrationApiKey();
  const [showCreate, setShowCreate] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  const onRevoke = (key: IntegrationApiKey) => {
    if (!confirm(t("settings.apiKeys.revokeIntegrationConfirm", { name: key.name }))) return;
    revokeKey.mutate(key.id, {
      onSuccess: () => toast.success(t("settings.apiKeys.revokedToast")),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.apiKeys.revokeFailed")),
    });
  };

  const revokeButton = (key: IntegrationApiKey) =>
    key.revokedAt ? null : (
      <Button size="sm" variant="destructive" onClick={() => onRevoke(key)}>
        {t("settings.apiKeys.revoke")}
      </Button>
    );

  const scopes = (key: IntegrationApiKey) => (
    <div className="flex flex-wrap gap-1">
      {key.scopes.map((s) => (
        <Badge key={s} variant="info">
          {t(`settings.scope.${s}.label`)}
        </Badge>
      ))}
    </div>
  );

  return (
    <SettingsSection
      icon={Plug}
      title={t("settings.apiKeys.integrationTitle")}
      description={t("settings.apiKeys.integrationDescription")}
      actions={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t("settings.apiKeys.newKey")}
        </Button>
      }
    >
      {isLoading ? (
        <SettingsListBody>
          <Skeleton className="h-24 rounded-xl" />
        </SettingsListBody>
      ) : keys && keys.length > 0 ? (
        <ResponsiveList
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("settings.apiKeys.key")}</TableHead>
                  <TableHead>{t("settings.apiKeys.location")}</TableHead>
                  <TableHead>{t("settings.roles.permissions")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium text-foreground">{key.name}</TableCell>
                    <TableCell>
                      <KeySuffix lastFour={key.lastFour} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.branch?.name ?? t("settings.apiKeys.allLocations")}
                    </TableCell>
                    <TableCell className="min-w-48 whitespace-normal">{scopes(key)}</TableCell>
                    <TableCell>
                      <KeyStatus revoked={!!key.revokedAt} />
                    </TableCell>
                    <TableCell className="text-end">{revokeButton(key)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
          cards={keys.map((key) => (
            <ListCard key={key.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{key.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {key.branch?.name ?? t("settings.apiKeys.allLocations")}
                  </p>
                </div>
                <KeyStatus revoked={!!key.revokedAt} />
              </div>
              {scopes(key)}
              <div className="flex items-center justify-between gap-3">
                <KeySuffix lastFour={key.lastFour} />
                {revokeButton(key)}
              </div>
            </ListCard>
          ))}
        />
      ) : (
        <SettingsListBody>
          <EmptyState compact icon={Plug} title={t("settings.apiKeys.emptyIntegration")} />
        </SettingsListBody>
      )}

      {showCreate ? (
        <CreateIntegrationKeyDialog
          onClose={() => setShowCreate(false)}
          onCreated={(token) => {
            setShowCreate(false);
            setNewToken(token);
          }}
        />
      ) : null}
      {newToken ? <NewApiKeyDialog token={newToken} onClose={() => setNewToken(null)} /> : null}
    </SettingsSection>
  );
}
