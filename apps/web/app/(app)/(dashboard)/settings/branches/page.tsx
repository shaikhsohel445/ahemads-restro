"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SettingsBody, SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/status-pill";
import { useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import { ApiError, api } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Branches of the restaurant, and adding a new one (owner/administrator).
// A new branch starts with the current branch's country and tax set-up;
// its own address, VAT details, tables and menu are set up afterwards.
export default function BranchesSettingsPage() {
  const { t } = useI18n();
  const { branchId, branches, setBranchId } = useBranch();
  const { data: me } = useCurrentUser();
  const canAdd = ["OWNER", "ADMINISTRATOR"].includes(me?.user.roleName ?? "");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.post<{ id: string; name: string }>(`/branches?branchId=${branchId}`, {
        name: name.trim(),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      }),
    onSuccess: (branch) => {
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success(t("settings.branches.created", { name: branch.name }));
      setName("");
      setAddress("");
      setPhone("");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.branches.createFailed")),
  });

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection icon={Building2} title={t("settings.branches.title")} description={t("settings.branches.description")}>
        <SettingsBody divided={false}>
          <ul className="flex flex-col gap-2">
            {branches.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/80 px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Building2 className="size-4" />
                  </span>
                  <span className="truncate font-medium text-foreground">{b.name}</span>
                </span>
                {b.id === branchId ? (
                  <StatusPill tone="success">{t("settings.branches.current")}</StatusPill>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setBranchId(b.id)}>
                    <Check className="size-3.5" />
                    {t("settings.branches.switch")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </SettingsBody>
      </SettingsSection>

      {canAdd && (
        <SettingsSection icon={Plus} title={t("settings.branches.addTitle")} description={t("settings.branches.addDescription")}>
          <SettingsBody divided={false}>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) create.mutate();
              }}
            >
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="branch-name">{t("settings.branches.name")}</Label>
                <Input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="branch-address">{t("settings.branches.address")}</Label>
                <Input id="branch-address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="branch-phone">{t("settings.branches.phone")}</Label>
                <Input id="branch-phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={!name.trim() || create.isPending}>
                  <Plus className="size-4" />
                  {create.isPending ? t("common.saving") : t("settings.branches.add")}
                </Button>
              </div>
            </form>
          </SettingsBody>
        </SettingsSection>
      )}
    </div>
  );
}
