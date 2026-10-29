/**
 * Shared look for data tables on the inventory, accounting, reports,
 * marketing and operations screens. Put `TABLE_CARD` on the wrapping
 * `<Card>`: it removes the card padding, caps the table's own scroll area
 * so the header can stick, and styles header/body cells (muted header row,
 * roomy cells, row hover comes from `TableRow`).
 */
export const TABLE_CARD =
  "gap-0 overflow-hidden py-0 [&_[data-slot=table-container]]:max-h-[70vh] [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-surface-2 [&_thead_tr]:border-border/70 [&_thead_tr]:hover:bg-transparent [&_th]:h-11 [&_th]:px-4 [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:px-4 [&_td]:py-3 [&_tbody_tr]:border-border/60";

/** Header strip inside a table card: title + description + actions. */
export const TABLE_CARD_HEAD =
  "flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5";

/** Footer total row under a table card. */
export const TABLE_CARD_FOOT =
  "flex items-center justify-between gap-3 border-t border-border/70 bg-surface-2/60 px-4 py-3 text-sm sm:px-5";

/** Native `<select>` styled like `Input`. */
export const SELECT_CLASS =
  "h-10 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/** Small form label above a field. */
export const FIELD_LABEL = "text-xs font-medium text-muted-foreground";
