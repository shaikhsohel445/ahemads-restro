"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useDeleteTable,
  useUpdateTableLayout,
  type RestaurantTable,
} from "@/hooks/use-tables";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { TableShapeIcon } from "./table-shape-icon";
import { useI18n } from "@/lib/i18n/context";

export function EditableTableTile({
  table,
  branchId,
  onEdit,
}: {
  table: RestaurantTable;
  branchId: string | null;
  onEdit: () => void;
}) {
  const { t } = useI18n();
  const updateLayout = useUpdateTableLayout(branchId);
  const deleteTable = useDeleteTable(branchId);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(
    null,
  );

  const posX = dragPos?.x ?? table.posX;
  const posY = dragPos?.y ?? table.posY;

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { pointerX: e.clientX, pointerY: e.clientY, posX: table.posX, posY: table.posY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const { pointerX, pointerY, posX: startX, posY: startY } = dragStart.current;
    setDragPos({
      x: Math.max(0, startX + (e.clientX - pointerX)),
      y: Math.max(0, startY + (e.clientY - pointerY)),
    });
  };

  const onPointerUp = () => {
    if (!dragStart.current || !dragPos) {
      dragStart.current = null;
      return;
    }
    dragStart.current = null;
    updateLayout.mutate(
      [
        {
          id: table.id,
          posX: dragPos.x,
          posY: dragPos.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation,
        },
      ],
      { onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.positionSaveFailed")) },
    );
    setDragPos(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("tables.deleteConfirm", { table: table.name ?? t("tables.tableN", { n: table.number }) }))) return;
    deleteTable.mutate(table.id, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("tables.deleteFailed")),
    });
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "absolute flex cursor-grab touch-none flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-primary/45 bg-card text-xs font-medium text-accent-foreground shadow-sm transition-shadow select-none hover:border-primary/70 hover:shadow-md active:cursor-grabbing",
        dragPos && "z-10 border-primary shadow-lg ring-4 ring-primary/15",
      )}
      style={{ left: posX, top: posY, width: table.width, height: table.height }}
    >
      <TableShapeIcon shape={table.shape} capacity={table.capacity} className="h-6 w-6" />
      <span className="text-sm font-semibold tabular-nums text-foreground">{table.name ?? t("tables.tableShort", { n: table.number })}</span>
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Users className="h-3 w-3" />
        <span className="tabular-nums">{table.capacity}</span>
      </span>
      <div className="absolute -top-4 end-1 flex gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-card shadow-sm"
          aria-label={t("tables.editTable")}
          title={t("tables.editTable")}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full bg-card text-destructive shadow-sm hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("tables.deleteTable")}
          title={t("tables.deleteTable")}
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
