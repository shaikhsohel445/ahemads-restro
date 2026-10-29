import type { SolutionPage } from "./types";

// Broad "what is restaurant management software" intent. Owns the generic
// head terms; feature-specific queries belong to the POS, billing, QR, KDS
// and multi-branch pages (see docs/marketing/KEYWORD-MAP.md).
export const restaurantManagementSoftware: SolutionPage = {
  slug: "restaurant-management-software",
  locales: ["en", "ar"],
  related: ["restaurant-pos-software", "kitchen-display-system", "qr-ordering-system", "multi-branch-restaurant-management"],
  copy: {
    en: {
      metaTitle: "Restaurant Management Software | Ahemad's Restro",
      metaDescription:
        "One cloud system for orders, POS, tables, kitchen display, QR ordering, billing, stock, staff and reports, in English and Arabic. Request a free demo today.",
      keywords: [
        "restaurant management software",
        "restaurant management system",
        "cloud restaurant software",
        "all-in-one restaurant software",
        "restaurant operations software",
      ],
      navLabel: "Restaurant management software",
      h1: "Restaurant management software that connects the floor, the kitchen and the office",
      intro:
        "Ahemad's Restro brings ordering, tables, the kitchen display, billing, inventory, staff and reports into one web application, so every screen in your restaurant works from the same live data.",
      problem: {
        title: "Why restaurants outgrow separate tools",
        paragraphs: [
          "Many restaurants run on a till for payments, paper tickets for the kitchen, a spreadsheet for stock and a notebook for reservations. Each tool works on its own, but nothing connects them: the kitchen doesn't hear that an order changed, the stock sheet doesn't know what was sold, and the owner only sees the day's numbers after closing.",
          "Restaurant management software closes those gaps. An order taken at the POS or from a table QR code goes straight to the right kitchen station, the bill is calculated on the server from what was actually ordered, ingredients in the recipes are deducted from stock when the bill is paid, and the sale appears in reports straight away.",
          "The aim is not more screens but fewer places to look. Managers see the same picture as the cashier and the kitchen, and each staff member only sees what their role allows.",
        ],
      },
      capabilities: {
        title: "What you can run from one system",
        items: [
          { icon: "pos", title: "Point of sale", body: "Dine-in, takeaway and delivery orders with modifiers, half portions, combos and orders scheduled for later." },
          { icon: "tables", title: "Tables and reservations", body: "Live floor plan per floor, table status including cleaning, reservations, a waitlist, bill merges and moving a bill to another table." },
          { icon: "qr", title: "QR ordering and kiosk", body: "Guests order from a QR code on their table or a self-service kiosk; table orders wait for staff to accept them unless you switch on auto-accept." },
          { icon: "kds", title: "Kitchen display", body: "Tickets by station in New, Accepted, Preparing and Ready columns, with ageing timers and a new-ticket sound." },
          { icon: "billing", title: "Billing and payments", body: "Server-calculated bills with VAT or GST, discounts, coupons, tips, loyalty, gift cards, split bills, part payments and refunds." },
          { icon: "inventory", title: "Inventory and purchasing", body: "Recipes, stock levels, low-stock alerts, waste, purchase orders, goods receipts, supplier invoices and transfers between branches." },
          { icon: "staff", title: "Staff and security", body: "Custom roles and permissions, PIN quick sign-in, two-factor authentication, an audit log, shifts, attendance, leave and payroll." },
          { icon: "reports", title: "Reports", body: "Sales by item and category, peak hours, food cost and margins, staff sales, table turnover and tax, exported to CSV, Excel or PDF or e-mailed on a schedule." },
          { icon: "customers", title: "Customers and loyalty", body: "Customer profiles with visit history, loyalty points, store credit and marketing campaigns." },
        ],
      },
      limits: {
        title: "What is not included",
        points: [
          "No payment-gateway integration: payments are recorded by staff after the card terminal or wallet approves them.",
          "No integrations with delivery aggregators.",
          "No native mobile apps; it runs in a modern browser on tablets, desktops and phones.",
          "An internet connection is required; there is no offline mode.",
          "ZATCA Phase 2 (FATOORA integration) and GST e-invoicing are not included.",
        ],
      },
      faq: [
        {
          q: "What does restaurant management software do?",
          a: "It connects the jobs that keep a restaurant running: taking orders, sending them to the kitchen, managing tables, billing guests, tracking stock, scheduling staff and reporting on sales. In Ahemad's Restro these all share one database, so a change on one screen shows up on the others within moments.",
        },
        {
          q: "Do I need to install anything?",
          a: "No. Ahemad's Restro is a cloud web application that runs in a modern browser on counter tablets, kitchen screens, desktops and phones. It needs an internet connection; there is no offline mode.",
        },
        {
          q: "Which printers can I use?",
          a: "Receipts, bills and kitchen tickets can be printed through the browser on any printer the device can use. Network ESC/POS thermal printers are also supported if they are reachable from the internet. USB thermal printers attached to the tablet are not supported in the cloud edition.",
        },
        {
          q: "Can my staff use it in Arabic?",
          a: "Yes. The whole interface, receipts and PDF reports are available in Arabic with a right-to-left layout, and each staff member can switch between Arabic and English on their own screen.",
        },
        {
          q: "Does it work for more than one branch?",
          a: "Yes. One account can hold several branches, staff are assigned to the branches they work at, and stock can be transferred between branches. Each branch keeps its own menu, tables, kitchen stations and tax settings.",
        },
        {
          q: "How much does it cost?",
          a: "Pricing depends on the number of branches, devices and the onboarding you need. Request a demo and Wem Studios will send you a quote.",
        },
      ],
      cta: {
        title: "See your restaurant running in one system",
        body: "Request a demo and Wem Studios will contact you to walk through ordering, the kitchen display, billing and reports with a setup like yours.",
      },
      image: {
        src: "/images/product/screens/dashboard-en.png",
        alt: "Ahemad's Restro dashboard showing today's revenue, orders, occupied tables and the kitchen queue",
      },
    },
    ar: {
      metaTitle: "برنامج إدارة المطاعم السحابي | Ahemad's Restro",
      metaDescription:
        "نظام إدارة المطاعم السحابي: نقاط البيع والطلبات والطاولات وشاشة المطبخ والطلب عبر رمز QR والفواتير والمخزون والموظفين والتقارير بالعربية. اطلب عرضًا تجريبيًا.",
      keywords: [
        "برنامج إدارة المطاعم",
        "نظام إدارة المطاعم",
        "برنامج مطاعم سحابي",
        "نظام متكامل لإدارة المطاعم",
        "برنامج إدارة مطعم",
      ],
      navLabel: "برنامج إدارة المطاعم",
      h1: "برنامج إدارة المطاعم الذي يربط الصالة بالمطبخ والإدارة",
      intro:
        "يجمع Ahemad's Restro الطلبات والطاولات وشاشة المطبخ والفواتير والمخزون والموظفين والتقارير في تطبيق ويب واحد، فتعمل كل شاشة في مطعمك على البيانات نفسها لحظة بلحظة.",
      problem: {
        title: "لماذا تتجاوز المطاعم الأدوات المتفرقة؟",
        paragraphs: [
          "يعمل كثير من المطاعم بكاشير للدفع، وتذاكر ورقية للمطبخ، وجدول بيانات للمخزون، ودفتر للحجوزات. كل أداة تؤدي دورها منفردة، لكن لا شيء يربطها: المطبخ لا يعلم أن الطلب تغيّر، وجدول المخزون لا يعرف ما بيع، والمالك لا يرى أرقام اليوم إلا بعد الإغلاق.",
          "نظام إدارة المطاعم يسد هذه الفجوات. الطلب المسجّل من نقطة البيع أو من رمز QR على الطاولة يصل مباشرة إلى محطة المطبخ المناسبة، وتُحسب الفاتورة على الخادم مما طُلب فعلًا، وتُخصم مكونات الوصفات من المخزون عند سداد الفاتورة، وتظهر عملية البيع في التقارير فورًا.",
          "الهدف ليس شاشات أكثر، بل أماكن أقل تبحث فيها. يرى المدير الصورة نفسها التي يراها الكاشير والمطبخ، ولا يرى كل موظف إلا ما تسمح به صلاحيات دوره.",
        ],
      },
      capabilities: {
        title: "ما الذي تديره من نظام واحد",
        items: [
          { icon: "pos", title: "نقطة البيع", body: "طلبات محلية وسفري وتوصيل مع الإضافات وأنصاف الحصص والوجبات المجمّعة والطلبات المجدولة لوقت لاحق." },
          { icon: "tables", title: "الطاولات والحجوزات", body: "مخطط مباشر لكل طابق، وحالة الطاولة بما فيها التنظيف، والحجوزات وقائمة الانتظار، ودمج الفواتير ونقل الفاتورة إلى طاولة أخرى." },
          { icon: "qr", title: "الطلب عبر QR والكشك", body: "يطلب الضيوف عبر رمز QR على الطاولة أو من كشك الخدمة الذاتية، وتنتظر طلبات الطاولات قبول الموظفين ما لم تفعّل القبول التلقائي." },
          { icon: "kds", title: "شاشة المطبخ", body: "تذاكر حسب المحطة في أعمدة: جديد، مقبول، قيد التحضير، جاهز، مع مؤقت للتأخير وتنبيه صوتي للتذكرة الجديدة." },
          { icon: "billing", title: "الفواتير والمدفوعات", body: "فواتير يحسبها الخادم مع الضريبة والخصومات والكوبونات والإكراميات والولاء وبطاقات الهدايا وتقسيم الفاتورة والدفع الجزئي والاسترداد." },
          { icon: "inventory", title: "المخزون والمشتريات", body: "الوصفات ومستويات المخزون وتنبيهات النقص والهدر وأوامر الشراء واستلام البضائع وفواتير الموردين والنقل بين الفروع." },
          { icon: "staff", title: "الموظفون والأمان", body: "أدوار وصلاحيات مخصصة، ودخول سريع برمز PIN، وتحقق بخطوتين، وسجل تدقيق، والمناوبات والحضور والإجازات والرواتب." },
          { icon: "reports", title: "التقارير", body: "المبيعات حسب الصنف والفئة وساعات الذروة وتكلفة الطعام والهوامش ومبيعات الموظفين ودوران الطاولات والضريبة، مع التصدير إلى CSV وExcel وPDF أو الإرسال المجدول بالبريد." },
          { icon: "customers", title: "العملاء والولاء", body: "ملفات العملاء مع سجل الزيارات ونقاط الولاء والرصيد المحفوظ والحملات التسويقية." },
        ],
      },
      limits: {
        title: "ما لا يشمله النظام",
        points: [
          "لا يوجد ربط مع بوابات الدفع؛ يسجّل الموظف الدفعة بعد موافقة جهاز الشبكة أو المحفظة.",
          "لا يوجد ربط مع تطبيقات التوصيل.",
          "لا توجد تطبيقات جوال أصلية؛ يعمل النظام في المتصفح على الأجهزة اللوحية والحواسيب والجوالات.",
          "يتطلب اتصالًا بالإنترنت، ولا يوجد وضع عمل دون اتصال.",
          "المرحلة الثانية من الفوترة الإلكترونية (الربط مع منصة فاتورة) غير مشمولة.",
        ],
      },
      faq: [
        {
          q: "ما وظيفة برنامج إدارة المطاعم؟",
          a: "يربط الأعمال اليومية في المطعم: تسجيل الطلبات وإرسالها إلى المطبخ وإدارة الطاولات وإصدار الفواتير ومتابعة المخزون وجدولة الموظفين وتقارير المبيعات. وفي Ahemad's Restro تعمل كلها على قاعدة بيانات واحدة، فيظهر أي تغيير على باقي الشاشات خلال لحظات.",
        },
        {
          q: "هل أحتاج إلى تثبيت برنامج؟",
          a: "لا. Ahemad's Restro تطبيق ويب سحابي يعمل في أي متصفح حديث على أجهزة الكاشير اللوحية وشاشات المطبخ والحواسيب والجوالات. ويحتاج إلى اتصال بالإنترنت، إذ لا يوجد وضع عمل دون اتصال.",
        },
        {
          q: "ما الطابعات التي يمكن استخدامها؟",
          a: "يمكن طباعة الإيصالات والفواتير وتذاكر المطبخ من المتصفح على أي طابعة يتعامل معها الجهاز، وهي الطريقة المناسبة للنصوص العربية. وتُدعم أيضًا الطابعات الحرارية الشبكية بنظام ESC/POS إذا كانت متاحة عبر الإنترنت، لكنها تطبع بخط الطابعة الذي لا يتضمن الحروف العربية. أما الطابعات الحرارية الموصولة بمنفذ USB فغير مدعومة في النسخة السحابية.",
        },
        {
          q: "هل يمكن للموظفين استخدامه بالعربية؟",
          a: "نعم. الواجهة كاملة والإيصالات وتقارير PDF متاحة بالعربية بتخطيط من اليمين إلى اليسار، ويستطيع كل موظف التبديل بين العربية والإنجليزية على شاشته.",
        },
        {
          q: "هل يناسب المطاعم ذات الفروع المتعددة؟",
          a: "نعم. يضم الحساب الواحد عدة فروع، ويُعيَّن كل موظف على الفروع التي يعمل بها، ويمكن نقل المخزون بين الفروع. ولكل فرع قائمته وطاولاته ومحطات مطبخه وإعداداته الضريبية.",
        },
        {
          q: "كم تكلفة البرنامج؟",
          a: "يعتمد السعر على عدد الفروع والأجهزة واحتياجات الإعداد. اطلب عرضًا تجريبيًا وسيرسل لك فريق Wem Studios عرض سعر.",
        },
      ],
      cta: {
        title: "شاهد مطعمك يعمل من نظام واحد",
        body: "اطلب عرضًا تجريبيًا وسيتواصل معك فريق Wem Studios ليعرض عليك الطلبات وشاشة المطبخ والفواتير والتقارير بإعداد قريب من مطعمك.",
      },
      image: {
        src: "/images/product/screens/dashboard-ar.png",
        alt: "لوحة تحكم Ahemad's Restro بالعربية تعرض إيرادات اليوم والطلبات والطاولات المشغولة وطابور المطبخ",
      },
    },
  },
};
