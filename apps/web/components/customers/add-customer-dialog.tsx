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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer, type Customer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function AddCustomerDialog({
  branchId,
  onCreated,
}: {
  branchId: string | null;
  onCreated?: (customer: Customer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const createCustomer = useCreateCustomer(branchId);
  const { t } = useI18n();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(
      { name: name || undefined, phone: phone || undefined, email: email || undefined },
      {
        onSuccess: (customer) => {
          toast.success(t("customers.added", { name: name || t("common.customer") }));
          setOpen(false);
          setName("");
          setPhone("");
          setEmail("");
          onCreated?.(customer);
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("customers.addError")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">{t("customers.new")}</Button>} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("customers.new")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-name">{t("common.name")}</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-phone">{t("common.phone")}</Label>
            <Input id="c-phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-email">{t("common.email")}</Label>
            <Input
              id="c-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? t("customers.adding") : t("customers.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
