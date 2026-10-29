# Ahemad's Restro design system

How the Ahemad's Restro application (`apps/web/app/(app)`) is built so every
screen reads as one product. The marketing site (`apps/web/app/(site)`) uses
the same tokens. Brand assets (logo, icons, brand colours) and their usage
rules are in [docs/marketing/ASSETS.md](docs/marketing/ASSETS.md).

## UI kit (2026 redesign)

Use these for every dashboard page.

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

## Colour tokens

Defined in `apps/web/app/globals.css` (light on `:root`, dark on `.dark`).
Every pair used for text is meant to meet WCAG AA.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FAF7F2` (sand) | `#0D1311` | page |
| `--foreground` | `#1F2328` (charcoal) | `#F1F1EE` | primary text |
| `--card` | `#FFFFFF` | `#141C19` | surfaces |
| `--muted-foreground` | `#5F6368` | `#A3ABA7` | secondary text |
| `--primary` | `#0B5D4A` (emerald) | `#3DBB94` | primary actions, focus ring |
| `--accent` / `--accent-foreground` | `#E8F2EE` / `#0B5D4A` | `#15302A` / `#6FD3B2` | soft highlight |
| `--gold` | `#B08A3E` | `#D4B26A` | small highlights only |
| `--border` | `#E6DFD3` | `#25302C` | borders |
| `--success` | `#15803D` | `#34D399` | state |
| `--warning` | `#B45309` | `#FBBF24` | state |
| `--destructive` | `#C2410C` | `#F87171` | errors, destructive actions |

The UI gold (`#B08A3E`) is darker than the brand gold used in the logo and
marketing graphics (`#C9A35A`) so that it keeps contrast on light surfaces.

## Typography

- Latin text: Geist (`--font-geist-sans`), Geist Mono for code.
- Arabic text: IBM Plex Sans Arabic (`--font-arabic`, applied through
  `:lang(ar)`), also used for printed receipts and PDF exports.
- Fonts are loaded with `next/font` at build time (`apps/web/lib/fonts.ts`);
  visitors' browsers make no request to Google.

| Role | Size | Weight |
|---|---|---|
| Dashboard title | 32px | semibold |
| Section title | 24px | semibold |
| Card title | 18px | medium |
| Body | 15–16px | regular |
| Small label | 13px | medium, muted |
| Numbers (KPIs) | large, bold, tabular-nums | — |

## Design principles

These come from the upstream project, Nodedr OrderRestro, and still apply.

- **Bar to hit:** minimal, spacious, confident typography, restrained colour,
  motion that communicates a state change. A screen that looks like a
  generic admin template is not done.
- **Layout:** header + collapsible sidebar + content. The sidebar becomes an
  off-canvas drawer below `lg`; verify every layout at about 375 px, 768 px
  and desktop widths with real screenshots, in both English and Arabic.
- **Components:** cards with generous padding, 16 px radius and a soft
  shadow; tables (TanStack Table) with sticky headers, hover rows, filters,
  sorting, search, skeleton loading and real empty states (helper text and a
  primary action, never a blank area); buttons with loading and disabled
  states; forms with visible labels and inline validation; charts with
  Recharts, themed through the CSS variables.
- **Motion:** fast and natural (fade, slide, scale) on hover, press, drawers
  and toasts; respect `prefers-reduced-motion`.
- **Accessibility:** WCAG 2.1 AA minimum; keyboard-navigable everywhere,
  especially POS and KDS; visible focus states; labels on icon-only buttons.
  See [ACCESSIBILITY.md](ACCESSIBILITY.md).

## Surface-specific notes

- **POS order screen:** built for speed — large touch targets, fast search,
  minimal clicks, instant checkout. It trades some spaciousness for density
  on purpose.
- **KDS:** large legible tickets, visible timers, colour-coded status,
  touch-optimised; it is read from 2–3 metres away in a kitchen, so type sizes
  are larger than in the rest of the app.
- **Reservations:** agenda by time slot, colour-coded by status.
- **Floor plan:** the floor designer canvas stays left-to-right in Arabic on
  purpose, because table coordinates are stored and shared across languages.

## History

The upstream design used a wine/burgundy primary (`#9F1239`) on neutral
greys. This edition replaced it with the emerald, gold and sand palette above
(October 2026) and redesigned the shell and screens; component locations
changed from the planned `packages/ui` to `apps/web/components/ui/`.
