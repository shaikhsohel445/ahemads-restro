"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCustomer, type Customer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Mounted only while a specific customer is being edited (see CustomersPage
// / customer detail page), keyed by customer.id — same pattern as
// EditRoleDialog/EditCategoryDialog.
export function EditCustomerDialog({
  branchId,
  customer,
  onClose,
}: {
  branchId: string | null;
  customer: Customer;
  onClose: () => void;
}) {
  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [address, setAddress] = useState(customer.address ?? "");
  const [allergies, setAllergies] = useState(customer.allergies ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [optOut, setOptOut] = useState(customer.marketingOptOut ?? false);
  const updateCustomer = useUpdateCustomer(branchId);
  const { t } = useI18n();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer.mutate(
      {
        id: customer.id,
        dto: {
          name: name || undefined,
          phone: phone || undefined,
          email: email || undefined,
          address: address || undefined,
          allergies: allergies || undefined,
          notes: notes || undefined,
          marketingOptOut: optOut,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("customers.updated", { name: name || t("common.customer") }));
          onClose();
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("customers.updateError")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("customers.edit")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-name">{t("common.name")}</Label>
            <Input id="c-edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-phone">{t("common.phone")}</Label>
            <Input id="c-edit-phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-email">{t("common.email")}</Label>
            <Input
              id="c-edit-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-address">{t("common.address")}</Label>
            <Input id="c-edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-allergies">{t("customers.allergies")}</Label>
            <Input
              id="c-edit-allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-edit-notes">{t("common.notes")}</Label>
            <Textarea id="c-edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={optOut} onChange={(e) => setOptOut(e.target.checked)} />
            {t("customers.marketingOptOut")}
          </label>
          <DialogFooter>
            <Button type="submit" disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? t("common.saving") : t("customers.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
