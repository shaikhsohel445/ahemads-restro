"use client";

import { Plus, SearchX, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryError } from "@/components/ui/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/toolbar";
import { useCategories, useMenuItems, type MenuItem } from "@/hooks/use-menu";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Soft, on-palette backgrounds for dishes without a photo; picked from the
// name so a dish keeps the same colour between visits.
const PLACEHOLDER_TONES = [
  "bg-accent text-accent-foreground",
  "bg-status-gold-soft text-status-gold",
  "bg-status-info-soft text-status-info",
  "bg-status-warning-soft text-status-warning",
  "bg-status-success-soft text-status-success",
  "bg-surface-2 text-muted-foreground",
];

function toneFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_TONES[h % PLACEHOLDER_TONES.length];
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const picked = words.length > 1 ? [words[0], words[1]] : [words[0] ?? ""];
  return picked.map((w) => Array.from(w)[0] ?? "").join("").toUpperCase();
}

export function ProductGrid({
  branchId,
  onSelect,
  quantities,
}: {
  branchId: string | null;
  onSelect: (item: MenuItem) => void;
  /** Units of each menu item already in the cart, shown as a badge on its tile. */
  quantities?: Record<string, number>;
}) {
  const { t } = useI18n();
  const { data: categories } = useCategories(branchId);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data: items, isLoading, isError, error, refetch, isFetching } = useMenuItems(branchId, activeCategoryId);

  const filtered = items?.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const hasCategories = !!categories && categories.length > 0;
  const categoryList = hasCategories
    ? [
        { id: undefined as string | undefined, name: t("common.all"), count: undefined as number | undefined },
        ...categories.map((c) => ({
          id: c.id as string | undefined,
          name: c.name,
          count: c._count.items as number | undefined,
        })),
      ]
    : [];

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0 xl:flex-row xl:gap-4">
      {/* Category rail (wide screens). */}
      {hasCategories && (
        <nav
          aria-label={t("common.category")}
          className="hidden w-48 shrink-0 flex-col gap-1 overflow-y-auto rounded-2xl border border-border/80 bg-card p-2 [scrollbar-width:thin] xl:flex 2xl:w-56"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t("pos.menu.categories")}
          </p>
          {categoryList.map((c) => {
            const active = c.id === activeCategoryId;
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => setActiveCategoryId(c.id)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-sm transition-colors",
                  active
                    ? "bg-accent font-semibold text-accent-foreground ring-1 ring-primary/15"
                    : "font-medium text-foreground hover:bg-muted",
                )}
              >
                <span className="min-w-0 leading-tight break-words">{c.name}</span>
                {c.count !== undefined && (
                  <span
                    className={cn(
                      "min-w-6 shrink-0 rounded-full px-1.5 text-center text-[11px] leading-5 tabular-nums",
                      active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:min-h-0">
        {/* Search + category chips; pinned while the menu scrolls on phones and tablets. */}
        <div className="flex flex-col gap-2.5 max-lg:sticky max-lg:top-0 max-lg:z-10 max-lg:-mx-3 max-lg:bg-background/90 max-lg:px-3 max-lg:py-2 max-lg:backdrop-blur-xl sm:max-lg:-mx-4 sm:max-lg:px-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("pos.menu.search")}
            className="sm:max-w-none [&_input]:h-11"
          />
          {hasCategories && (
            <div
              role="group"
              aria-label={t("common.category")}
              className="-mx-3 flex gap-2 overflow-x-auto px-3 py-0.5 [scrollbar-width:none] sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0.5 xl:hidden [&::-webkit-scrollbar]:hidden"
            >
              {categoryList.map((c) => {
                const active = c.id === activeCategoryId;
                return (
                  <button
                    key={c.id ?? "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveCategoryId(c.id)}
                    className={cn(
                      "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap ring-1 transition-colors",
                      active
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-card text-foreground ring-border/80 hover:bg-muted",
                    )}
                  >
                    {c.name}
                    {c.count !== undefined && (
                      <span
                        className={cn(
                          "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 tabular-nums",
                          active ? "bg-white/20 text-primary-foreground" : "bg-surface-2 text-muted-foreground",
                        )}
                      >
                        {c.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isError && !items ? (
          <QueryError error={error} what={t("pos.menu.what")} onRetry={() => void refetch()} retrying={isFetching} />
        ) : (
          <div className="grid auto-rows-min grid-cols-[repeat(auto-fill,minmax(9.25rem,1fr))] gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pe-1 lg:pb-2 lg:[scrollbar-width:thin] 2xl:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))]">
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="flex flex-col gap-2 p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            {filtered?.map((item) => (
              <ProductTile
                key={item.id}
                item={item}
                quantity={quantities?.[item.id] ?? 0}
                onSelect={() => onSelect(item)}
              />
            ))}
            {filtered?.length === 0 && !isLoading && (
              <EmptyState
                compact
                className="col-span-full"
                icon={search ? SearchX : UtensilsCrossed}
                title={search ? t("pos.menu.noMatch", { search }) : t("pos.menu.emptyCategory")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Image-forward menu tile: photo (or initials), markers, name, price and a
// visual "+" — tapping anywhere adds one (or opens the options picker).
function ProductTile({
  item,
  quantity,
  onSelect,
}: {
  item: MenuItem;
  quantity: number;
  onSelect: () => void;
}) {
  const { t } = useI18n();
  // Inactive (switched off) items read as sold out and cannot be added.
  const soldOut = item.isActive === false;
  const hasOptions = item.modifierGroups.length > 0;
  const vegLabel = item.isVeg ? t("pos.menu.veg") : t("pos.menu.nonVeg");

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={soldOut}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-start transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        quantity > 0 ? "border-primary/50 ring-1 ring-primary/25" : "border-border/80",
        soldOut
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded asset served from R2, not a Next-optimizable remote source
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className={cn(
              "size-full object-cover transition-transform duration-300",
              soldOut ? "grayscale" : "group-hover:scale-[1.04]",
            )}
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex size-full items-center justify-center text-2xl font-semibold tracking-tight",
              toneFor(item.name),
            )}
          >
            {initialsOf(item.name)}
          </div>
        )}

        {/* Small markers: veg / non-veg and combo. */}
        <div className="absolute start-2 top-2 flex items-center gap-1">
          <span
            title={vegLabel}
            className={cn(
              "flex size-5 items-center justify-center rounded-md border-[1.5px] bg-card/95",
              item.isVeg ? "border-status-success" : "border-status-danger",
            )}
          >
            <span className={cn("size-2 rounded-full", item.isVeg ? "bg-status-success" : "bg-status-danger")} />
            <span className="sr-only">{vegLabel}</span>
          </span>
          {item.isCombo && (
            <span className="rounded-md bg-status-gold-soft px-1.5 text-[10px] leading-5 font-semibold text-status-gold">
              {t("pos.menu.combo")}
            </span>
          )}
        </div>

        {quantity > 0 && (
          <span className="absolute end-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums shadow-sm">
            {quantity}
            <span className="sr-only"> {t("pos.menu.inCart", { n: quantity })}</span>
          </span>
        )}

        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/40">
            <span className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-status-danger shadow-sm">
              {t("pos.menu.soldOut")}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="line-clamp-2 min-h-10 text-sm leading-5 font-medium text-foreground">{item.name}</span>
        <div className="mt-auto flex items-end justify-between gap-2">
          <span className="flex min-w-0 flex-col">
            <span className="text-base font-semibold tracking-tight text-foreground tabular-nums">
              {formatCurrency(item.price)}
            </span>
            {item.halfPrice != null ? (
              <span className="truncate text-[11px] text-muted-foreground tabular-nums">
                {t("pos.menu.halfPrice", { price: formatCurrency(item.halfPrice) })}
              </span>
            ) : hasOptions ? (
              <span className="truncate text-[11px] text-muted-foreground">{t("pos.menu.hasOptions")}</span>
            ) : null}
          </span>
          {!soldOut && (
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
