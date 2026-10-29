"use client";

import { ShieldOff, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AddStaffDialog } from "@/components/settings/add-staff-dialog";
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
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDeleteStaff, useStaff, useUpdateStaff, type StaffMember } from "@/hooks/use-staff";
import { api, ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StaffAvatar({ member }: { member: StaffMember }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        member.isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {initials(member.name)}
    </span>
  );
}

export default function StaffPage() {
  const { t } = useI18n();
  const { data: staff, isLoading } = useStaff();
  const { data: currentUser } = useCurrentUser();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const onResetTwoFactor = (member: StaffMember) => {
    if (!confirm(t("settings.staff.reset2faConfirm", { name: member.name }))) return;
    api.post(`/auth/2fa/reset/${member.id}`).then(
      () => toast.success(t("settings.staff.reset2faDone", { name: member.name })),
      (err) => toast.error(err instanceof ApiError ? err.message : t("settings.staff.reset2faFailed")),
    );
  };

  const onDelete = (member: StaffMember) => {
    if (!confirm(t("settings.staff.deleteConfirm", { name: member.name }))) return;
    deleteStaff.mutate(member.id, {
      onSuccess: () => toast.success(t("settings.deletedToast", { name: member.name })),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : t("settings.staff.deleteFailed")),
    });
  };

  const onToggleActive = (member: StaffMember, checked: boolean) =>
    updateStaff.mutate(
      { id: member.id, dto: { isActive: checked } },
      {
        onSuccess: () =>
          toast.success(
            t(checked ? "settings.staff.enabledToast" : "settings.staff.disabledToast", {
              name: member.name,
            }),
          ),
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("settings.staff.updateFailed")),
      },
    );

  const activeSwitch = (member: StaffMember) => (
    <Switch
      checked={member.isActive}
      aria-label={t("common.active")}
      onCheckedChange={(checked) => onToggleActive(member, checked)}
    />
  );

  const rowActions = (member: StaffMember) =>
    member.id !== currentUser?.user.id ? (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          title={t("settings.staff.reset2faTitle")}
          onClick={() => onResetTwoFactor(member)}
        >
          <ShieldOff className="size-3.5" />
          {t("settings.staff.reset2fa")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title={t("settings.staff.deleteTitle")}
          aria-label={t("settings.staff.deleteTitle")}
          onClick={() => onDelete(member)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    ) : (
      <span className="text-xs text-muted-foreground">{t("settings.staff.you")}</span>
    );

  const branchesOf = (member: StaffMember) => member.branches.map((b) => b.branch.name).join(", ") || "—";

  return (
    <SettingsSection
      icon={Users}
      title={t("settings.staff.title")}
      description={t("settings.staff.description")}
      actions={<AddStaffDialog />}
    >
      {isLoading ? (
        <SettingsListBody className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </SettingsListBody>
      ) : staff && staff.length > 0 ? (
        <ResponsiveList
          table={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("settings.staff.role")}</TableHead>
                  <TableHead>{t("settings.staff.branches")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <StaffAvatar member={member} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <bdi>{member.email || member.phone || "—"}</bdi>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{member.role.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground">{branchesOf(member)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {activeSwitch(member)}
                        <StatusPill tone={member.isActive ? "success" : "neutral"}>
                          {member.isActive ? t("common.active") : t("common.inactive")}
                        </StatusPill>
                      </div>
                    </TableCell>
                    <TableCell className="text-end">{rowActions(member)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
          cards={staff.map((member) => (
            <ListCard key={member.id}>
              <div className="flex items-start gap-3">
                <StaffAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <bdi>{member.email || member.phone || "—"}</bdi>
                  </p>
                </div>
                {activeSwitch(member)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{member.role.label}</Badge>
                <StatusPill tone={member.isActive ? "success" : "neutral"}>
                  {member.isActive ? t("common.active") : t("common.inactive")}
                </StatusPill>
              </div>
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="text-muted-foreground">{t("settings.staff.branches")}</span>
                <span className="text-foreground">{branchesOf(member)}</span>
              </div>
              <div className="-mx-1 flex justify-end border-t border-border/70 pt-2">{rowActions(member)}</div>
            </ListCard>
          ))}
        />
      ) : (
        <SettingsListBody>
          <EmptyState
            compact
            icon={Users}
            title={t("settings.staff.emptyTitle")}
            description={t("settings.staff.emptyDescription")}
          />
        </SettingsListBody>
      )}
    </SettingsSection>
  );
}
