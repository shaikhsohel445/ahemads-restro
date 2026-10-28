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
import { Switch } from "@/components/ui/switch";
import {
  useCreateMenuItem,
  useStations,
  useUploadItemImage,
  type MenuCategory,
} from "@/hooks/use-menu";
import { useSettings } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export function AddItemDialog({
  branchId,
  categories,
}: {
  branchId: string | null;
  categories: MenuCategory[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [stationId, setStationId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [halfPrice, setHalfPrice] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: stations } = useStations(branchId);
  const { data: settings } = useSettings(branchId);
  const createItem = useCreateMenuItem(branchId);
  const uploadImage = useUploadItemImage();
  const priceLabel =
    settings?.branch.taxMode === "EXCLUSIVE"
      ? t("menu.item.priceExclTax")
      : t("menu.item.priceInclTax");

  const reset = () => {
    setName("");
    setCategoryId("");
    setStationId("");
    setPrice("");
    setTaxRatePercent("");
    setIsVeg(true);
    setImageUrl(undefined);
    setImagePreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    uploadImage.mutate(file, {
      onSuccess: (res) => setImageUrl(res.url),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : t("menu.item.uploadImageFailed"));
        setImagePreview(undefined);
      },
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error(t("menu.item.chooseCategory"));
      return;
    }
    createItem.mutate(
      {
        name,
        categoryId,
        stationId: stationId || undefined,
        price: Number(price),
        halfPrice: halfPrice.trim() === "" ? undefined : Number(halfPrice),
        // Empty -> omitted, so the API applies the branch tax regime default.
        taxRatePercent: taxRatePercent.trim() === "" ? undefined : Number(taxRatePercent),
        isVeg,
        isVegan: false,
        isJain: false,
        isHalal: false,
        isGlutenFree: false,
        spiceLevel: "NONE",
        allergens: [],
        isActive: true,
        modifierGroupIds: [],
        imageUrl,
      },
      {
        onSuccess: () => {
          toast.success(t("menu.item.added", { name }));
          setOpen(false);
          reset();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("menu.item.addFailed")),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" disabled={categories.length === 0}>
            {t("menu.item.add")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t("menu.item.newTitle")}</DialogTitle>
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
            <Label htmlFor="item-name">{t("common.name")}</Label>
            <Input
              id="item-name"
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
              <Label htmlFor="price">{priceLabel}</Label>
              <Input
                id="price"
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
              <Label htmlFor="tax">{t("menu.item.taxRate")}</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                placeholder={t("menu.item.taxRateDefaultPlaceholder")}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">{t("menu.item.taxRateHelp")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="add-half">{t("menu.item.halfPrice")}</Label>
            <Input
              id="add-half"
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
            <Label htmlFor="is-veg" className="cursor-pointer">
              {t("menu.diet.veg")}
            </Label>
            <Switch id="is-veg" checked={isVeg} onCheckedChange={setIsVeg} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createItem.isPending || uploadImage.isPending}>
              {createItem.isPending ? t("menu.item.adding") : t("menu.item.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
