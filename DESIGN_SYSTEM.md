# UI kit — Saudi edition (2026 redesign)

Use these for every dashboard page so the app reads as one product.

**Shell** (`components/layout/app-shell.tsx`): dark-emerald grouped sidebar
(collapsible to an icon rail), sticky header that already shows the page
name + icon, floating tab bar on phones. `<main>` scrolls; it pads
`p-4 sm:p-6 lg:p-8` (max width 1440px) or, for `/pos`, `/kds`, `/tables`,
`p-3 sm:p-4 lg:p-5` full-width. Phones reserve `pb-28` for the tab bar.
Full-height screens size themselves with `h-[calc(100dvh-4rem-<padding>)]`
— the header is 4rem — or better, `flex-1 min-h-0` inside a flex column.

**Primitives** (`components/ui/`):
- `PageHeader` — title, description, icon, `actions`, children (tabs/filters). Every page starts with it (except POS/KDS full-screen workspaces, which use a compact toolbar).
- `StatCard` — KPI tile (label, value, icon, `tone`, hint).
- `Segmented` — pill segmented control for filters, order types, views (supports icons and count bubbles).
- `StatusPill` + `ORDER_STATUS_TONE`, `TABLE_STATUS_TONE`, `KOT_STATUS_TONE` — the one way to colour a status.
- `EmptyState`, `Toolbar`, `SearchInput`, `Card`, `Badge` (`success|warning|danger|info|neutral|gold` variants), `Tabs` (pill style), `Button` (`h-9`, `lg` = `h-11` for primary touch actions).

**Tokens** (Tailwind classes): `bg-background` sand page, `bg-card` white
surfaces, `bg-surface-2` recessed areas (column backgrounds, segmented
tracks), `bg-accent text-accent-foreground` soft emerald highlight,
`bg-primary` emerald (primary actions only), `text-gold`/`bg-status-gold-soft`
for small premium highlights, `bg-status-{success,warning,danger,info,neutral,gold}(-soft)`
for state. Radii: cards `rounded-2xl`, controls `rounded-xl`. Borders
`border-border/80`; shadows come from the card token — don't add heavy ones.

**Rules**
- Mobile first: single column on phones, grids that grow with `sm:`/`lg:`/`xl:`; use `grid-cols-[repeat(auto-fill,minmax(…,1fr))]` for tile grids. No horizontal page scroll; wide tables scroll inside their card (`overflow-x-auto`) or turn into card lists below `md`.
- Touch targets ≥ 44px on service screens (POS, KDS, tables).
- Numbers `tabular-nums`; money via `formatCurrency`.
- Logical properties only (`ms/me/ps/pe/start/end/text-start`), RTL must look intentional.
- Keep every existing behaviour, permission check, query, mutation and translation key; add new keys to the screen's own namespace in both `messages/en` and `messages/ar`.

---

> **Saudi edition palette (2026):** the primary accent is now deep emerald
> `#0B5D4A` (dark theme `#3DBB94`) with a restrained gold `#B08A3E`, warm sand
> neutrals and charcoal text — see `apps/web/app/globals.css`. Layouts use
> logical (RTL-safe) utilities. Everything else below still applies; read
> "wine/burgundy" as the primary token.

# Design System

Bar to hit: Stripe Dashboard, Linear, Notion, Vercel, Raycast, Arc, Figma,
Framer, Shopify Admin, Clerk Dashboard. Minimal, spacious, confident
typography, restrained color, real motion — not a "POS with rounded
corners." A screen that looks like a generic admin template is not done.

Every nontrivial UI task in this repo should pull from the installed
frontend skills in this order (see global `~/.claude/CLAUDE.md` for full
detail): `frontend-design` for the initial Design Read →
`bencium-controlled-ux-designer`'s ask-first protocol for real
color/typography stakes → `react-best-practices` / `composition-patterns`
while writing components → `web-design-guidelines` + `accesslint` audit
before calling anything done.

## Color tokens (light)

```
--background:      #FAFAFA
--card:             #FFFFFF
--sidebar:          #FCFCFC
--foreground:       #111827   /* primary text */
--muted-foreground: #6B7280   /* secondary text */
--border:           #E5E7EB
--success:          #22C55E
--warning:          #F59E0B
--danger:           #EF4444
--primary:          #9F1239   /* wine/burgundy — see rationale below */
--primary-foreground: #FFFFFF
```

Dark mode (own token set, not `background * 0.1` math):

```
--background:       #0B0B0D
--card:              #151517
--sidebar:           #111113
--foreground:        #F4F4F5
--muted-foreground:  #9CA3AF
--border:            #26262A
--success:           #34D399
--warning:           #FBBF24
--danger:            #F87171
--primary:           #FB7185   /* brighter rose for dark-bg contrast */
--primary-foreground: #1F0A0F
```

**Primary accent decision (the one deliberate risk):** wine/burgundy
instead of the expected SaaS indigo/blurple (Stripe, Linear) or restaurant
cliché tomato-red. It's a considered nod to hospitality (wine lists, velvet
banquettes, fine dining) that stays distinct from the danger-red already in
the palette, and reads as premium rather than generic-dashboard-default —
finalized directly rather than looped back for a color-swatch vote, since
this is an internal operator tool, not a client-facing brand identity where
that stakes-based ask-first call would apply. Revisit only if a real
restaurant-brand pass (logo, physical signage) later demands matching an
existing brand color instead.

## Typography

Font: Geist (or Inter as fallback) — one premium sans, no mixing.

| Role | Size | Weight |
|---|---|---|
| Dashboard title | 32px | semibold |
| Section title | 24px | semibold |
| Card title | 18px | medium |
| Body | 15–16px | regular |
| Small label | 13px | medium, muted |
| Numbers (KPIs) | large, bold, tabular-nums | — |

## Layout

Top nav (workspace switcher, search/command palette, notifications, user
menu) + collapsible icon+label sidebar + content area. Sidebar collapses to
an off-canvas drawer below `lg` (this is a correctness requirement, not
cosmetic — `nodedr-pos` shipped a fixed-256px sidebar that ate 66% of a
phone viewport before it was caught and fixed; do not repeat that here,
verify at ~375px/~768px/desktop with real screenshots before calling any
layout done).

Dashboard uses a bento-grid layout where it fits (mixed card sizes, not a
uniform 3-column grid of identical boxes).

## Components (all in `packages/ui`, one consistent spacing/shadow/radius scale)

Cards: 24px padding, 16px radius, soft shadow, hover elevation.
Tables: TanStack Table wrapper — sticky header, rounded corners, hover
row, inline edit, bulk actions, column visibility, filters, sort, search,
pagination, skeleton loading, real empty states (illustration + helper
text + primary action, never a blank div).
Buttons: rounded, consistent sizing, loading/disabled/success states,
icon support.
Forms: generous spacing, floating labels, inline validation, searchable
selects, date/time pickers.
Charts: Recharts, theme-aware via CSS vars, animated, interactive.
Full primitive list to build: Button, Input, Select, Card, Table/DataGrid,
Chart wrapper, Dialog, Drawer, Toast, Tabs, Breadcrumbs, Avatar, Badge,
Progress, Timeline, Calendar, Command Palette, Search, Empty State,
Skeleton.

## Motion

Fast, natural: fade/slide/scale/spring on hover, press, page transition,
drawer open/close, toast enter/exit. Avoid excessive animation — every
motion should communicate state change, not decorate.

## Accessibility

WCAG AA minimum. Keyboard-navigable everywhere (POS and KDS screens
especially — they're used under time pressure). Visible focus states.
Screen-reader labels on icon-only buttons. Run `accesslint`'s `audit` skill
(live-DOM, not just static code read) before marking any UI surface done.

## Surface-specific notes

- **POS order screen:** built for speed — large touch targets, fast search,
  keyboard shortcuts, instant checkout, minimal clicks. This screen trades
  some of the "spacious" aesthetic for density/speed deliberately; that's a
  considered exception, not an inconsistency.
- **KDS:** large legible tickets, visible timers, color-coded status,
  drag between status columns, full-screen mode, touch-optimized — this
  screen is read from 2-3 meters away in a kitchen, so type size floors are
  higher than the rest of the app.
- **Reservation calendar:** timeline view, drag-to-reschedule, color-coded
  by status/table.
