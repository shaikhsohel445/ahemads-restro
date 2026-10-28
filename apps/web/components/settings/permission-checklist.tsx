"use client";

import { PERMISSIONS } from "@nodedr-restaurant/types";
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
    <div className="flex max-h-72 flex-col gap-4 overflow-y-auto rounded-lg border border-border p-3">
      {GROUPED_PERMISSIONS.map(([category, permissions]) => (
        <div key={category} className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {permissionCategoryLabel(t, category)}
          </p>
          {permissions.map((permission) => (
            <label
              key={permission.key}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <Checkbox
                checked={selected.includes(permission.key)}
                onCheckedChange={() => onToggle(permission.key)}
              />
              {permissionLabel(t, permission.key, permission.label)}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
