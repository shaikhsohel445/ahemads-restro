import type { SiteLocale } from "@/lib/site/config";

// Home page copy. Every feature named here is implemented in this
// repository (audited against apps/api/src/modules and apps/web/app); the
// limits section and FAQ say plainly what is NOT included.

export type FeatureIcon =
  | "dashboard" | "pos" | "orders" | "menu" | "tables" | "qr" | "kds" | "billing"
  | "offers" | "customers" | "staff" | "reports" | "branches" | "realtime" | "language" | "currency"
  | "inventory" | "responsive";

export interface HomeCopy {
  meta: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; titleAccent: string; body: string; points: string[]; imageAlt: string };
  trust: string[];
  features: { eyebrow: string; title: string; body: string; items: { icon: FeatureIcon; title: string; body: string }[] };
  steps: { eyebrow: string; title: string; items: { title: string; body: string }[] };
  audience: { eyebrow: string; title: string; body: string; items: { title: string; body: string }[] };
  screens: { eyebrow: string; title: string; body: string; realNote: string; items: { src: string; alt: string; caption: string; wide?: boolean }[] };
  saudi: { eyebrow: string; title: string; body: string; points: string[]; note: string };
  pricing: { eyebrow: string; title: string; body: string; contact: string; popular: string };
  demo: { eyebrow: string; title: string; body: string; callUs: string; visit: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  finalCta: { title: string; body: string };
}

export const HOME: Record<SiteLocale, HomeCopy> = {
  en: {
    meta: {
      title: "Ahemad's Restro — Restaurant Management Software & POS (English & Arabic)",
      description:
        "Restaurant POS, order management, tables, kitchen display, QR ordering, billing and reports in one cloud platform. Arabic and English, Saudi Riyal and VAT support. Request a demo.",
      keywords: [
        "restaurant management software",
        "restaurant POS software",
        "restaurant billing software",
        "kitchen display system",
        "QR code ordering system",
        "restaurant software Saudi Arabia",
        "restaurant software India",
      ],
    },
    hero: {
      eyebrow: "Restaurant management software",
      title: "Run Your Restaurant Smarter with",
      titleAccent: "Ahemad's Restro",
      body:
        "Manage orders, menus, tables, billing, kitchen operations, and restaurant workflows from one powerful platform built for modern food businesses.",
      points: ["Arabic & English, right-to-left ready", "Live kitchen display", "Saudi Riyal & VAT"],
      imageAlt: "Ahemad's Restro dashboard showing today's revenue, orders, occupied tables and the kitchen queue",
    },
    trust: [
      "Works in any modern browser — tablet, desktop or phone",
      "Runs on Cloudflare's global network",
      "Role-based access, 2FA and audit log",
    ],
    features: {
      eyebrow: "Features",
      title: "Everything the front of house and back office need",
      body: "One system from the moment an order is taken to the end-of-day report — with the same data on every screen, updated live.",
      items: [
        { icon: "dashboard", title: "Restaurant dashboard", body: "Today's revenue, orders, occupied tables and kitchen queue at a glance, per branch." },
        { icon: "pos", title: "Point of sale", body: "Fast dine-in, takeaway and delivery ordering with modifiers, half portions, combos and split payments." },
        { icon: "orders", title: "Order management", body: "Accept or decline online orders, track every order's kitchen and payment status, refund when needed." },
        { icon: "menu", title: "Menu & categories", body: "Categories, items with photos, modifiers, combos, availability switches and per-item tax rates." },
        { icon: "tables", title: "Table management", body: "Live floor plan with table status, waitlist, reservations, table merges and guest requests." },
        { icon: "qr", title: "QR ordering & kiosk", body: "Guests order from a QR code at the table or a self-service kiosk; orders reach the kitchen instantly." },
        { icon: "kds", title: "Kitchen display system", body: "Tickets by station, ageing timers and sound alerts replace paper tickets in the kitchen." },
        { icon: "billing", title: "Billing & receipts", body: "Server-calculated bills, discounts, tips and printable receipts — including bilingual Saudi VAT invoices." },
        { icon: "offers", title: "Discounts & offers", body: "Coupons, happy-hour promotions, loyalty points and gift cards, applied automatically at checkout." },
        { icon: "customers", title: "Customer management", body: "Customer profiles, visit history, loyalty balances and store credit." },
        { icon: "staff", title: "Staff & roles", body: "Custom roles and permissions, PIN quick-switch, shifts, attendance, leave and payroll." },
        { icon: "reports", title: "Reports & analytics", body: "Sales, items, staff, tax and inventory reports with CSV, Excel and PDF export and scheduled e-mails." },
        { icon: "inventory", title: "Inventory & purchasing", body: "Recipes, stock levels, low-stock alerts, waste, purchase orders, goods receipts and supplier invoices." },
        { icon: "branches", title: "Multi-branch operations", body: "Run several branches from one account, switch between them and move stock between locations." },
        { icon: "realtime", title: "Realtime updates", body: "New orders, ticket changes and table updates appear on every screen within moments — no refreshing." },
        { icon: "language", title: "Arabic & English", body: "The whole interface, receipts and reports in both languages, with a true right-to-left layout." },
        { icon: "currency", title: "Saudi Riyal & VAT", body: "SAR pricing, VAT-inclusive menus at 15% by default, and ZATCA Phase 1 QR codes on receipts." },
        { icon: "responsive", title: "Any device", body: "Designed for counter tablets, kitchen screens, desktops and phones." },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Up and running in four steps",
      items: [
        { title: "Create your restaurant", body: "Sign up, name your restaurant and branch, and set your currency, time zone and VAT number." },
        { title: "Add menu, tables and staff", body: "Build categories and items, draw your floor plan, print table QR codes and invite your team with the right roles." },
        { title: "Take orders", body: "Take orders at the POS, from table QR codes or the kiosk. The kitchen sees each ticket live and marks it ready." },
        { title: "Watch the numbers", body: "Follow sales, popular items, staff performance and stock from the dashboard and reports." },
      ],
    },
    audience: {
      eyebrow: "Who it's for",
      title: "Built for the way food businesses actually work",
      body: "The same platform adapts to a single café counter or a group of branches.",
      items: [
        { title: "Restaurants", body: "Dine-in service with tables, courses sent to the kitchen and bills at the table." },
        { title: "Cafés & coffee shops", body: "Quick counter orders, modifiers like size and milk, and loyalty for regulars." },
        { title: "Cloud kitchens", body: "Takeaway and delivery orders, delivery zones and drivers, and a busy kitchen display." },
        { title: "Quick-service restaurants", body: "Fast POS, self-service kiosk and kitchen stations for high order volume." },
        { title: "Fine dining", body: "Reservations, waitlist, table status and guest notes for attentive service." },
        { title: "Food courts", body: "Separate kitchen stations and QR or kiosk ordering for walk-up customers." },
        { title: "Takeaway businesses", body: "Phone and walk-in orders, scheduled pick-ups and order-ready tracking." },
        { title: "Multi-branch groups", body: "Several branches in one account with per-branch reports and stock transfers." },
      ],
    },
    screens: {
      eyebrow: "Product tour",
      title: "See the real product",
      body: "Every screenshot below is captured from the working application with demo data.",
      realNote: "Real screenshots of Ahemad's Restro — not mock-ups.",
      items: [
        { src: "/images/product/screens/pos-en.png", alt: "Point of sale with categories, menu items and the current order", caption: "Point of sale", wide: true },
        { src: "/images/product/screens/kds-en.png", alt: "Kitchen display with tickets in New, Accepted, Preparing and Ready columns", caption: "Kitchen display" },
        { src: "/images/product/screens/tables-en.png", alt: "Table management showing table status and quick actions", caption: "Table management" },
        { src: "/images/product/screens/orders-en.png", alt: "Order management list with status filters", caption: "Order management" },
        { src: "/images/product/screens/menu-en.png", alt: "Menu management with categories and items", caption: "Menu management" },
        { src: "/images/product/screens/reports-en.png", alt: "Reports catalogue with sales, items and tax reports", caption: "Reports & analytics" },
        { src: "/images/product/screens/dashboard-ar.png", alt: "Arabic right-to-left dashboard", caption: "Arabic, right-to-left" },
      ],
    },
    saudi: {
      eyebrow: "Made for Saudi Arabia",
      title: "Arabic-first service, Riyal pricing and VAT receipts",
      body: "Staff can switch the whole system to Arabic with one tap, and every amount is shown in Saudi Riyal.",
      points: [
        "Complete Arabic interface with right-to-left layout and Arabic font",
        "SAR currency and Asia/Riyadh time zone by default",
        "15% VAT by default, VAT-inclusive pricing, editable per item",
        "Bilingual simplified tax invoices with the ZATCA Phase 1 QR code",
        "mada, STC Pay and Apple Pay recorded as payment methods",
      ],
      note: "ZATCA Phase 2 (FATOORA integration) is not included. Confirm VAT treatment with ZATCA or a tax adviser.",
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Plans that grow with your restaurant",
      body: "Pricing depends on your branches, devices and onboarding needs. Tell us about your business and we'll send a quote.",
      contact: "Contact for pricing",
      popular: "Most popular",
    },
    demo: {
      eyebrow: "Request a demo",
      title: "See Ahemad's Restro with your own menu",
      body: "Tell us a little about your business. Wem Studios will contact you to arrange a walkthrough and answer your questions.",
      callUs: "Prefer to talk? Call",
      visit: "Visit Wem Studios",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions restaurant owners ask",
      items: [
        { q: "What is Ahemad's Restro?", a: "Ahemad's Restro is cloud-based restaurant management software. It combines a point of sale, order management, table management, QR ordering, a kitchen display system, billing, inventory, staff management and reports in one web application." },
        { q: "Which types of restaurants can use it?", a: "Restaurants, cafés, cloud kitchens, quick-service restaurants, fine-dining venues, food-court outlets, takeaway businesses and multi-branch groups. It supports dine-in, takeaway and delivery orders." },
        { q: "Does it support Arabic?", a: "Yes. The full interface, receipts and reports are available in Arabic with a proper right-to-left layout. Each staff member can switch between Arabic and English at any time." },
        { q: "Can it be used in Saudi Arabia?", a: "Yes. It defaults to Saudi Riyal, the Asia/Riyadh time zone and 15% VAT, and prints bilingual simplified tax invoices with the ZATCA Phase 1 QR code. ZATCA Phase 2 (FATOORA integration) is not included." },
        { q: "Does it support Saudi Riyal?", a: "Yes. SAR is the default currency for new restaurants, and every amount in the system, receipts and reports is formatted in Riyal. Other currencies, including Indian Rupee, can be selected in settings." },
        { q: "Can multiple restaurant branches be managed?", a: "Yes. One account can hold several branches. Staff can be assigned to branches, managers can switch between them, and stock can be transferred from one branch to another." },
        { q: "Does it support QR ordering?", a: "Yes. Each table gets its own QR code. Guests scan it, browse the menu, place an order and can call a waiter or ask for the bill; the order appears on the kitchen display immediately. A self-service kiosk mode is also available." },
        { q: "How can a restaurant request a demo?", a: "Fill in the demo request form on this page or call Wem Studios on +91 8308042362. We'll arrange a walkthrough of the product." },
        { q: "Is the software available for customisation?", a: "Yes. Wem Studios can discuss customisation, branding and integrations for your business. The product also offers an integration API, webhooks and an MCP server for connecting other systems." },
        { q: "How can businesses contact the development team?", a: "Call Wem Studios on +91 8308042362 or visit wemstudios.in." },
      ],
    },
    finalCta: {
      title: "Ready to run a smoother service?",
      body: "Book a walkthrough and see how Ahemad's Restro fits your restaurant.",
    },
  },
  ar: {
    meta: {
      title: "أحمد ريسترو | Ahemad's Restro — برنامج إدارة المطاعم ونقاط البيع",
      description:
        "نظام سحابي لإدارة المطاعم يجمع نقاط البيع والطلبات والطاولات وشاشة المطبخ والطلب عبر رمز QR والفواتير والتقارير، بالعربية والإنجليزية مع الريال السعودي وضريبة القيمة المضافة. اطلب عرضًا تجريبيًا.",
      keywords: ["برنامج إدارة المطاعم", "نظام إدارة المطاعم", "نظام نقاط البيع للمطاعم", "برنامج نقاط البيع للمطاعم", "نظام طلبات المطاعم", "الطلب عبر رمز QR", "برنامج إدارة المطاعم في السعودية"],
    },
    hero: {
      eyebrow: "برنامج إدارة المطاعم",
      title: "أدِر مطعمك بذكاء أكبر مع",
      titleAccent: "Ahemad's Restro",
      body: "أدِر الطلبات وقوائم الطعام والطاولات والفواتير وعمليات المطبخ وسير العمل في مطعمك من منصة واحدة متكاملة صُممت لأعمال الأغذية الحديثة.",
      points: ["عربي وإنجليزي مع واجهة من اليمين لليسار", "شاشة مطبخ مباشرة", "الريال السعودي وضريبة القيمة المضافة"],
      imageAlt: "لوحة تحكم Ahemad's Restro تعرض إيرادات اليوم والطلبات والطاولات المشغولة وطابور المطبخ",
    },
    trust: ["يعمل في أي متصفح حديث على الجهاز اللوحي أو الحاسوب أو الجوال", "يعمل على شبكة Cloudflare العالمية", "صلاحيات حسب الأدوار وتحقق بخطوتين وسجل تدقيق"],
    features: {
      eyebrow: "المزايا",
      title: "كل ما يحتاجه الصالة والإدارة في نظام واحد",
      body: "نظام واحد من لحظة تسجيل الطلب حتى تقرير نهاية اليوم، والبيانات نفسها محدّثة فورًا على كل الشاشات.",
      items: [
        { icon: "dashboard", title: "لوحة تحكم المطعم", body: "إيرادات اليوم والطلبات والطاولات المشغولة وطابور المطبخ بنظرة واحدة لكل فرع." },
        { icon: "pos", title: "نقطة البيع", body: "طلبات سريعة محلية وسفري وتوصيل مع الإضافات وأنصاف الحصص والوجبات المجمّعة وتقسيم الدفع." },
        { icon: "orders", title: "إدارة الطلبات", body: "اقبل الطلبات الإلكترونية أو ارفضها، وتابع حالة كل طلب في المطبخ والدفع، واسترد المبالغ عند الحاجة." },
        { icon: "menu", title: "قائمة الطعام والفئات", body: "فئات وأصناف بالصور وإضافات ووجبات مجمّعة ومفاتيح توفر ونسبة ضريبة لكل صنف." },
        { icon: "tables", title: "إدارة الطاولات", body: "مخطط مباشر لحالة الطاولات مع قائمة الانتظار والحجوزات ودمج الطاولات وطلبات الضيوف." },
        { icon: "qr", title: "الطلب عبر QR والكشك", body: "يطلب الضيوف عبر رمز QR على الطاولة أو من كشك الخدمة الذاتية، ويصل الطلب إلى المطبخ فورًا." },
        { icon: "kds", title: "شاشة المطبخ", body: "تذاكر حسب المحطة مع مؤقت للتأخير وتنبيه صوتي بدلًا من التذاكر الورقية." },
        { icon: "billing", title: "الفواتير والإيصالات", body: "فواتير يحسبها الخادم مع الخصومات والإكراميات وإيصالات قابلة للطباعة، ومنها الفاتورة الضريبية المبسطة ثنائية اللغة." },
        { icon: "offers", title: "الخصومات والعروض", body: "كوبونات وعروض الساعات السعيدة ونقاط الولاء وبطاقات الهدايا تُطبق تلقائيًا عند الدفع." },
        { icon: "customers", title: "إدارة العملاء", body: "ملفات العملاء وسجل الزيارات وأرصدة الولاء والرصيد المحفوظ." },
        { icon: "staff", title: "الموظفون والأدوار", body: "أدوار وصلاحيات مخصصة وتبديل سريع برمز PIN والمناوبات والحضور والإجازات والرواتب." },
        { icon: "reports", title: "التقارير والتحليلات", body: "تقارير المبيعات والأصناف والموظفين والضريبة والمخزون مع التصدير إلى CSV وExcel وPDF والإرسال المجدول بالبريد." },
        { icon: "inventory", title: "المخزون والمشتريات", body: "الوصفات ومستويات المخزون وتنبيهات النقص والهدر وأوامر الشراء واستلام البضائع وفواتير الموردين." },
        { icon: "branches", title: "تشغيل عدة فروع", body: "أدِر عدة فروع من حساب واحد، وتنقّل بينها، وانقل المخزون من فرع إلى آخر." },
        { icon: "realtime", title: "تحديثات فورية", body: "تظهر الطلبات الجديدة وتغييرات التذاكر وحالة الطاولات على كل الشاشات خلال لحظات دون تحديث الصفحة." },
        { icon: "language", title: "العربية والإنجليزية", body: "الواجهة والإيصالات والتقارير باللغتين مع تخطيط حقيقي من اليمين إلى اليسار." },
        { icon: "currency", title: "الريال السعودي والضريبة", body: "أسعار بالريال وقوائم شاملة للضريبة بنسبة 15% افتراضيًا ورمز QR للمرحلة الأولى من هيئة الزكاة على الإيصالات." },
        { icon: "responsive", title: "على أي جهاز", body: "مصمم لأجهزة الكاشير اللوحية وشاشات المطبخ والحواسيب والجوالات." },
      ],
    },
    steps: {
      eyebrow: "كيف يعمل",
      title: "ابدأ العمل في أربع خطوات",
      items: [
        { title: "أنشئ مطعمك", body: "سجّل حسابك، وأدخل اسم المطعم والفرع، واضبط العملة والمنطقة الزمنية والرقم الضريبي." },
        { title: "أضف القائمة والطاولات والموظفين", body: "أنشئ الفئات والأصناف، وارسم مخطط الصالة، واطبع رموز QR للطاولات، وادعُ فريقك بالأدوار المناسبة." },
        { title: "استقبل الطلبات", body: "سجّل الطلبات من نقطة البيع أو رموز QR للطاولات أو الكشك، ويرى المطبخ كل تذكرة فورًا ويعلّمها جاهزة." },
        { title: "تابع الأرقام", body: "تابع المبيعات والأصناف الأكثر طلبًا وأداء الموظفين والمخزون من لوحة التحكم والتقارير." },
      ],
    },
    audience: {
      eyebrow: "لمن هذا النظام",
      title: "صُمم ليناسب طريقة عمل منشآت الأغذية فعلًا",
      body: "المنصة نفسها تناسب كاشير مقهى واحد أو مجموعة من الفروع.",
      items: [
        { title: "المطاعم", body: "خدمة الصالة مع الطاولات وإرسال الأطباق إلى المطبخ والفاتورة على الطاولة." },
        { title: "المقاهي ومحلات القهوة", body: "طلبات سريعة على الكاشير وإضافات مثل الحجم والحليب وبرنامج ولاء للعملاء الدائمين." },
        { title: "المطابخ السحابية", body: "طلبات السفري والتوصيل ومناطق التوصيل والسائقين وشاشة مطبخ مزدحمة." },
        { title: "مطاعم الخدمة السريعة", body: "نقطة بيع سريعة وكشك خدمة ذاتية ومحطات مطبخ لحجم طلبات كبير." },
        { title: "المطاعم الفاخرة", body: "الحجوزات وقائمة الانتظار وحالة الطاولات وملاحظات الضيوف لخدمة أدق." },
        { title: "ساحات الطعام", body: "محطات مطبخ منفصلة والطلب عبر QR أو الكشك للزبائن المارّين." },
        { title: "محلات السفري", body: "طلبات الهاتف والزبائن المباشرين والاستلام المجدول وتتبع جاهزية الطلب." },
        { title: "مجموعات الفروع", body: "عدة فروع في حساب واحد مع تقارير لكل فرع ونقل المخزون بينها." },
      ],
    },
    screens: {
      eyebrow: "جولة في المنتج",
      title: "شاهد المنتج الحقيقي",
      body: "كل لقطة شاشة أدناه مأخوذة من التطبيق الفعلي ببيانات تجريبية.",
      realNote: "لقطات حقيقية من Ahemad's Restro وليست تصاميم تخيلية.",
      items: [
        { src: "/images/product/screens/pos-ar.png", alt: "نقطة البيع بالعربية مع الفئات والأصناف والطلب الحالي", caption: "نقطة البيع", wide: true },
        { src: "/images/product/screens/kds-ar.png", alt: "شاشة المطبخ مع أعمدة التذاكر الجديدة والمقبولة وقيد التحضير والجاهزة", caption: "شاشة المطبخ" },
        { src: "/images/product/screens/tables-ar.png", alt: "إدارة الطاولات مع حالة كل طاولة والإجراءات السريعة", caption: "إدارة الطاولات" },
        { src: "/images/product/screens/orders-ar.png", alt: "قائمة إدارة الطلبات مع عوامل التصفية", caption: "إدارة الطلبات" },
        { src: "/images/product/screens/menu-ar.png", alt: "إدارة قائمة الطعام مع الفئات والأصناف", caption: "إدارة القائمة" },
        { src: "/images/product/screens/reports-ar.png", alt: "دليل التقارير بالعربية", caption: "التقارير والتحليلات" },
        { src: "/images/product/screens/dashboard-ar.png", alt: "لوحة التحكم بالعربية من اليمين إلى اليسار", caption: "لوحة التحكم" },
      ],
    },
    saudi: {
      eyebrow: "مصمم للسعودية",
      title: "خدمة بالعربية أولًا وأسعار بالريال وإيصالات ضريبية",
      body: "يمكن للموظفين تحويل النظام بالكامل إلى العربية بلمسة واحدة، وتظهر كل المبالغ بالريال السعودي.",
      points: [
        "واجهة عربية كاملة من اليمين إلى اليسار بخط عربي واضح",
        "الريال السعودي والمنطقة الزمنية للرياض افتراضيًا",
        "ضريبة قيمة مضافة 15% افتراضيًا وأسعار شاملة للضريبة قابلة للتعديل لكل صنف",
        "فواتير ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى من هيئة الزكاة والضريبة والجمارك",
        "تسجيل الدفع عبر مدى وSTC Pay وApple Pay",
      ],
      note: "المرحلة الثانية من الفوترة الإلكترونية (الربط مع منصة فاتورة) غير مشمولة. تحقق من المعاملة الضريبية مع الهيئة أو مستشار ضريبي.",
    },
    pricing: {
      eyebrow: "الأسعار",
      title: "باقات تنمو مع مطعمك",
      body: "يعتمد السعر على عدد الفروع والأجهزة واحتياجات الإعداد. أخبرنا عن نشاطك وسنرسل لك عرض سعر.",
      contact: "تواصل لمعرفة السعر",
      popular: "الأكثر طلبًا",
    },
    demo: {
      eyebrow: "اطلب عرضًا تجريبيًا",
      title: "شاهد Ahemad's Restro بقائمة طعامك",
      body: "أخبرنا قليلًا عن نشاطك، وسيتواصل معك فريق Wem Studios لترتيب جولة تعريفية والإجابة عن أسئلتك.",
      callUs: "تفضّل الاتصال؟ اتصل على",
      visit: "زيارة موقع Wem Studios",
    },
    faq: {
      eyebrow: "الأسئلة الشائعة",
      title: "أسئلة يطرحها أصحاب المطاعم",
      items: [
        { q: "ما هو Ahemad's Restro؟", a: "Ahemad's Restro برنامج سحابي لإدارة المطاعم يجمع نقطة البيع وإدارة الطلبات والطاولات والطلب عبر رمز QR وشاشة المطبخ والفواتير والمخزون والموظفين والتقارير في تطبيق ويب واحد." },
        { q: "ما أنواع المطاعم التي يمكنها استخدامه؟", a: "المطاعم والمقاهي والمطابخ السحابية ومطاعم الخدمة السريعة والمطاعم الفاخرة ومحلات ساحات الطعام ومحلات السفري ومجموعات الفروع. ويدعم الطلبات المحلية والسفري والتوصيل." },
        { q: "هل يدعم اللغة العربية؟", a: "نعم. الواجهة كاملة والإيصالات والتقارير متاحة بالعربية مع تخطيط صحيح من اليمين إلى اليسار، ويمكن لكل موظف التبديل بين العربية والإنجليزية في أي وقت." },
        { q: "هل يمكن استخدامه في السعودية؟", a: "نعم. يعتمد افتراضيًا الريال السعودي والمنطقة الزمنية للرياض وضريبة 15%، ويطبع فواتير ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى. المرحلة الثانية (الربط مع منصة فاتورة) غير مشمولة." },
        { q: "هل يدعم الريال السعودي؟", a: "نعم. الريال هو العملة الافتراضية للمطاعم الجديدة، وتُعرض كل المبالغ في النظام والإيصالات والتقارير بالريال. ويمكن اختيار عملات أخرى من الإعدادات، ومنها الروبية الهندية." },
        { q: "هل يمكن إدارة عدة فروع؟", a: "نعم. يمكن أن يضم الحساب الواحد عدة فروع، ويمكن تعيين الموظفين على الفروع، وتنقّل المديرين بينها، ونقل المخزون من فرع إلى آخر." },
        { q: "هل يدعم الطلب عبر رمز QR؟", a: "نعم. لكل طاولة رمز QR خاص بها؛ يمسحه الضيف ويتصفح القائمة ويطلب، ويمكنه استدعاء النادل أو طلب الفاتورة، ويظهر الطلب على شاشة المطبخ فورًا. ويتوفر أيضًا وضع كشك الخدمة الذاتية." },
        { q: "كيف يطلب المطعم عرضًا تجريبيًا؟", a: "املأ نموذج طلب العرض التجريبي في هذه الصفحة أو اتصل بـ Wem Studios على الرقم ‎+91 8308042362، وسنرتب لك جولة في المنتج." },
        { q: "هل يمكن تخصيص البرنامج؟", a: "نعم. يمكن لـ Wem Studios مناقشة التخصيص والهوية والتكاملات لنشاطك. كما يوفّر المنتج واجهة تكامل برمجية وWebhooks وخادم MCP لربط أنظمة أخرى." },
        { q: "كيف يمكن التواصل مع فريق التطوير؟", a: "اتصل بـ Wem Studios على الرقم ‎+91 8308042362 أو زُر wemstudios.in." },
      ],
    },
    finalCta: {
      title: "مستعد لخدمة أكثر سلاسة؟",
      body: "احجز جولة تعريفية واكتشف كيف يناسب Ahemad's Restro مطعمك.",
    },
  },
};
