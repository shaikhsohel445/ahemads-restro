"use client";

import { Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateRoleDialog } from "@/components/settings/create-role-dialog";
import { EditRoleDialog } from "@/components/settings/edit-role-dialog";
import {
  ListCard,
  ResponsiveList,
  SettingsListBody,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteRole, useRoles, type RoleWithPermissions } from "@/hooks/use-roles";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export default function RolesPage() {
  const { t } = useI18n();
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);

  const onDelete = (role: RoleWithPermissions) => {
    if (!confirm(t("settings.roles.deleteConfirm", { name: role.label }))) return;
    deleteRole.mutate(role.id, {
      onSuccess: () => toast.success(t("settings.deletedToast", { name: role.label })),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("settings.roles.deleteFailed")),
    });
  };

  const typeBadge = (role: RoleWithPermissions) =>
    role.isSystem ? (
      <Badge variant="neutral">
        <Lock />
        {t("settings.roles.seeded")}
      </Badge>
    ) : (
      <Badge variant="gold">{t("settings.roles.custom")}</Badge>
    );

  const actions = (role: RoleWithPermissions) =>
    role.isSystem ? (
      <span className="text-xs text-muted-foreground">—</span>
    ) : (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditingRole(role)}>
          <Pencil className="size-3.5" />
          {t("common.edit")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(role)}
          aria-label={t("settings.roles.delete")}
          title={t("settings.roles.delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    );

  return (
    <>
      <SettingsSection
        icon={ShieldCheck}
        title={t("settings.roles.title")}
        description={t("settings.roles.description")}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t("settings.roles.create")}
          </Button>
        }
      >
        {isLoading ? (
          <SettingsListBody className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </SettingsListBody>
        ) : roles && roles.length > 0 ? (
          <ResponsiveList
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("settings.staff.role")}</TableHead>
                    <TableHead>{t("common.type")}</TableHead>
                    <TableHead>{t("settings.roles.permissions")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{role.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          <bdi>{role.name}</bdi>
                        </p>
                      </TableCell>
                      <TableCell>{typeBadge(role)}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {t("settings.roles.granted", { n: role.permissions.length })}
                      </TableCell>
                      <TableCell className="text-end">{actions(role)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
            cards={roles.map((role) => (
              <ListCard key={role.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{role.label}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      <bdi>{role.name}</bdi>
                    </p>
                  </div>
                  {typeBadge(role)}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("settings.roles.granted", { n: role.permissions.length })}
                  </span>
                  {actions(role)}
                </div>
              </ListCard>
            ))}
          />
        ) : (
          <SettingsListBody>
            <EmptyState
              compact
              icon={ShieldCheck}
              title={t("settings.roles.emptyTitle")}
              description={t("settings.roles.emptyDescription")}
            />
          </SettingsListBody>
        )}
      </SettingsSection>

      {createOpen ? <CreateRoleDialog onClose={() => setCreateOpen(false)} /> : null}
      {editingRole ? (
        <EditRoleDialog
          key={editingRole.id}
          role={editingRole}
          onClose={() => setEditingRole(null)}
        />
      ) : null}
    </>
  );
}
