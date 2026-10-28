"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddStaffDialog } from "@/components/settings/add-staff-dialog";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <SettingsTabs />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-foreground">{t("settings.staff.title")}</h2>
          <AddStaffDialog />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : staff && staff.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("settings.staff.contact")}</TableHead>
                <TableHead>{t("settings.staff.role")}</TableHead>
                <TableHead>{t("settings.staff.branches")}</TableHead>
                <TableHead className="text-end">{t("common.active")}</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-foreground">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <bdi>{member.email || member.phone || "—"}</bdi>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {member.role.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.branches.map((b) => b.branch.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    <Switch
                      checked={member.isActive}
                      onCheckedChange={(checked) =>
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
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {member.id !== currentUser?.user.id && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground"
                          title={t("settings.staff.reset2faTitle")}
                          onClick={() => onResetTwoFactor(member)}
                        >
                          {t("settings.staff.reset2fa")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title={t("settings.staff.deleteTitle")}
                          aria-label={t("settings.staff.deleteTitle")}
                          onClick={() => onDelete(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("settings.staff.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.staff.emptyDescription")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
