# Saudi Arabia localization

## Languages and RTL

- English and Arabic are complete: **2,183 keys each**
  (`apps/web/messages/{en,ar}/<area>.json`, one file per screen area).
  `pnpm i18n:check` fails if any key is missing in Arabic or used in code
  without an English source. Spanish and French from the original app remain
  as partial translations and fall back to English.
- Switcher in the sidebar, on sign-in/sign-up, on the landing site, the QR
  order page and the kiosk. The choice is saved in `localStorage`
  (`nodedr-locale`); first visit follows the browser language. The kiosk
  starts every customer in Arabic and never remembers a choice
  (`components/kiosk/kiosk-locales.ts`, `KIOSK_DEFAULT_LOCALE`).
- Choosing Arabic sets `<html lang="ar" dir="rtl">` before first paint
  (inline script in `app/layout.tsx`), so nothing flips after load.
- Layouts use logical utilities (`ms-/me-/ps-/pe-/start-/end-/text-start`).
  `scripts/rtl/logical-classes.mjs` converted every physical class and adds
  `rtl:-scale-x-100` to directional icons; logos, QR codes and the floor-plan
  canvas (a spatial drawing with stored coordinates) stay LTR on purpose.
  Amount, phone and code inputs are `dir="ltr"`; order numbers, codes and
  phone numbers inside Arabic sentences are isolated with `<bdi>`.
- Font: IBM Plex Sans Arabic (Arabic + Latin) through `next/font`, used for
  Arabic UI text, the printed receipts and PDF report exports
  (`apps/api/assets/fonts`, OFL licence).
- Arabic uses Latin digits (`ar-SA-u-nu-latn`), as Saudi POS screens and
  receipts usually do; dates use the Gregorian calendar.

Known gaps: Arabic plurals use one form ("{n} ضيوف") rather than the full
dual/plural set; free text that comes from the server (API error messages,
notification bodies, some report cell values) is English; user data (menu
names, table names) is shown as entered — enter bilingual names, e.g.
"كبسة دجاج — Chicken Kabsa", as the demo seed does.

## Currency, time zone, regional defaults

`packages/types/src/region.ts` holds the defaults in one place:
SAR, Asia/Riyadh, country SA, regime SA_VAT. New restaurants get them (schema
defaults); existing restaurants keep their own settings. The web app formats
every amount and date through `apps/web/lib/format.ts`, which uses the
signed-in restaurant's currency and time zone (Riyadh time even when the
browser is elsewhere; the Worker itself runs in UTC). Money stays numeric
everywhere; rounding to the currency's minor unit is unchanged (2 decimals
for SAR).

## Tax: SA_VAT

`packages/types/src/tax.ts` adds the `SA_VAT` regime:

| | |
|---|---|
| Default rate for new menu items | 15 % (server-side default when the client sends none) |
| Pricing | VAT-inclusive (consumer prices must include VAT) |
| Receipt label | VAT / ضريبة القيمة المضافة |
| Tax ID label | VAT registration number (15 digits, starts and ends with 3 — warned, not blocked) |

The tax engine itself is the original server-authoritative one
(`apps/api/src/modules/orders/pricing.ts`, `settlement.ts`): per-item rates
(so zero-rated or exempt items are possible), tax-inclusive or -exclusive per
branch, discounts reduce the taxable value proportionally, tips and delivery
fees are outside it, the client can never send tax amounts. Tests:
`apps/api/src/modules/orders/saudi-vat.spec.ts`.

**Before going live, confirm the current VAT rate and any item-specific
treatment with ZATCA or a tax adviser.** The 15 % figure is the standard rate
in force since July 2020; nothing here is tax advice.

## ZATCA e-invoicing

- **Phase 1 (generation) — implemented.** A paid receipt from an SA_VAT
  branch with a VAT number is a bilingual *Simplified Tax Invoice / فاتورة
  ضريبية مبسطة* with the QR code ZATCA requires: Base64 TLV of seller name,
  VAT number, timestamp, total incl. VAT and VAT total
  (`packages/types/src/zatca.ts`). Provisional bills never carry it.
- **Phase 2 (integration with FATOORA) — not implemented.** It needs UBL 2.1
  XML invoices, a cryptographic stamp from a ZATCA-issued CSID, the invoice
  hash chain and real-time clearance/reporting. A restaurant subject to Phase
  2 must add that integration (or a certified provider) before relying on
  this system for compliant invoicing.

## Payments

Payment methods: cash, card, **mada**, **STC Pay**, **Apple Pay**, bank
transfer, gift card, store credit, other; UPI only appears when a restaurant
has a UPI VPA configured (kept for Indian restaurants). Payments are recorded
by staff after the terminal or wallet approves them — nothing is ever marked
paid from a client redirect or a displayed QR code. No payment gateway is
integrated; connecting one (e.g. a Saudi acquirer's API with server-side
webhook verification) would be new work and needs provider credentials.

## Design

Deep emerald primary (`#0B5D4A`), restrained gold accent (`#B08A3E`, used
for small highlights only), warm sand backgrounds, charcoal text; light and
dark themes (`apps/web/app/globals.css`). Components, spacing and workflows
are the original shadcn/ui ones so existing users keep their bearings.
