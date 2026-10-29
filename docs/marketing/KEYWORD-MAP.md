# Keyword map — Ahemad's Restro marketing site

Owner: marketing (Wem Studios). Last reviewed: 29 October 2026.

This map says which page of the marketing site should rank for which search queries, in
English and Arabic, so that pages do not compete with each other. Landing pages live in
`apps/web/content/site/solutions/<slug>.ts` (registry: `index.ts`), the home page in
`apps/web/content/site/home.ts`, and blog articles in `apps/web/content/site/blog/` (plan:
`docs/marketing/EDITORIAL-PLAN.md`).

> **Search volumes, keyword difficulty, CPC and current rankings have NOT been measured
> for this document.** The keywords below are hypotheses based on how restaurant owners
> describe these products and on common Arabic phrasing. Before prioritising work, rewriting
> titles or buying ads, validate every group with Google Keyword Planner, Google Search
> Console (once the site has impressions) and a third-party keyword tool, separately for
> Saudi Arabia, India and other markets. Record the date and source of any numbers you add.

## How to read the tables

- **Intent**: *informational* (learning how something works), *commercial* (comparing or
  evaluating products), *transactional* (ready to request a demo, quote or price).
- **Market**: SA = Saudi Arabia, IN = India, global = any English-speaking market,
  Arab = Arabic-speaking markets outside Saudi Arabia.
- **Owner page**: the single page that should rank for the group. Other pages may mention
  the words but should link to the owner instead of targeting them in their title or H1.

## 1. English keyword groups

| Group | Example queries (to validate) | Intent | Owner page | Market |
|---|---|---|---|---|
| Brand | Ahemad's Restro; Ahemads Restro; Ahemad's Restro demo | transactional | home (`/en`) | SA, IN, global |
| Restaurant management (head term) | restaurant management software; restaurant management system; all-in-one restaurant software; cloud restaurant software | commercial | `restaurant-management-software` | global, SA, IN |
| Choosing software | how to choose restaurant management software; restaurant software checklist; what to look for in restaurant software | informational / commercial | blog `how-to-choose-restaurant-management-software` | global, SA, IN |
| POS | restaurant POS software; restaurant POS system; POS for restaurants; tablet POS for restaurants; cafe POS system | commercial / transactional | `restaurant-pos-software` | global, SA, IN |
| POS buying guide | best POS for restaurants; how to choose a restaurant POS | commercial | blog `restaurant-pos-software-buying-guide` (planned) | SA, IN |
| Billing | restaurant billing software; restaurant billing system; restaurant invoice software; split bill restaurant software | commercial / transactional | `restaurant-billing-software` | global, SA, IN |
| Billing evaluation | how to evaluate restaurant billing software; restaurant billing mistakes | informational | blog `evaluate-restaurant-billing-software` (planned) | SA, IN |
| QR ordering | QR code ordering system; QR menu ordering for restaurants; table QR ordering; self-order kiosk for restaurants | commercial | `qr-ordering-system` | global, SA, IN |
| QR how-to | how does QR ordering work; QR ordering pros and cons | informational | blog `how-qr-ordering-works-in-restaurants` | global, SA, IN |
| Kitchen display | kitchen display system; KDS for restaurants; kitchen display screen; KOT system | commercial | `kitchen-display-system` | global, SA, IN |
| KDS how-to | how a kitchen display system works; KDS vs kitchen printer | informational | blog `how-a-kitchen-display-system-helps` (planned) | global |
| Multi-branch | multi-branch restaurant management; restaurant chain management software; multi-location restaurant software | commercial | `multi-branch-restaurant-management` | SA, IN, global |
| Multi-branch guide | managing multiple restaurant branches; central kitchen stock transfer | informational | blog `multi-branch-restaurant-software` (planned) | SA, IN |
| Saudi market | restaurant software Saudi Arabia; restaurant POS Saudi Arabia; restaurant software Riyadh / Jeddah; ZATCA restaurant invoice; restaurant POS VAT Saudi | commercial / transactional | `restaurant-software-saudi-arabia` | SA |
| Saudi regulation explainers | ZATCA phase 1 vs phase 2 for restaurants; simplified tax invoice requirements | informational | blog `restaurant-technology-saudi-arabia` (and future dated explainers) | SA |
| India market | restaurant software India; restaurant billing software India; GST billing software for restaurants; restaurant POS with UPI; KOT billing software | commercial / transactional | `restaurant-software-india` (English only) | IN |
| India operations | digital restaurant operations India; restaurant UPI payments | informational | blog `digital-restaurant-operations-india` (planned) | IN |
| Arabic language | Arabic restaurant software; Arabic restaurant POS; RTL restaurant software | commercial | `arabic-restaurant-software` | SA, Arab, global |
| Order accuracy | how to reduce wrong orders in a restaurant; restaurant order accuracy | informational | blog `improve-restaurant-order-accuracy` (planned) | global |

## 2. Arabic keyword groups

| Group | Example queries (to validate) | Intent | Owner page | Market |
|---|---|---|---|---|
| Brand | أحمد ريسترو; Ahemad's Restro | transactional | home (`/ar`) | SA, Arab |
| Restaurant management (head term) | برنامج إدارة المطاعم; نظام إدارة المطاعم; برنامج مطاعم سحابي; برنامج إدارة مطعم | commercial | `restaurant-management-software` (ar) | SA, Arab |
| Choosing software | كيف أختار برنامج مطاعم; اختيار نظام إدارة المطاعم | informational / commercial | blog `how-to-choose-restaurant-management-software` (ar) | SA, Arab |
| POS / cashier | نظام نقاط البيع للمطاعم; برنامج كاشير مطاعم; نظام كاشير للمطاعم; برنامج كاشير للكافيهات; نظام POS للمطاعم | commercial / transactional | `restaurant-pos-software` (ar) | SA, Arab |
| Billing | برنامج فواتير المطاعم; نظام فواتير المطاعم; تقسيم الفاتورة في المطعم; فاتورة ضريبية مبسطة للمطاعم | commercial | `restaurant-billing-software` (ar) | SA |
| QR ordering | الطلب عبر رمز QR; نظام طلبات المطاعم; منيو QR للمطاعم; كشك الطلب الذاتي | commercial | `qr-ordering-system` (ar) | SA, Arab |
| QR how-to | كيف يعمل الطلب عبر QR في المطاعم | informational | blog `how-qr-ordering-works-in-restaurants` (ar) | SA, Arab |
| Kitchen display | شاشة المطبخ; شاشة المطبخ للمطاعم; نظام شاشة المطبخ KDS; شاشة طلبات المطبخ | commercial | `kitchen-display-system` (ar) | SA, Arab |
| Multi-branch | إدارة المطاعم متعددة الفروع; برنامج إدارة سلسلة مطاعم; نظام مطاعم متعدد الفروع | commercial | `multi-branch-restaurant-management` (ar) | SA |
| Saudi market | برنامج مطاعم في السعودية; برنامج إدارة المطاعم في السعودية; نظام كاشير مطاعم السعودية; برنامج مطاعم الرياض | commercial / transactional | `restaurant-software-saudi-arabia` (ar) | SA |
| Saudi regulation explainers | المرحلة الثانية من الفوترة الإلكترونية للمطاعم; متطلبات الفاتورة الضريبية المبسطة | informational | blog `restaurant-technology-saudi-arabia` (ar) and future dated explainers | SA |
| Arabic language | برنامج مطاعم عربي; برنامج مطاعم باللغة العربية; برنامج كاشير عربي; نظام نقاط بيع عربي | commercial | `arabic-restaurant-software` (ar) | SA, Arab |
| Arabic features guide | مزايا برنامج المطاعم العربي | informational | blog `arabic-restaurant-software-features` (planned) | SA, GCC |

Arabic phrasing notes: Saudi buyers commonly say كاشير rather than نقاط البيع for the till,
and both برنامج and نظام are used for "software/system"; keep both forms in the owner page
rather than splitting them across pages. Validate dialect variants (e.g. منيو vs قائمة طعام,
مطعم vs مطاعم) in the keyword tool before adding more pages.

## 3. Ownership rules (avoiding cannibalisation)

1. **One owner per query group.** Only the owner page uses the group's primary phrase at the
   start of its `metaTitle` and in its H1. Everyone else links to it with descriptive anchor
   text.
2. **Home vs `restaurant-management-software`.** The home page owns the brand and the
   product-overview query ("Ahemad's Restro", "restaurant management software and POS"
   as a combined phrase). The solution page owns the generic head term "restaurant
   management software / برنامج إدارة المطاعم". If Search Console shows the home page
   ranking for the head term instead, keep the home title brand-led and strengthen internal
   links to the solution page; do not retitle both pages for the same phrase.
3. **POS vs billing.** `restaurant-pos-software` owns order-taking, cashier and till queries
   (كاشير). `restaurant-billing-software` owns bill calculation, VAT/GST on bills, split and
   partial payments, refunds and invoices (فواتير). "Billing machine/POS billing" style
   queries should be checked in the tool: if their results pages are dominated by POS
   products, move them to the POS page.
4. **Saudi page vs Arabic page.** `restaurant-software-saudi-arabia` owns country queries
   (Saudi, KSA, Riyadh, ZATCA, VAT). `arabic-restaurant-software` owns language queries
   (Arabic, RTL, عربي) without a country. The Arabic page links to the Saudi page for tax
   detail and must not target ZATCA terms.
5. **India page.** English only (`locales: ["en"]`); it owns GST/UPI/India queries. No Arabic
   page targets India terms, and Arabic content never links to it.
6. **Solution pages vs blog.** Solution pages own commercial/transactional intent ("software",
   "system", "POS"). Blog articles own informational intent ("how to", "what is", "vs",
   "checklist") and link to the matching solution page. Planned blog #6
   (`multi-branch-restaurant-software`) is close to the solution slug
   `multi-branch-restaurant-management`: keep the article's title question-led (e.g.
   "How to manage several restaurant branches") so it does not compete for the commercial
   phrase.
7. **New pages.** Before adding a landing page, add its row here and confirm no existing page
   already owns the group.

## 4. Competitor landscape (categories only)

No competitor research, traffic data or rankings were collected for this document. The
search results for these queries are typically shared by the following kinds of sites;
check the actual results pages per market before planning content:

- **Global cloud restaurant POS vendors** that sell in many countries, usually English-first,
  with hardware bundles and integrated payments.
- **Regional (GCC/Saudi) restaurant POS vendors** with Arabic interfaces, local payment
  terminal partnerships and ZATCA Phase 2 messaging; they compete directly on the Saudi and
  Arabic keyword groups.
- **Indian restaurant billing/POS vendors** that emphasise GST billing, KOT, UPI and
  delivery-aggregator integrations; they dominate the India group.
- **Payment providers and acquirers** that offer a POS or "smart terminal" product and rank
  for POS terms.
- **Software directories and review/comparison sites** that rank for "best …" and comparison
  queries.
- **Delivery and ordering platforms** that rank for QR ordering and online ordering terms.
- **ERP/accounting suites** with restaurant modules, relevant mainly to multi-branch queries.

Positioning notes grounded in the product (not in competitor data): lead with the complete
Arabic interface, bilingual receipts and server-calculated VAT; be explicit about what is not
included (ZATCA Phase 2, payment gateways, delivery aggregators, offline mode, native apps),
because buyers comparing vendors will ask.

## 5. Next steps

1. Validate each group's volume and difficulty per market (SA, IN, global, Arab) and record
   the source and date next to the group.
2. After launch, review Search Console queries per page monthly; reassign any query where two
   pages both receive impressions.
3. Confirm Arabic dialect variants with a native Saudi marketer.
4. Update this file whenever a solution page or blog article is added, renamed or removed.
