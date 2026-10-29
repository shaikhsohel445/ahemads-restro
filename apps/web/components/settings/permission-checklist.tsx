"use client";

import { PERMISSIONS } from "@ahemads-restro/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n/context";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

// Translated permission / category names. The catalog's English `label` (and
// a custom role's server-side label) stays the fallback for any key the
// message files do not know yet, so a new permission never renders as a raw
// message key.
export function permissionLabel(t: Translate, key: string, fallback: string): string {
  const id = `settings.permission.${key}`;
  const value = t(id);
  return value === id ? fallback : value;
}

export function permissionCategoryLabel(t: Translate, category: string): string {
  const id = `settings.permissionCategory.${category}`;
  const value = t(id);
  return value === id ? category : value;
}

// Computed once at module load — PERMISSIONS is a static const, no need to
// re-group on every render.
const GROUPED_PERMISSIONS = (() => {
  const map = new Map<string, (typeof PERMISSIONS)[number][]>();
  for (const permission of PERMISSIONS) {
    const list = map.get(permission.category) ?? [];
    list.push(permission);
    map.set(permission.category, list);
  }
  return [...map.entries()];
})();

// Shared by the create/edit role dialogs — grouped by the PERMISSIONS
// catalog's `category` field so the checkbox list reads as sections
// ("Orders", "Inventory", "Admin", ...) instead of one flat 19-item list.
export function PermissionChecklist({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (key: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl bg-surface-2/60 p-2 ring-1 ring-border/70 sm:p-3">
      {GROUPED_PERMISSIONS.map(([category, permissions]) => {
        const granted = permissions.filter((p) => selected.includes(p.key)).length;
        return (
          <fieldset key={category} className="flex flex-col rounded-xl border border-border/70 bg-card">
            <legend className="sr-only">{permissionCategoryLabel(t, category)}</legend>
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {permissionCategoryLabel(t, category)}
              </p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {granted}/{permissions.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-3 p-1 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-foreground hover:bg-muted/60"
                >
                  <Checkbox
                    checked={selected.includes(permission.key)}
                    onCheckedChange={() => onToggle(permission.key)}
                  />
                  {permissionLabel(t, permission.key, permission.label)}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
