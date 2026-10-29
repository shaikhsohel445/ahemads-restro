# Editorial plan — Ahemad's Restro blog

Owner: marketing (Wem Studios). Articles live in `apps/web/content/site/blog/<slug>.ts`
and are published by adding them to `ARTICLES` in `apps/web/content/site/blog/index.ts`
(the blog index, article routes, sitemap and hreflang all read that list).

Last reviewed: 29 October 2026.

## Ground rules for every article

- **Facts verified against the product.** Every product statement must match what the
  repository implements: `apps/web/content/site/home.ts` (audited feature list),
  `docs/cloudflare/FEATURE-CHECKLIST.md` and `docs/cloudflare/SAUDI-LOCALIZATION.md`.
  State the limits where they matter: no ZATCA Phase 2 (FATOORA integration), no payment
  gateway (payments are recorded by staff), no offline mode (a live connection is required),
  no USB thermal printing in the cloud edition (browser or network printers).
- **No invented evidence.** No statistics, studies, quotes, customer stories, logos or
  "X% of restaurants" claims unless a citable source is linked in the article and kept in
  the review notes.
- **No AI filler.** No "in today's fast-paced world", no "unlock", "seamless", "revolutionise",
  no padded introductions or summaries that repeat the headings. Every section must contain
  something a restaurant owner can check, ask or do.
- **Arabic is written, not translated.** Saudi-market Arabic, Saudi terms (كاشير، مباشر،
  سفري، محلي، جهاز الشبكة، هيئة الزكاة والضريبة والجمارك، منصة فاتورة), Thursday/Friday
  references where a "busy night" is mentioned. A native speaker reviews every Arabic piece.
- **Regulatory content is dated** ("as of <month year>") and carries a "not tax/legal advice"
  note.
- **Human review before publishing.** Nothing is added to `ARTICLES` until a person has
  read it end to end in both languages and ticked the quality checklist below.
- Length: 900–1,400 words per language; `minutes` ≈ words ÷ 200 (English), ÷ 180 (Arabic).
- 4–6 keywords per language; `relatedSolutions` 2–3 slugs; a topic-specific `cta`.

### Quality checklist (copy into the PR description for each article)

- [ ] Every product claim checked against the code/docs listed above (note the file for each).
- [ ] Limits stated where a reader could otherwise assume a feature exists.
- [ ] No statistics, quotes, studies or customer stories without a linked source.
- [ ] No filler phrases; each H2 section has a concrete check, question or action.
- [ ] Arabic version written for Saudi readers and reviewed by a native speaker.
- [ ] Regulatory facts dated and sourced (ZATCA, SFDA, GST Council, etc.); "not advice" note present.
- [ ] Keywords validated in a keyword tool for the target market (see "to validate" below).
- [ ] Title ≤ ~70 characters, description ≤ ~160 characters, in both languages.
- [ ] `relatedSolutions` slugs exist for each locale the article ships in.
- [ ] Read end to end by a human reviewer: name ______ date ______.

### Solution pages available for internal links

`restaurant-management-software`, `restaurant-pos-software`, `restaurant-billing-software`,
`qr-ordering-system`, `kitchen-display-system`, `multi-branch-restaurant-management`,
`restaurant-software-saudi-arabia`, `arabic-restaurant-software`,
`restaurant-software-india` (English only — do not link it from Arabic-only content).

Home anchors: `/{lang}#features`, `#how-it-works`, `#screenshots`, `#who-its-for`,
`#pricing`, `#demo`, `#faq`. (The Saudi section on the home page has no anchor yet.)

## Status overview

| # | Topic | Slug | Status | Market | Languages |
|---|---|---|---|---|---|
| 1 | How to Choose Restaurant Management Software | `how-to-choose-restaurant-management-software` | **Published 2026-10-29** | Saudi Arabia, India, general | en, ar |
| 2 | Restaurant POS Software: A Practical Buying Guide | `restaurant-pos-software-buying-guide` | Planned | Saudi Arabia, India | en, ar |
| 3 | How QR Ordering Works in Restaurants | `how-qr-ordering-works-in-restaurants` | **Published 2026-10-29** | Saudi Arabia, India, general | en, ar |
| 4 | How a Kitchen Display System Helps Restaurant Teams | `how-a-kitchen-display-system-helps` | Planned | general | en, ar |
| 5 | Restaurant Technology Trends in Saudi Arabia | `restaurant-technology-saudi-arabia` | **Published 2026-10-29** (practical guide angle) | Saudi Arabia | en, ar |
| 6 | Restaurant Management Software for Multi-Branch Businesses | `multi-branch-restaurant-software` | Planned | Saudi Arabia, India | en, ar |
| 7 | How Restaurants Can Improve Order Accuracy | `improve-restaurant-order-accuracy` | Planned | general | en, ar |
| 8 | Digital Restaurant Operations in India | `digital-restaurant-operations-india` | Planned | India | en |
| 9 | Arabic Restaurant Software: Features to Consider | `arabic-restaurant-software-features` | Planned | Saudi Arabia, GCC | ar first, en |
| 10 | How to Evaluate Restaurant Billing Software | `evaluate-restaurant-billing-software` | Planned | Saudi Arabia, India | en, ar |

Planned slugs are proposals; confirm before writing.

---

## 1. How to Choose Restaurant Management Software — published

- **Status:** published 2026-10-29 (`how-to-choose-restaurant-management-software.ts`).
- **Audience:** owners and general managers of independent restaurants and cafés replacing
  a basic POS or paper process; first-time buyers.
- **Market / languages:** Saudi Arabia, India, general · en + ar.
- **Primary keyword (to validate):** restaurant management software · برنامج إدارة المطاعم
- **Secondary (to validate):** how to choose restaurant software; restaurant software buying
  guide; restaurant POS checklist · اختيار برنامج مطاعم; نظام إدارة المطاعم.
- **Search intent:** commercial investigation.
- **Outline:** Start with how your restaurant works · The capability checklist · Questions to
  ask every vendor · Data ownership and exports · Language and tax fit · Hardware · Total cost ·
  Run a real trial · Red flags.
- **Internal links:** `restaurant-management-software`, `restaurant-pos-software`,
  `multi-branch-restaurant-management`; home `#features`, `#demo`.
- **CTA:** "Bring your hard moments to a live demo."
- **Refresh trigger:** pricing/plan model changes; Phase 2 support added.

## 2. Restaurant POS Software: A Practical Buying Guide — planned

- **Audience:** owners and cashier leads of cafés, QSRs and takeaway shops where the till is
  the centre of the operation.
- **Market / languages:** Saudi Arabia, India · en + ar.
- **Primary keyword (to validate):** restaurant POS software · نظام نقاط البيع للمطاعم
- **Secondary (to validate):** best POS for restaurants; restaurant billing machine; cloud
  POS for cafés · برنامج كاشير مطاعم; نظام كاشير للمقاهي.
- **Search intent:** commercial investigation / transactional.
- **Outline:**
  1. What a restaurant POS must do on a busy shift (speed, modifiers, combos, half portions)
  2. Split bills, split payments and refunds — who may do what (roles, PIN switch, audit log)
  3. Order types in one place: dine-in, takeaway, delivery, QR and kiosk
  4. Hardware and printing: tablets, network vs browser printing, cash drawer, terminals
  5. Connectivity: what a cloud POS needs and your fallback routine
  6. Reports a POS should give you at close of day
  7. A 30-minute POS test script
- **Internal links:** `restaurant-pos-software`, `restaurant-billing-software`,
  `qr-ordering-system`; home `#features`, `#screenshots`, `#demo`; blog #1.
- **CTA:** "Run our POS test script on your own menu in a demo."
- **Product facts to verify:** split payments, PIN quick-switch, payment methods list, printing
  limits (no USB on Cloudflare), no offline mode.

## 3. How QR Ordering Works in Restaurants — published

- **Status:** published 2026-10-29 (`how-qr-ordering-works-in-restaurants.ts`).
- **Audience:** owners of dine-in restaurants, cafés and food-court outlets considering table
  ordering; floor managers.
- **Market / languages:** Saudi Arabia, India, general · en + ar.
- **Primary keyword (to validate):** QR code ordering system · الطلب عبر رمز QR
- **Secondary (to validate):** table QR ordering; QR menu ordering; contactless ordering
  restaurant · منيو QR للمطاعم; الطلب من الطاولة.
- **Search intent:** informational → commercial.
- **Outline:** QR menu vs ordering vs payment · Step by step after the scan · How it works in
  Ahemad's Restro · Guest experience · Kitchen side · Staff acceptance · Pitfalls (code
  rotation, Wi-Fi, availability, wrong table, payment, guests without phones) · Rollout checklist.
- **Internal links:** `qr-ordering-system`, `kitchen-display-system`, `restaurant-pos-software`;
  home `#features`, `#demo`.
- **CTA:** "Watch a QR order reach the kitchen."
- **Refresh trigger:** payment-at-table or gateway added (currently none); acceptance rules change.

## 4. How a Kitchen Display System Helps Restaurant Teams — planned

- **Audience:** head chefs, kitchen managers and owners of busy kitchens moving off paper tickets;
  cloud kitchens.
- **Market / languages:** general · en + ar.
- **Primary keyword (to validate):** kitchen display system · شاشة المطبخ للمطاعم
- **Secondary (to validate):** KDS for restaurants; kitchen order ticket screen; replace paper
  tickets kitchen · نظام شاشة المطبخ KDS; تذاكر المطبخ.
- **Search intent:** informational / commercial investigation.
- **Outline:**
  1. What changes when tickets move from paper to a screen
  2. Stations: routing items to grill, cold, drinks, pass
  3. Reading a ticket fast: modifiers, notes, table, order type
  4. Timers, ageing colours and sound alerts — pacing a service
  5. Hardware: screen size, mounting, heat, a least-privilege kitchen account
  6. Rolling it out without losing a service (run paper and screen in parallel)
- **Internal links:** `kitchen-display-system`, `qr-ordering-system`,
  `restaurant-management-software`; home `#screenshots`, `#demo`; blog #3.
- **CTA:** "See tickets move from New to Ready on a live kitchen display."
- **Product facts to verify:** station picker per device, ageing timers, sounds, KDS columns
  (New / Accepted / Preparing / Ready), `KITCHEN_STAFF` role (`docs/KIOSK-AND-KDS.md`).

## 5. Restaurant Technology Trends in Saudi Arabia — published as a practical guide

- **Status:** published 2026-10-29 as `restaurant-technology-saudi-arabia.ts`. Written as a
  practical guide dated "as of October 2026" rather than a "trends" piece, because trend
  claims would need market data we cannot cite.
- **Audience:** restaurant and café owners in KSA, operators entering the Saudi market.
- **Market / languages:** Saudi Arabia · en + ar.
- **Primary keyword (to validate):** restaurant software Saudi Arabia · برنامج مطاعم في السعودية
- **Secondary (to validate):** ZATCA e-invoicing restaurants; simplified tax invoice QR code;
  mada payments restaurant · الفوترة الإلكترونية للمطاعم; الفاتورة الضريبية المبسطة; نظام كاشير مطاعم.
- **Search intent:** informational / commercial investigation.
- **Outline:** Arabic and RTL · VAT-inclusive pricing · Simplified tax invoices and Phase 1 QR ·
  Phase 2 and FATOORA · Payment methods · Other things to plan for · Checklist before signing.
- **Internal links:** `restaurant-software-saudi-arabia`, `arabic-restaurant-software`,
  `restaurant-billing-software`; home `#features`, `#faq`, `#demo`.
- **CTA:** "See Arabic receipts and VAT invoices in a demo."
- **Refresh trigger:** any ZATCA announcement (new wave, rule change), VAT rate change, SFDA
  menu rule change, payment brand changes; at minimum every 6 months.

## 6. Restaurant Management Software for Multi-Branch Businesses — planned

- **Audience:** owners and operations managers of groups with 2–20 branches; franchise
  operators.
- **Market / languages:** Saudi Arabia, India · en + ar.
- **Primary keyword (to validate):** multi-branch restaurant management software · نظام إدارة مطاعم متعددة الفروع
- **Secondary (to validate):** restaurant chain software; central menu management; multi-location
  POS · برنامج مطاعم لعدة فروع; إدارة سلسلة مطاعم.
- **Search intent:** commercial investigation.
- **Outline:**
  1. What changes at the second branch (menus, prices, staff, stock, reports)
  2. Staff access across branches: roles, assignments, switching
  3. Stock between branches: transfers, purchasing, waste
  4. Reporting per branch and across the group
  5. Branch-level settings: tax, currency, time zone, receipts
  6. Questions to ask before opening the next branch
- **Internal links:** `multi-branch-restaurant-management`, `restaurant-management-software`,
  `restaurant-software-saudi-arabia`; home `#who-its-for`, `#pricing`, `#demo`; blog #1.
- **CTA:** "Walk through a two-branch setup with your own locations."
- **Product facts to verify:** branch switching, per-branch reports, stock transfers, per-branch
  tax regime. Do not claim consolidated cross-branch dashboards unless verified in the code.

## 7. How Restaurants Can Improve Order Accuracy — planned

- **Audience:** floor managers, kitchen managers, owners dealing with remakes and complaints.
- **Market / languages:** general · en + ar.
- **Primary keyword (to validate):** restaurant order accuracy · دقة الطلبات في المطاعم
- **Secondary (to validate):** reduce order mistakes restaurant; wrong orders kitchen;
  modifier errors · تقليل أخطاء الطلبات; أخطاء المطبخ.
- **Search intent:** informational.
- **Outline:**
  1. Where order mistakes actually happen (taking, transmitting, cooking, handing over)
  2. Menu design that prevents errors: required options, clear modifiers, bilingual names
  3. Getting the order to the kitchen intact: KDS routing vs handwritten tickets
  4. Letting guests order directly (QR, kiosk) — and where that adds new risks
  5. Handover checks: order numbers, table numbers, pass checks
  6. Measuring mistakes without blame: voids, remakes and refunds in reports
- **Internal links:** `kitchen-display-system`, `qr-ordering-system`, `restaurant-pos-software`;
  home `#features`; blog #3, #4.
- **CTA:** "See how required options and station routing look on the kitchen screen."
- **Note:** no "X% of orders are wrong" statistics unless sourced.

## 8. Digital Restaurant Operations in India — planned

- **Audience:** restaurant, café and cloud-kitchen owners in India moving from billing-only
  software or manual registers.
- **Market / languages:** India · en only (the India solution page is English only).
- **Primary keyword (to validate):** restaurant software India
- **Secondary (to validate):** restaurant billing software India; GST billing for restaurants;
  cloud kitchen software India.
- **Search intent:** commercial investigation.
- **Outline:**
  1. From billing software to restaurant operations: what to connect first
  2. GST on restaurant bills: settings, GSTIN, CGST/SGST on receipts (with a "verify with your
     CA" note)
  3. UPI and other payments: recording methods and daily reconciliation
  4. Delivery and cloud-kitchen workflows: zones, drivers, takeaway timing
  5. Inventory and recipes for food-cost control
  6. Staff, shifts and attendance
  7. Checklist for a first month
- **Internal links:** `restaurant-software-india`, `restaurant-billing-software`,
  `restaurant-pos-software`; home `#features`, `#demo`; blog #1.
- **CTA:** "See GST receipts and INR pricing in a demo."
- **Product facts to verify:** `INDIA_GST` regime and CGST/SGST split
  (`packages/types/src/tax.ts`), INR selectable, UPI shown only when a UPI VPA is configured,
  delivery zones by pincode. Do not claim GST e-invoicing (IRN) or aggregator integrations.

## 9. Arabic Restaurant Software: Features to Consider — planned

- **Audience:** Arabic-speaking owners and managers in KSA and the GCC; operators with Arabic-
  speaking staff.
- **Market / languages:** Saudi Arabia, GCC · ar first, then en.
- **Primary keyword (to validate):** برنامج مطاعم عربي · Arabic restaurant software
- **Secondary (to validate):** نظام كاشير عربي; برنامج إدارة مطاعم باللغة العربية · Arabic POS
  system; RTL restaurant software.
- **Search intent:** commercial investigation.
- **Outline:**
  1. Real RTL vs translated labels: what to look for
  2. Per-user language and bilingual menu items
  3. Arabic on paper: receipts, invoices and PDF reports
  4. Numbers, dates and mixed-direction text
  5. Guest screens in Arabic: QR ordering and kiosk
  6. A 10-minute Arabic test before you buy
- **Internal links:** `arabic-restaurant-software`, `restaurant-software-saudi-arabia`,
  `qr-ordering-system`; home `#screenshots`, `#demo`; blog #5.
- **CTA:** "Switch the whole system to Arabic in a live demo."
- **Product facts to verify:** 2,183 keys per language, IBM Plex Sans Arabic in UI/receipts/PDF,
  Latin digits, kiosk starts in Arabic. State known gaps honestly where relevant (some
  server-generated text is English; plural forms simplified).

## 10. How to Evaluate Restaurant Billing Software — planned

- **Audience:** owners, accountants and finance managers responsible for invoices and tax.
- **Market / languages:** Saudi Arabia, India · en + ar.
- **Primary keyword (to validate):** restaurant billing software · برنامج فواتير المطاعم
- **Secondary (to validate):** restaurant invoice software; VAT billing restaurant; GST billing
  restaurant · برنامج فوترة للمطاعم; فاتورة ضريبية للمطاعم.
- **Search intent:** commercial investigation.
- **Outline:**
  1. Who calculates the bill: server-side vs device-side
  2. Tax-inclusive vs tax-exclusive pricing, per-item rates, discounts and tax
  3. Split bills, tips, service charges and refunds
  4. Receipts and invoices that satisfy your tax rules (Saudi simplified invoices, Indian GST)
  5. E-invoicing obligations: what the software covers and what needs an integration
  6. Reports your accountant will ask for, and exports
  7. Evaluation checklist
- **Internal links:** `restaurant-billing-software`, `restaurant-software-saudi-arabia`,
  `restaurant-software-india` (en only); home `#features`, `#faq`, `#demo`; blog #1, #5.
- **CTA:** "Print a test invoice from your own menu in a demo."
- **Product facts to verify:** server-authoritative settlement, tax-inclusive per branch, Phase 1
  QR only, report exports (CSV/Excel/PDF). "Not tax advice" note required.

---

## Publishing cadence

- **Now:** articles 1, 3 and 5 (published 2026-10-29).
- **Then one article every two weeks**, alternating Saudi-focused and general topics so both
  markets get regular content. Suggested order: 2 (POS guide), 9 (Arabic features),
  4 (KDS), 10 (billing), 6 (multi-branch), 8 (India), 7 (order accuracy).
- Each article ships in all its languages on the same day so hreflang pairs stay complete.
- Allow one week per article: draft (2 days), product fact check (1 day), Arabic native review
  (2 days), final human read and publish (1–2 days).
- If the team cannot keep this pace, publish monthly rather than lowering the review standard.

## Update and refresh policy

- **Set `updated`** (ISO date) on the article whenever content changes materially; leave
  `published` unchanged. Typo fixes do not need a new date.
- **Saudi regulatory content** (articles 5, 10, and any VAT/ZATCA mention): review every
  6 months and immediately after any ZATCA, SFDA or VAT announcement. Keep the "as of
  <month year>" line current.
- **India tax content** (articles 8, 10): review every 6 months and after GST Council changes.
- **Product statements:** review all articles whenever a release changes a feature mentioned
  in them — in particular if Phase 2 integration, a payment gateway, offline mode or USB
  printing is ever added, update every article that states those limits.
- **Annual review** of every article: check facts, links to solution pages, keywords against
  current search data, and remove anything that has gone stale.
- **Retire rather than rot:** if an article cannot be kept accurate, remove it from
  `ARTICLES` and redirect its URL to the closest solution page.
- Keep a short changelog in each article module's header comment (date, what changed, reviewer).
