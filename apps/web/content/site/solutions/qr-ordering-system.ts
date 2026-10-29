import type { SolutionPage } from "./types";

// Guest self-ordering: per-table QR codes, guest requests, order acceptance
// and the self-service kiosk.
export const qrOrderingSystem: SolutionPage = {
  slug: "qr-ordering-system",
  locales: ["en", "ar"],
  related: ["kitchen-display-system", "restaurant-pos-software", "restaurant-management-software"],
  copy: {
    en: {
      metaTitle: "QR Code Ordering System for Restaurants | Ahemad's Restro",
      metaDescription:
        "Guests scan the table QR code, order from their phone, call a waiter or ask for the bill. Staff approve each order before it reaches the kitchen. See a demo.",
      keywords: [
        "QR code ordering system",
        "QR menu ordering for restaurants",
        "table QR ordering",
        "contactless restaurant ordering",
        "self-service ordering kiosk",
        "restaurant self-order kiosk",
      ],
      navLabel: "QR ordering system",
      h1: "QR code ordering that keeps your staff in control",
      intro:
        "Every table gets its own QR code. Guests scan it, browse your menu in English or Arabic and place an order from their phone, with no app to download. Your team accepts the order and the kitchen sees it straight away.",
      problem: {
        title: "Why restaurants add QR ordering",
        paragraphs: [
          "On a busy night guests wait to catch a waiter's eye, first to order and again to add a drink or ask for the bill. Hand-written orders get misread, and staff spend their time walking back and forth instead of looking after the floor.",
          "Letting guests order from their own phone removes most of that waiting, but an open ordering page can also bring orders the kitchen cannot make or orders from someone who is not at the table. That is why QR ordering in Ahemad's Restro is tied to a specific table and, by default, every order waits for a staff member to accept it.",
        ],
      },
      capabilities: {
        title: "How QR ordering works",
        items: [
          { icon: "qr", title: "A QR code per table", body: "Generate each table's code from the Tables page and print it on a table tent. Generating a new code immediately stops the old one working." },
          { icon: "menu", title: "Your live menu on the guest's phone", body: "Categories, photos and options from your real menu, with prices and tax shown the way your branch charges them; items you mark unavailable disappear. Nothing to install." },
          { icon: "orders", title: "Orders wait for your approval", body: "New QR orders appear for staff to accept or decline with a reason, on the Orders page and on the kitchen display. Each branch can switch on auto-accept instead." },
          { icon: "kds", title: "Straight to the right station", body: "Once accepted, items appear on the kitchen display of the station that prepares them." },
          { icon: "tables", title: "Call a waiter or ask for the bill", body: "Guests tap a button on the same page; the request appears on the Tables page until a staff member marks it handled." },
          { icon: "realtime", title: "Guests can follow their order", body: "The guest page shows each item as received, being prepared, ready or served, and guests can order another round from the same table." },
          { icon: "responsive", title: "Self-service kiosk", body: "Turn a touchscreen into a kiosk: eat here or take away, options, review, then an order number to pay at the counter. It resets after the guest leaves." },
          { icon: "language", title: "Arabic and English for guests", body: "Guests switch language on the QR page; the kiosk starts every new customer in Arabic with an English option." },
        ],
      },
      limits: {
        title: "What QR ordering does not do",
        points: [
          "Guests cannot pay online from the QR page or the kiosk; payment is taken by your staff.",
          "The QR page is for guests at a table, not an online storefront for home delivery.",
          "Ordering needs an internet connection on the guest's phone and the kiosk.",
          "Locking a kiosk tablet to one page uses the device's own kiosk or screen-pinning settings.",
        ],
      },
      faq: [
        {
          q: "Do guests need to download an app?",
          a: "No. Scanning the table's QR code opens your menu in the phone's browser. Guests enter a first name, choose their items and place the order.",
        },
        {
          q: "Can guests pay through the QR code?",
          a: "No. There is no online payment. Guests can tap 'Request bill', and your staff take payment at the table or counter with your usual terminal or cash.",
        },
        {
          q: "How do you stop fake or prank orders?",
          a: "Each QR code belongs to one table and uses an unguessable link. By default staff must accept each QR order before it is prepared, public ordering is rate-limited, and you can replace a table's code at any time.",
        },
        {
          q: "What does the self-service kiosk need?",
          a: "A touchscreen with a modern browser. You turn the kiosk on in Settings, open its address on the device and add it to the home screen. Kiosk orders go straight to the kitchen and are paid at the counter.",
        },
        {
          q: "Can I turn off order approval?",
          a: "Yes. Each branch can accept online orders automatically. Leaving approval on is safer when you are just starting with QR ordering.",
        },
      ],
      cta: {
        title: "See QR ordering on your own tables",
        body: "Request a demo and Wem Studios will contact you to show the guest page, order approval and the kitchen display working together.",
      },
      image: {
        src: "/images/product/screens/tables-en.webp",
        alt: "Table management screen with live table status, guest requests and quick actions",
      },
    },
    ar: {
      metaTitle: "نظام الطلب عبر رمز QR للمطاعم | Ahemad's Restro",
      metaDescription:
        "يمسح الضيف رمز QR على الطاولة ويطلب من جواله ويستدعي النادل أو يطلب الفاتورة، ويقبل الموظف الطلب قبل وصوله إلى المطبخ. نظام طلبات مطاعم بالعربية والإنجليزية.",
      keywords: [
        "الطلب عبر رمز QR",
        "نظام طلبات المطاعم",
        "منيو QR للمطاعم",
        "الطلب من الطاولة عبر الجوال",
        "كشك الطلب الذاتي للمطاعم",
      ],
      navLabel: "الطلب عبر رمز QR",
      h1: "الطلب عبر رمز QR مع بقاء القرار بيد فريقك",
      intro:
        "لكل طاولة رمز QR خاص بها. يمسحه الضيف، ويتصفح قائمتك بالعربية أو الإنجليزية، ويطلب من جواله دون تنزيل أي تطبيق. يقبل فريقك الطلب فيراه المطبخ مباشرة.",
      problem: {
        title: "لماذا تضيف المطاعم الطلب عبر QR؟",
        paragraphs: [
          "في الليالي المزدحمة ينتظر الضيف أن يلفت انتباه النادل، مرة ليطلب ومرة ليضيف مشروبًا ومرة ليطلب الفاتورة. وتُقرأ الطلبات المكتوبة باليد خطأً أحيانًا، ويقضي الموظفون وقتهم ذهابًا وإيابًا بدل الاهتمام بالصالة.",
          "حين يطلب الضيف من جواله يختفي معظم هذا الانتظار، لكن صفحة الطلب المفتوحة قد تجلب طلبات لا يستطيع المطبخ تحضيرها أو طلبات من شخص ليس على الطاولة. لذلك يرتبط الطلب عبر QR في Ahemad's Restro بطاولة محددة، وينتظر كل طلب افتراضيًا قبول أحد الموظفين.",
        ],
      },
      capabilities: {
        title: "كيف يعمل الطلب عبر QR",
        items: [
          { icon: "qr", title: "رمز QR لكل طاولة", body: "أنشئ رمز كل طاولة من صفحة الطاولات واطبعه على حامل الطاولة. وإنشاء رمز جديد يوقف الرمز القديم فورًا." },
          { icon: "menu", title: "قائمتك الحية على جوال الضيف", body: "الفئات والصور والخيارات من قائمتك الفعلية، مع عرض الأسعار والضريبة وفق إعداد فرعك، وتختفي الأصناف التي تجعلها غير متاحة. لا شيء للتثبيت." },
          { icon: "orders", title: "الطلبات تنتظر موافقتك", body: "تظهر طلبات QR الجديدة ليقبلها الموظف أو يرفضها مع ذكر السبب، في صفحة الطلبات وعلى شاشة المطبخ. ويمكن لكل فرع تفعيل القبول التلقائي بدلًا من ذلك." },
          { icon: "kds", title: "إلى المحطة الصحيحة مباشرة", body: "بعد القبول تظهر الأصناف على شاشة المطبخ الخاصة بالمحطة التي تحضّرها." },
          { icon: "tables", title: "استدعاء النادل وطلب الفاتورة", body: "يضغط الضيف زرًا في الصفحة نفسها، فيظهر الطلب في صفحة الطاولات حتى يعلّمه الموظف منجزًا." },
          { icon: "realtime", title: "الضيف يتابع طلبه", body: "تعرض صفحة الضيف حالة كل صنف: مستلم، قيد التحضير، جاهز، تم التقديم، ويمكنه طلب جولة أخرى من الطاولة نفسها." },
          { icon: "responsive", title: "كشك الخدمة الذاتية", body: "حوّل شاشة لمس إلى كشك طلب ذاتي: محلي أو سفري، ثم الخيارات والمراجعة ورقم الطلب للدفع عند الكاشير، ويعود إلى البداية بعد مغادرة الضيف." },
          { icon: "language", title: "العربية والإنجليزية للضيوف", body: "يغيّر الضيف اللغة من صفحة QR، ويبدأ الكشك مع كل عميل جديد بالعربية مع خيار الإنجليزية." },
        ],
      },
      limits: {
        title: "ما لا يشمله الطلب عبر QR",
        points: [
          "لا يمكن للضيف الدفع إلكترونيًا من صفحة QR أو الكشك؛ يتولى موظفوك التحصيل.",
          "صفحة QR مخصصة للضيوف على الطاولة، وليست متجرًا إلكترونيًا لطلبات التوصيل إلى المنازل.",
          "يحتاج الطلب إلى اتصال بالإنترنت على جوال الضيف وعلى الكشك.",
          "قفل جهاز الكشك على صفحة واحدة يتم من إعدادات الجهاز نفسه (وضع الكشك أو تثبيت الشاشة).",
        ],
      },
      faq: [
        {
          q: "هل يحتاج الضيف إلى تنزيل تطبيق؟",
          a: "لا. مسح رمز QR على الطاولة يفتح قائمتك في متصفح الجوال، فيكتب الضيف اسمه الأول ويختار أصنافه ويرسل الطلب.",
        },
        {
          q: "هل يمكن للضيف الدفع عبر رمز QR؟",
          a: "لا، لا يوجد دفع إلكتروني. يضغط الضيف «طلب الفاتورة»، ويحصّل موظفوك المبلغ على الطاولة أو عند الكاشير بجهاز مدى أو نقدًا.",
        },
        {
          q: "كيف تمنعون الطلبات الوهمية؟",
          a: "كل رمز QR مرتبط بطاولة واحدة وبرابط يصعب تخمينه. وافتراضيًا يجب أن يقبل الموظف كل طلب قبل تحضيره، كما أن الطلب العام محدود المعدل، ويمكنك استبدال رمز أي طاولة في أي وقت.",
        },
        {
          q: "ماذا يحتاج كشك الخدمة الذاتية؟",
          a: "شاشة لمس بمتصفح حديث. تفعّل الكشك من الإعدادات، وتفتح عنوانه على الجهاز وتضيفه إلى الشاشة الرئيسية. وتذهب طلبات الكشك إلى المطبخ مباشرة وتُدفع عند الكاشير.",
        },
        {
          q: "هل يمكن إيقاف خطوة قبول الطلبات؟",
          a: "نعم. يمكن لكل فرع قبول الطلبات الإلكترونية تلقائيًا، لكن إبقاء القبول اليدوي أكثر أمانًا في بداية استخدام الطلب عبر QR.",
        },
      ],
      cta: {
        title: "شاهد الطلب عبر QR على طاولاتك",
        body: "اطلب عرضًا تجريبيًا وسيتواصل معك فريق Wem Studios ليعرض صفحة الضيف وقبول الطلبات وشاشة المطبخ وهي تعمل معًا.",
      },
      image: {
        src: "/images/product/screens/tables-ar.webp",
        alt: "شاشة إدارة الطاولات بالعربية مع حالة كل طاولة وطلبات الضيوف والإجراءات السريعة",
      },
    },
  },
};
