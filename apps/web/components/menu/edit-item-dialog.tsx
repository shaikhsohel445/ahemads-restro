"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
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
  useStations,
  useUpdateMenuItem,
  useUploadItemImage,
  type MenuCategory,
  type MenuItem,
} from "@/hooks/use-menu";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { StockTrackingSection } from "@/components/menu/stock-tracking-section";
import { useSettings } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Mounted only while a specific item is being edited (see MenuPage), keyed
// by item.id — same pattern as EditRoleDialog/EditCategoryDialog.
export function EditItemDialog({
  branchId,
  item,
  categories,
  onClose,
}: {
  branchId: string | null;
  item: MenuItem;
  categories: MenuCategory[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [stationId, setStationId] = useState(item.stationId ?? "");
  const [price, setPrice] = useState(item.price);
  const [halfPrice, setHalfPrice] = useState(item.halfPrice ?? "");
  const [taxRatePercent, setTaxRatePercent] = useState(item.taxRatePercent);
  const [isVeg, setIsVeg] = useState(item.isVeg);
  const [imageUrl, setImageUrl] = useState<string | undefined>(item.imageUrl ?? undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(item.imageUrl ?? undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: stations } = useStations(branchId);
  const { data: settings } = useSettings(branchId);
  const { data: me } = useCurrentUser();
  const updateItem = useUpdateMenuItem(branchId);
  const uploadImage = useUploadItemImage();
  const priceLabel =
    settings?.branch.taxMode === "EXCLUSIVE"
      ? t("menu.item.priceExclTax")
      : t("menu.item.priceInclTax");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    uploadImage.mutate(file, {
      onSuccess: (res) => setImageUrl(res.url),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : t("menu.item.uploadImageFailed"));
        setImagePreview(item.imageUrl ?? undefined);
      },
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error(t("menu.item.chooseCategory"));
      return;
    }
    updateItem.mutate(
      {
        id: item.id,
        dto: {
          name,
          categoryId,
          stationId: stationId || undefined,
          price: Number(price),
          halfPrice: halfPrice.trim() === "" ? null : Number(halfPrice),
          taxRatePercent: Number(taxRatePercent),
          isVeg,
          imageUrl,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("menu.item.updated", { name }));
          onClose();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("menu.item.updateFailed")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("menu.item.editTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label>{t("menu.item.photo")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onFileChange}
            />
            {imagePreview ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob/uploaded preview, not a Next-optimizable remote asset */}
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl(undefined);
                    setImagePreview(undefined);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground"
                  aria-label={t("menu.item.removePhoto")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {uploadImage.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-xs">
                    {t("menu.item.uploading")}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">{t("menu.item.addPhoto")}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="item-edit-name">{t("common.name")}</Label>
            <Input
              id="item-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("menu.item.namePlaceholder")}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("common.category")}</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={t("menu.item.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-price">{priceLabel}</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                dir="ltr"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tax">{t("menu.item.taxRate")}</Label>
              <Input
                id="edit-tax"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-half">{t("menu.item.halfPrice")}</Label>
            <Input
              id="edit-half"
              type="number"
              min="0"
              step="0.01"
              value={halfPrice}
              onChange={(e) => setHalfPrice(e.target.value)}
              placeholder={t("menu.item.halfPricePlaceholder")}
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              {t("menu.item.halfPriceHelp")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("menu.item.station")}</Label>
            <Select value={stationId} onValueChange={(v) => setStationId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.none")} />
              </SelectTrigger>
              <SelectContent>
                {stations?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label htmlFor="edit-is-veg" className="cursor-pointer">
              {t("menu.diet.veg")}
            </Label>
            <Switch id="edit-is-veg" checked={isVeg} onCheckedChange={setIsVeg} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateItem.isPending || uploadImage.isPending}>
              {updateItem.isPending ? t("common.saving") : t("menu.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
        {hasPermission(me?.user, "inventory.manage") && (
          <StockTrackingSection branchId={branchId} itemId={item.id} isCombo={item.isCombo} />
        )}
      </DialogContent>
    </Dialog>
  );
}
