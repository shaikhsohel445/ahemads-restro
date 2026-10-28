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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useBulkCreateTables,
  useCreateTable,
  useUpdateTable,
  type RestaurantTable,
} from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function TableEditorDialog({
  branchId,
  floorId,
  table,
  open,
  onOpenChange,
}: {
  branchId: string | null;
  floorId: string;
  table: RestaurantTable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const isEdit = !!table;
  const [number, setNumber] = useState(table?.number ?? "");
  const [name, setName] = useState(table?.name ?? "");
  const [capacity, setCapacity] = useState(String(table?.capacity ?? 4));
  const [shape, setShape] = useState<"square" | "round" | "rect">(table?.shape ?? "square");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStart, setBulkStart] = useState("1");
  const [bulkCount, setBulkCount] = useState("5");
  const createTable = useCreateTable(branchId);
  const updateTable = useUpdateTable(branchId);
  const bulkCreateTables = useBulkCreateTables(branchId);
  const isPending = createTable.isPending || updateTable.isPending || bulkCreateTables.isPending;

  const bulkStartNum = Number(bulkStart);
  const bulkCountNum = Number(bulkCount);
  const bulkNumbers =
    Number.isInteger(bulkStartNum) && bulkStartNum > 0 && Number.isInteger(bulkCountNum) && bulkCountNum > 0
      ? Array.from({ length: Math.min(bulkCountNum, 100) }, (_, i) => String(bulkStartNum + i))
      : [];

  const reset = () => {
    setNumber(table?.number ?? "");
    setName(table?.name ?? "");
    setCapacity(String(table?.capacity ?? 4));
    setShape(table?.shape ?? "square");
    setBulkMode(false);
    setBulkStart("1");
    setBulkCount("5");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && bulkMode) {
      if (bulkNumbers.length === 0) {
        toast.error(t("tables.bulkInvalid"));
        return;
      }
      bulkCreateTables.mutate(
        { floorId, numbers: bulkNumbers, capacity: Number(capacity) || 1, shape },
        {
          onSuccess: () => {
            toast.success(t("tables.bulkAdded", { n: bulkNumbers.length }));
            onOpenChange(false);
          },
          onError: (err) =>
            toast.error(err instanceof ApiError ? err.message : t("tables.bulkAddFailed")),
        },
      );
      return;
    }

    const dto = {
      number,
      name: name || undefined,
      capacity: Number(capacity) || 1,
      shape,
    };

    if (isEdit) {
      updateTable.mutate(
        { id: table.id, dto },
        {
          onSuccess: () => {
            toast.success(t("tables.tableUpdated"));
            onOpenChange(false);
          },
          onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.tableUpdateFailed")),
        },
      );
      return;
    }

    createTable.mutate(
      { floorId, ...dto, posX: 20, posY: 20, width: 80, height: 80, rotation: 0 },
      {
        onSuccess: () => {
          toast.success(t("tables.tableAdded", { n: number }));
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.tableAddFailed")),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) reset();
      }}
    >
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? t("tables.editTable") : bulkMode ? t("tables.addMultipleTitle") : t("tables.newTable")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {!isEdit && (
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="bulk-mode" className="text-sm font-normal">
                  {t("tables.bulkToggle")}
                </Label>
                <Switch id="bulk-mode" checked={bulkMode} onCheckedChange={setBulkMode} />
              </div>
            )}

            {!isEdit && bulkMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bulk-start">{t("tables.bulkStart")}</Label>
                  <Input
                    id="bulk-start"
                    type="number"
                    min="1"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bulk-count">{t("tables.bulkCount")}</Label>
                  <Input
                    id="bulk-count"
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(e.target.value)}
                    required
                  />
                </div>
                <p className="col-span-2 text-xs text-muted-foreground">
                  {bulkNumbers.length > 0
                    ? t("tables.bulkPreview", {
                        from: bulkNumbers[0],
                        to: bulkNumbers[bulkNumbers.length - 1],
                        n: bulkNumbers.length,
                      })
                    : t("tables.bulkHint")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="table-number">{t("tables.number")}</Label>
                  <Input
                    id="table-number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder={t("tables.numberPlaceholder")}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="table-capacity">{t("tables.capacity")}</Label>
                  <Input
                    id="table-capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {bulkMode && !isEdit && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="table-capacity-bulk">{t("tables.capacityEach")}</Label>
                <Input
                  id="table-capacity-bulk"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
            )}

            {(!bulkMode || isEdit) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="table-name">{t("tables.labelOptional")}</Label>
                <Input
                  id="table-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("tables.labelPlaceholder")}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>{t("tables.shapeLabel")}</Label>
              <Select value={shape} onValueChange={(v) => setShape(v as typeof shape)}>
                <SelectTrigger>
                  <SelectValue>{(v: string | null) => (v ? t(`tables.shape.${v}`) : null)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">{t("tables.shape.square")}</SelectItem>
                  <SelectItem value="round">{t("tables.shape.round")}</SelectItem>
                  <SelectItem value="rect">{t("tables.shape.rect")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("common.saving")
                : isEdit
                  ? t("tables.saveChanges")
                  : bulkMode
                    ? bulkNumbers.length
                      ? t("tables.addNTables", { n: bulkNumbers.length })
                      : t("tables.addTables")
                    : t("tables.addTable")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
