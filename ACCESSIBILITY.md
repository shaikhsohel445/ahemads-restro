# Accessibility statement

Last updated 29 October 2026. A version of this statement is also served as a page at `/docs/accessibility` by the application.

## Our target

Ahemad's Restro targets **WCAG 2.1 Level AA** across the marketing site and the product application (POS, dashboard, kitchen display, settings), in both English and Arabic (right-to-left).

This statement is a good-faith snapshot, not a certification. No third-party auditor has been engaged and no formal WCAG AA certification has been obtained for this product.

## What the product does

- Semantic HTML and landmark regions (`header`/`main`/`nav`), with real buttons and links rather than clickable `div`s.
- Keyboard navigation for interactive controls, including the mobile navigation, tab panels and form flows.
- Visible focus indicators (focus-visible rings) on interactive elements.
- Colour contrast checked against the design system's light and dark token pairs (see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)) for the text-on-background combinations used in the primary UI.
- Animation respects `prefers-reduced-motion`.
- Alt text on informative images; decorative graphics are marked `aria-hidden`.
- Form inputs (sign-in, sign-up, checkout) have visible labels, and validation errors are shown as text, not by colour alone.
- Arabic pages set `lang="ar"` and `dir="rtl"` on the document before first paint, so assistive technology announces the right language and reading order.
- Touch targets of at least 44 px on service screens (POS, KDS, tables).

## How it is tested

The statement above was inherited from the upstream project, Nodedr OrderRestro, which ran automated audits (axe-core based tooling) and manual keyboard and screen-reader reviews of new screens. The interface of this edition was redesigned on 29 October 2026 and has **not** had a separate accessibility audit since.

No full manual audit with people who rely on assistive technology every day has been performed. That is the largest gap between an automated check and real accessibility.

## Known gaps

- No screen-reader pass in Arabic yet.
- No dedicated screen-reader pass on the kitchen display and other live-updating views; new tickets arriving over WebSockets need an `aria-live` audit.
- The redesigned screens (October 2026) have not been audited.
- No published VPAT (Voluntary Product Accessibility Template).
- Third-party surfaces (browser print dialogs, operating-system file pickers) inherit their accessibility from the browser or operating system.

## Reporting a problem

If you meet an accessibility barrier, please open an issue in this repository with as much detail as you can: the page, the language, the assistive technology and browser you used, what you expected and what happened. Accessibility problems are treated as bugs. You can also contact the maintainers, Wem Studios, through <https://wemstudios.in/> or by phone at [+91 8308042362](tel:+918308042362).
