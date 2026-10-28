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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReservation } from "@/hooks/use-reservations";
import type { RestaurantTable } from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

function defaultDateTimeLocal() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function AddReservationDialog({
  branchId,
  tables,
}: {
  branchId: string | null;
  tables: RestaurantTable[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [reservedAt, setReservedAt] = useState(defaultDateTimeLocal());
  const [tableId, setTableId] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const createReservation = useCreateReservation(branchId);

  const reset = () => {
    setCustomerName("");
    setPhone("");
    setGuestCount("2");
    setReservedAt(defaultDateTimeLocal());
    setTableId("");
    setSpecialRequests("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservation.mutate(
      {
        customerName,
        phone: phone || undefined,
        guestCount: Number(guestCount),
        reservedAt: new Date(reservedAt),
        durationMinutes: 90,
        tableId: tableId || undefined,
        specialRequests: specialRequests || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("reservations.added", { name: customerName }));
          setOpen(false);
          reset();
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : t("reservations.addFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">{t("reservations.new")}</Button>} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("reservations.new")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="r-name">{t("reservations.customerName")}</Label>
            <Input
              id="r-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-phone">{t("common.phone")}</Label>
              <Input id="r-phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-guests">{t("common.guests")}</Label>
              <Input
                id="r-guests"
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="r-when">{t("reservations.dateTime")}</Label>
            <Input
              id="r-when"
              type="datetime-local"
              value={reservedAt}
              onChange={(e) => setReservedAt(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("reservations.tableOptional")}</Label>
            <Select value={tableId} onValueChange={(v) => setTableId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={t("reservations.noTableYet")}>
                  {(value: string | null) => {
                    const table = tables.find((x) => x.id === value);
                    if (!table) return t("reservations.noTableYet");
                    return table.name ?? t("reservations.tableN", { n: table.number });
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name ?? t("reservations.tableN", { n: table.number })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="r-notes">{t("reservations.specialRequests")}</Label>
            <Textarea
              id="r-notes"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createReservation.isPending}>
              {createReservation.isPending ? t("common.saving") : t("reservations.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
