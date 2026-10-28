"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreateIntegrationKeyDialog } from "@/components/settings/create-integration-key-dialog";
import { CreateStaffKeyDialog } from "@/components/settings/create-staff-key-dialog";
import { NewApiKeyDialog } from "@/components/settings/new-api-key-dialog";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { t } = useI18n();
  const { data } = useCurrentUser();
  const user = data?.user;
  const canManageIntegrations = hasPermission(user, "settings.manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <SettingsTabs />

      <StaffApiKeysCard />
      {canManageIntegrations ? <IntegrationApiKeysCard /> : null}
    </div>
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

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-foreground">{t("settings.apiKeys.personalTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.apiKeys.personalDescription")}</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          {t("settings.apiKeys.newKey")}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t("settings.apiKeys.mcpUrl")}</p>
        <code dir="ltr" className="mt-1 block overflow-x-auto rounded bg-background/60 p-2 font-mono text-xs">
          {typeof window !== "undefined" ? window.location.origin : ""}/api/v1/mcp
        </code>
        <p className="mt-2">
          {t("settings.apiKeys.mcpHeaderBefore")}{" "}
          <code dir="ltr" className="font-mono">
            Authorization: Bearer &lt;key&gt;
          </code>
          {t("settings.apiKeys.mcpHeaderAfter")}{" "}
          <a href="/docs/api" className="underline">
            {t("settings.apiKeys.apiDocs")}
          </a>
          {t("settings.apiKeys.mcpDocsAfter")}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : keys && keys.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("settings.apiKeys.key")}</TableHead>
              <TableHead>{t("settings.apiKeys.lastUsed")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium text-foreground">{key.name}</TableCell>
                <TableCell dir="ltr" className="font-mono text-xs text-muted-foreground">…{key.lastFour}</TableCell>
                <TableCell className="text-muted-foreground">
                  {key.lastUsedAt ? formatDateTime(key.lastUsedAt) : t("settings.backup.never")}
                </TableCell>
                <TableCell className="text-end">
                  {key.revokedAt ? (
                    <Badge variant="outline">{t("settings.apiKeys.revoked")}</Badge>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => onRevoke(key)}>
                      {t("settings.apiKeys.revoke")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("settings.apiKeys.emptyPersonal")}</p>
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
    </Card>
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

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-foreground">{t("settings.apiKeys.integrationTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.apiKeys.integrationDescription")}</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          {t("settings.apiKeys.newKey")}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : keys && keys.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("settings.apiKeys.key")}</TableHead>
              <TableHead>{t("settings.apiKeys.location")}</TableHead>
              <TableHead>{t("settings.roles.permissions")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium text-foreground">{key.name}</TableCell>
                <TableCell dir="ltr" className="font-mono text-xs text-muted-foreground">…{key.lastFour}</TableCell>
                <TableCell className="text-muted-foreground">{key.branch?.name ?? t("settings.apiKeys.allLocations")}</TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {t(`settings.scope.${s}.label`)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-end">
                  {key.revokedAt ? (
                    <Badge variant="outline">{t("settings.apiKeys.revoked")}</Badge>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => onRevoke(key)}>
                      {t("settings.apiKeys.revoke")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("settings.apiKeys.emptyIntegration")}</p>
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
    </Card>
  );
}
