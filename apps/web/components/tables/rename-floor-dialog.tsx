"use client";

import { Pencil } from "lucide-react";
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
import { useUpdateFloor } from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function RenameFloorDialog({
  branchId,
  floorId,
  currentName,
}: {
  branchId: string | null;
  floorId: string;
  currentName: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const updateFloor = useUpdateFloor(branchId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFloor.mutate(
      { id: floorId, name },
      {
        onSuccess: () => {
          toast.success(t("tables.floorRenamed"));
          setOpen(false);
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.floorRenameFailed")),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setName(currentName);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" className="h-10 px-3" title={t("tables.renameFloor")}>
            <Pencil className="size-4" />
            <span className="max-sm:sr-only">{t("tables.renameFloor")}</span>
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t("tables.renameFloor")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="rename-floor">{t("common.name")}</Label>
            <Input
              id="rename-floor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateFloor.isPending}>
              {updateFloor.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
