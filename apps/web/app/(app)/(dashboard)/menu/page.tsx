"use client";

import {
  CircleOff,
  EyeOff,
  ImageIcon,
  Layers,
  Leaf,
  Pencil,
  Tags,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddCategoryDialog } from "@/components/menu/add-category-dialog";
import { AddItemDialog } from "@/components/menu/add-item-dialog";
import { ComboComponentsDialog } from "@/components/menu/combo-components-dialog";
import { EditCategoryDialog } from "@/components/menu/edit-category-dialog";
import { EditItemDialog } from "@/components/menu/edit-item-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput, Toolbar } from "@/components/ui/toolbar";
import { hasPermission, useCurrentUser } from "@/hooks/use-auth";
import { useBranch } from "@/hooks/use-branch";
import {
  useCategories,
  useDeleteCategory,
  useDeleteMenuItem,
  useMenuItems,
  useUpdateMenuItem,
  type MenuCategory,
  type MenuItem,
} from "@/hooks/use-menu";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const formatTaxPercent = (rate: string) =>
  formatNumber(Number(rate) / 100, { style: "percent", maximumFractionDigits: 2 });

type ItemView = "all" | "available" | "unavailable" | "combos";

function ItemThumb({ item, size = "md" }: { item: MenuItem; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "size-16 rounded-xl" : "size-11 rounded-xl";
  return item.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- uploaded asset served from the backend, not a Next-optimizable remote source
    <img
      src={item.imageUrl}
      alt=""
      className={cn(cls, "shrink-0 object-cover ring-1 ring-border/60", !item.isActive && "opacity-50 grayscale")}
    />
  ) : (
    <div className={cn(cls, "flex shrink-0 items-center justify-center bg-surface-2 text-muted-foreground/60")}>
      <ImageIcon className={size === "lg" ? "size-6" : "size-4"} />
    </div>
  );
}

export default function MenuPage() {
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data: me } = useCurrentUser();
  // menu.view alone is read-only; every edit control needs menu.manage.
  const canManage = hasPermission(me?.user, "menu.manage");
  const { data: categories, isLoading: categoriesLoading } = useCategories(branchId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { data: items, isLoading: itemsLoading } = useMenuItems(branchId, selectedCategoryId);
  const { data: allItems } = useMenuItems(branchId);
  const deleteItem = useDeleteMenuItem(branchId);
  const deleteCategory = useDeleteCategory(branchId);
  const updateItem = useUpdateMenuItem(branchId);
  const [comboItem, setComboItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ItemView>("all");

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  const stats = useMemo(() => {
    const list = allItems ?? [];
    return {
      total: list.length,
      combos: list.filter((i) => i.isCombo).length,
      unavailable: list.filter((i) => !i.isActive).length,
    };
  }, [allItems]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items ?? []).filter((item) => {
      if (view === "available" && !item.isActive) return false;
      if (view === "unavailable" && item.isActive) return false;
      if (view === "combos" && !item.isCombo) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, view]);

  const onDeleteCategory = (category: MenuCategory) => {
    if (!confirm(t("menu.category.deleteConfirm", { name: category.name }))) return;
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        toast.success(t("menu.category.deleted", { name: category.name }));
        if (selectedCategoryId === category.id) setSelectedCategoryId(undefined);
      },
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : t("menu.category.deleteFailed"),
        ),
    });
  };

  const onDeleteItem = (item: MenuItem) =>
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.success(t("menu.item.removed", { name: item.name })),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("menu.item.removeFailed")),
    });

  const onToggleAvailable = (item: MenuItem, isActive: boolean) =>
    updateItem.mutate(
      { id: item.id, dto: { isActive } },
      {
        onSuccess: () =>
          toast.success(
            isActive
              ? t("menu.item.nowAvailable", { name: item.name })
              : t("menu.item.nowUnavailable", { name: item.name }),
          ),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("menu.item.updateFailed")),
      },
    );

  const togglePending = (item: MenuItem) => updateItem.isPending && updateItem.variables?.id === item.id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("menu.title")}
        description={canManage ? t("menu.subtitle") : t("menu.subtitleViewOnly")}
        icon={UtensilsCrossed}
        actions={
          canManage && (
            <>
              <AddCategoryDialog branchId={branchId} />
              <AddItemDialog branchId={branchId} categories={categories ?? []} />
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={t("menu.stats.items")} value={formatNumber(stats.total)} icon={UtensilsCrossed} />
        <StatCard
          label={t("menu.categories")}
          value={formatNumber(categories?.length ?? 0)}
          icon={Tags}
          tone="info"
        />
        <StatCard label={t("menu.stats.combos")} value={formatNumber(stats.combos)} icon={Layers} tone="gold" />
        <StatCard
          label={t("menu.stats.unavailable")}
          value={formatNumber(stats.unavailable)}
          icon={CircleOff}
          tone={stats.unavailable > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        {/* Category rail — a sticky sidebar on desktop, a swipeable pill row on phones/tablets. */}
        <aside className="min-w-0">
          {categoriesLoading ? (
            <>
              <Skeleton className="h-11 rounded-xl lg:hidden" />
              <div className="hidden flex-col gap-2 lg:flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-xl" />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 lg:hidden">
                <Segmented
                  aria-label={t("menu.categories")}
                  className="w-full"
                  value={selectedCategoryId ?? "all"}
                  onChange={(id) => setSelectedCategoryId(id === "all" ? undefined : id)}
                  options={[
                    { value: "all", label: t("menu.allItems") },
                    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name, count: c._count.items })),
                  ]}
                />
                {selectedCategory && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card px-3 py-2">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-foreground">{selectedCategory.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {t("menu.itemCount", { n: selectedCategory._count.items })}
                        {!selectedCategory.showOnWebsite && (
                          <>
                            {" · "}
                            <EyeOff className="size-3" /> {t("menu.category.hiddenFromWebsite")}
                          </>
                        )}
                      </span>
                    </span>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon-lg"
                          aria-label={t("menu.category.editTitle")}
                          onClick={() => setEditingCategory(selectedCategory)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-lg"
                          className="text-destructive"
                          aria-label={t("menu.category.delete")}
                          onClick={() => onDeleteCategory(selectedCategory)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Card className="hidden gap-1 rounded-2xl p-3 lg:sticky lg:top-4 lg:flex lg:flex-col">
                <h2 className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {t("menu.categories")}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(undefined)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors",
                    !selectedCategoryId
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  {t("menu.allItems")}
                  <span className="text-xs tabular-nums">{formatNumber(stats.total)}</span>
                </button>
                {categories?.map((cat) => {
                  const active = selectedCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={cn(
                        "group relative flex items-center rounded-xl ps-3 pe-1 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                      )}
                    >
                      {active && <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gold" />}
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="min-w-0 flex-1 truncate py-2.5 text-start"
                      >
                        {cat.name}
                      </button>
                      {!cat.showOnWebsite && (
                        <span title={t("menu.category.hiddenFromWebsite")} className="me-1.5 shrink-0 opacity-70">
                          <EyeOff className="size-3.5" />
                          <span className="sr-only">{t("menu.category.hiddenFromWebsite")}</span>
                        </span>
                      )}
                      <span
                        className={cn(
                          "min-w-6 shrink-0 rounded-full px-1.5 text-center text-xs tabular-nums",
                          canManage && "group-focus-within:hidden group-hover:hidden",
                        )}
                      >
                        {cat._count.items}
                      </span>
                      {canManage && (
                        <div className="hidden shrink-0 items-center gap-0.5 group-focus-within:flex group-hover:flex">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-primary"
                            title={t("menu.category.editTitle")}
                            aria-label={t("menu.category.editTitle")}
                            onClick={() => setEditingCategory(cat)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            title={t("menu.category.delete")}
                            aria-label={t("menu.category.delete")}
                            onClick={() => onDeleteCategory(cat)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </>
          )}
        </aside>

        <Card className="flex min-w-0 flex-col gap-4 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-base font-semibold text-foreground">
                {selectedCategory?.name ?? t("common.items")}
              </h2>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {t("menu.itemCount", { n: visibleItems.length })}
              </span>
            </div>
            <Toolbar>
              <SearchInput value={search} onChange={setSearch} placeholder={t("menu.searchPlaceholder")} />
              <Segmented
                size="sm"
                aria-label={t("menu.view.label")}
                value={view}
                onChange={setView}
                options={[
                  { value: "all", label: t("menu.view.all") },
                  { value: "available", label: t("menu.view.available") },
                  { value: "unavailable", label: t("menu.view.unavailable") },
                  { value: "combos", label: t("menu.combo.label"), icon: Layers },
                ]}
              />
            </Toolbar>
          </div>

          {itemsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : visibleItems.length > 0 ? (
            <>
              {/* Phones: card list. */}
              <ul className="flex flex-col gap-2 md:hidden">
                {visibleItems.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3",
                      !item.isActive && "bg-surface-2/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <ItemThumb item={item} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          {item.isVeg && (
                            <Leaf className="size-3.5 shrink-0 text-status-success" aria-label={t("menu.diet.veg")} />
                          )}
                          <span className="min-w-0 break-words">{item.name}</span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.category.name}
                          {item.station ? ` · ${item.station.name}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {t("menu.item.taxPercent", { rate: formatTaxPercent(item.taxRatePercent) })}
                          </span>
                          {item.isCombo && (
                            <Badge variant="gold" className="h-5 px-2 text-[11px]">
                              {t("menu.combo.label")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                      {canManage ? (
                        <label className="flex min-h-10 items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Switch
                            checked={item.isActive}
                            disabled={togglePending(item)}
                            onCheckedChange={(checked) => onToggleAvailable(item, checked)}
                            aria-label={t("menu.item.available")}
                          />
                          {item.isActive ? t("menu.view.available") : t("menu.view.unavailable")}
                        </label>
                      ) : (
                        <StatusPill tone={item.isActive ? "success" : "neutral"}>
                          {item.isActive ? t("menu.view.available") : t("menu.view.unavailable")}
                        </StatusPill>
                      )}
                      {canManage && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-lg"
                            className={cn(item.isCombo ? "text-primary" : "text-muted-foreground")}
                            aria-label={t("menu.combo.components")}
                            onClick={() => setComboItem(item)}
                          >
                            <Layers />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-lg"
                            className="text-muted-foreground"
                            aria-label={t("menu.item.editTitle")}
                            onClick={() => setEditingItem(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-lg"
                            className="text-destructive"
                            aria-label={t("menu.item.deleteNamed", { name: item.name })}
                            onClick={() => onDeleteItem(item)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablets/desktop: refined table, scrolls inside the card if it must. */}
              <div className="-mx-4 hidden overflow-x-auto sm:-mx-5 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="ps-4 sm:ps-5">{t("common.name")}</TableHead>
                      <TableHead>{t("menu.item.stationShort")}</TableHead>
                      <TableHead className="text-end">{t("common.price")}</TableHead>
                      <TableHead className="text-end">{t("common.tax")}</TableHead>
                      <TableHead>{t("menu.item.available")}</TableHead>
                      {canManage && <TableHead className="w-10 pe-4 sm:pe-5" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleItems.map((item) => (
                      <TableRow key={item.id} className={cn(!item.isActive && "bg-surface-2/40")}>
                        <TableCell className="ps-4 sm:ps-5">
                          <div className="flex items-center gap-3">
                            <ItemThumb item={item} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                {item.isVeg && (
                                  <Leaf
                                    className="size-3.5 shrink-0 text-status-success"
                                    aria-label={t("menu.diet.veg")}
                                  />
                                )}
                                <span className="max-w-[16rem] truncate">{item.name}</span>
                                {item.isCombo && (
                                  <Badge variant="gold" className="h-5 px-2 text-[11px]">
                                    {t("menu.combo.label")}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{item.category.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.station ? (
                            <Badge variant="neutral" className="font-normal">
                              {item.station.name}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-end font-semibold tabular-nums text-foreground">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-end tabular-nums text-muted-foreground">
                          {formatTaxPercent(item.taxRatePercent)}
                        </TableCell>
                        <TableCell>
                          {canManage ? (
                            <Switch
                              checked={item.isActive}
                              disabled={togglePending(item)}
                              onCheckedChange={(checked) => onToggleAvailable(item, checked)}
                              aria-label={t("menu.item.availableNamed", { name: item.name })}
                            />
                          ) : (
                            <StatusPill tone={item.isActive ? "success" : "neutral"}>
                              {item.isActive ? t("menu.view.available") : t("menu.view.unavailable")}
                            </StatusPill>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell className="pe-4 sm:pe-5">
                            <div className="flex items-center justify-end gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className={cn(
                                  "text-muted-foreground hover:text-primary",
                                  item.isCombo && "text-primary",
                                )}
                                title={t("menu.combo.components")}
                                aria-label={t("menu.combo.components")}
                                onClick={() => setComboItem(item)}
                              >
                                <Layers />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-primary"
                                title={t("menu.item.editTitle")}
                                aria-label={t("menu.item.editTitle")}
                                onClick={() => setEditingItem(item)}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                title={t("menu.item.delete")}
                                aria-label={t("menu.item.deleteNamed", { name: item.name })}
                                onClick={() => onDeleteItem(item)}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : items && items.length > 0 ? (
            <EmptyState compact icon={UtensilsCrossed} title={t("menu.noMatches")} />
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title={t("menu.empty.title")}
              description={t("menu.empty.description")}
              action={canManage ? <AddItemDialog branchId={branchId} categories={categories ?? []} /> : undefined}
            />
          )}
        </Card>
      </div>

      <ComboComponentsDialog
        branchId={branchId}
        item={comboItem}
        allItems={allItems ?? []}
        open={!!comboItem}
        onOpenChange={(open) => !open && setComboItem(null)}
      />

      {editingCategory && (
        <EditCategoryDialog
          branchId={branchId}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {editingItem && (
        <EditItemDialog
          branchId={branchId}
          item={editingItem}
          categories={categories ?? []}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
