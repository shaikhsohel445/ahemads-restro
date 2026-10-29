"use client";

import { Armchair, Hourglass, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCancelWaitlistEntry,
  useCreateWaitlistEntry,
  useSeatWaitlistEntry,
  useWaitlist,
} from "@/hooks/use-waitlist";
import type { RestaurantTable } from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";
import { ElapsedTimer } from "./elapsed-timer";

function AddWaitlistDialog({ branchId }: { branchId: string | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [quotedWaitMinutes, setQuotedWaitMinutes] = useState("15");
  const createEntry = useCreateWaitlistEntry(branchId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate(
      {
        customerName,
        phone: phone || undefined,
        partySize: Number(partySize),
        quotedWaitMinutes: quotedWaitMinutes ? Number(quotedWaitMinutes) : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("tables.waitlist.added", { name: customerName }));
          setOpen(false);
          setCustomerName("");
          setPhone("");
          setPartySize("2");
          setQuotedWaitMinutes("15");
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.waitlist.addFailed")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 px-3">
            <UserPlus className="size-4" />
            {t("tables.waitlist.add")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("tables.waitlist.add")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="w-name">{t("common.name")}</Label>
            <Input
              id="w-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-party">{t("tables.waitlist.partySize")}</Label>
              <Input
                id="w-party"
                type="number"
                min="1"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="w-wait">{t("tables.waitlist.quotedWait")}</Label>
              <Input
                id="w-wait"
                type="number"
                min="0"
                value={quotedWaitMinutes}
                onChange={(e) => setQuotedWaitMinutes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="w-phone">{t("common.phone")}</Label>
            <Input id="w-phone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createEntry.isPending}>
              {createEntry.isPending ? t("tables.adding") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WaitlistPanel({
  branchId,
  availableTables,
}: {
  branchId: string | null;
  availableTables: RestaurantTable[];
}) {
  const { t } = useI18n();
  const { data: entries, isLoading } = useWaitlist(branchId);
  const seat = useSeatWaitlistEntry(branchId);
  const cancel = useCancelWaitlistEntry(branchId);

  const count = entries?.length ?? 0;

  return (
    <Card className="gap-0 p-0 py-0 sm:py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Hourglass className="size-4" />
          </span>
          {t("tables.waitlist.title")}
          {count > 0 && (
            <span className="min-w-6 rounded-full bg-surface-2 px-2 text-center text-xs leading-6 font-medium tabular-nums text-muted-foreground">
              {count}
            </span>
          )}
        </h2>
        <AddWaitlistDialog branchId={branchId} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <ul className="flex flex-col gap-2 p-3">
          {entries.map((entry, i) => (
            <li
              key={entry.id}
              className="flex flex-col gap-2.5 rounded-xl bg-surface-2/60 p-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between xl:flex-col xl:items-stretch"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold tabular-nums text-muted-foreground ring-1 ring-border/70">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">{entry.customerName}</span>
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      <span className="tabular-nums">{t("tables.guestsCount", { n: entry.partySize })}</span>
                    </span>
                    <ElapsedTimer since={entry.createdAt} className="inline-flex items-center gap-1 tabular-nums" />
                    {entry.quotedWaitMinutes ? (
                      <span className="tabular-nums">{t("tables.waitlist.approxMin", { n: entry.quotedWaitMinutes })}</span>
                    ) : null}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={availableTables.length === 0}
                    render={
                      <Button
                        variant="secondary"
                        className="h-10 flex-1 bg-accent px-3 text-accent-foreground hover:bg-accent/80"
                      >
                        <Armchair className="size-4" />
                        {t("tables.waitlist.seat")}
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {availableTables.map((table) => (
                      <DropdownMenuItem
                        key={table.id}
                        onClick={() => seat.mutate({ id: entry.id, tableId: table.id })}
                      >
                        {table.name ?? t("tables.tableN", { n: table.number })}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("common.remove")}
                  title={t("common.remove")}
                  onClick={() => cancel.mutate(entry.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          compact
          icon={Hourglass}
          title={t("tables.waitlist.empty")}
          className="m-3 border-0 bg-surface-2/50"
        />
      )}
    </Card>
  );
}
