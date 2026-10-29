import type { SolutionPage } from "./types";

// Kitchen display intent: stations, ticket flow, ageing, sound, rejects and
// kitchen printing.
export const kitchenDisplaySystem: SolutionPage = {
  slug: "kitchen-display-system",
  locales: ["en", "ar"],
  related: ["restaurant-pos-software", "qr-ordering-system", "restaurant-management-software"],
  copy: {
    en: {
      metaTitle: "Kitchen Display System for Restaurants | Ahemad's Restro",
      metaDescription:
        "Replace paper tickets with a live kitchen display: tickets by station, New to Ready columns, ageing timers, sound alerts, priority and reasons for rejects.",
      keywords: [
        "kitchen display system",
        "KDS for restaurants",
        "restaurant kitchen display screen",
        "kitchen order ticket system",
        "KDS software",
      ],
      navLabel: "Kitchen display system",
      h1: "A kitchen display system that keeps every ticket moving",
      intro:
        "Orders from the POS, table QR codes and the kiosk appear on the kitchen screen within moments, sorted by station and by stage, so cooks always know what to start next and front of house knows what is ready.",
      problem: {
        title: "What goes wrong with paper tickets",
        paragraphs: [
          "Paper tickets get lost, smudged or stuck to the wrong rail. When a table adds a course, the kitchen gets a second slip with no link to the first, and nobody can tell which ticket has been waiting longest until a guest complains.",
          "A kitchen display system shows every open ticket in one place, moves it from new to ready with a tap, and makes late tickets impossible to miss. When the kitchen cannot make a dish, it can say so with a reason instead of sending a runner to find the waiter.",
        ],
      },
      capabilities: {
        title: "How the kitchen display works",
        items: [
          { icon: "kds", title: "New, Accepted, Preparing, Ready", body: "Tickets sit in four columns. Cooks tap to accept, start preparing and mark ready, then front of house marks the order served." },
          { icon: "menu", title: "One screen per station", body: "Assign menu items to stations such as grill, fryer or bar. Each kitchen screen remembers its own station, or shows all stations with a ticket count for each." },
          { icon: "orders", title: "Ageing timers", body: "Every ticket shows minutes since it arrived. It is flagged as late after 15 minutes and overdue after 30, and new tickets stand out for their first two minutes." },
          { icon: "realtime", title: "Live updates with a sound", body: "New tickets arrive over a live connection with a sound alert that each screen can mute. If the connection drops, a banner says so and tickets keep refreshing every few seconds." },
          { icon: "offers", title: "Priority tickets", body: "Mark a ticket as priority so the whole kitchen sees it should go first." },
          { icon: "tables", title: "Reject with a reason", body: "If a dish cannot be made, reject the ticket with a reason such as out of stock or equipment problem; the table or guest is told, and the ticket stays on record with the cook's name." },
          { icon: "qr", title: "Incoming online orders", body: "QR orders that need approval appear at the top of the screen, where the kitchen or a manager can accept or decline them." },
          { icon: "billing", title: "Kitchen tickets on paper too", body: "Print a kitchen order ticket from the browser or on a network thermal printer, and reprint it clearly marked REPRINT." },
          { icon: "staff", title: "Kitchen-only accounts", body: "Give kitchen tablets a kitchen staff role that sees tickets only, not bills, customers or settings. The screen also shows the average time to ready today." },
        ],
      },
      limits: {
        title: "Good to know",
        points: [
          "The kitchen display is a web page; any tablet or screen with a modern browser works, and there is no separate KDS app.",
          "Browsers only play sound after someone taps the screen once, so tap it when you open the display.",
          "USB kitchen printers are not supported in the cloud edition; network printers must be reachable from the internet.",
        ],
      },
      faq: [
        {
          q: "What hardware do I need for a kitchen display?",
          a: "Any tablet, all-in-one or monitor with a modern browser. Use landscape orientation, set the screen to stay awake while charging, and sign in with a kitchen staff account.",
        },
        {
          q: "Can each kitchen station have its own screen?",
          a: "Yes. Each screen picks its station, for example grill or bar, and remembers it. A manager's screen can show all stations at once.",
        },
        {
          q: "How does the waiter know food is ready?",
          a: "When the kitchen marks a ticket ready, the POS shows the order as ready to serve, and guests who ordered by QR code see their items as ready on their phone.",
        },
        {
          q: "What happens when an item runs out?",
          a: "The kitchen can reject the ticket with a reason such as out of stock, and the table is told. A manager can also mark the item unavailable in the menu so it stops appearing on the POS, QR page and kiosk.",
        },
        {
          q: "Do I still need kitchen printers?",
          a: "No, but you can keep them. Some kitchens run on screens only; others print a ticket per order as a backup or for a station without a screen.",
        },
      ],
      cta: {
        title: "Watch tickets move through a live kitchen",
        body: "Request a demo and Wem Studios will contact you to set up stations like yours and show how tickets flow from the POS and QR orders to the kitchen screen.",
      },
      image: {
        src: "/images/product/screens/kds-en.png",
        alt: "Kitchen display with tickets in New, Accepted, Preparing and Ready columns and a station picker",
      },
    },
    ar: {
      metaTitle: "شاشة المطبخ للمطاعم KDS | Ahemad's Restro",
      metaDescription:
        "استبدل تذاكر المطبخ الورقية بشاشة مطبخ مباشرة: تذاكر حسب المحطة، وأعمدة من جديد إلى جاهز، ومؤقت للتأخير، وتنبيه صوتي، وأولوية، ورفض مع ذكر السبب.",
      keywords: [
        "شاشة المطبخ",
        "شاشة المطبخ للمطاعم",
        "نظام شاشة المطبخ KDS",
        "شاشة طلبات المطبخ",
        "نظام تذاكر المطبخ",
      ],
      navLabel: "شاشة المطبخ",
      h1: "شاشة مطبخ تُبقي كل تذكرة في حركة",
      intro:
        "تظهر الطلبات القادمة من نقطة البيع ورموز QR على الطاولات والكشك على شاشة المطبخ خلال لحظات، مرتبة حسب المحطة والمرحلة، فيعرف الطهاة ما يبدؤون به، ويعرف فريق الصالة ما أصبح جاهزًا.",
      problem: {
        title: "مشكلات التذاكر الورقية",
        paragraphs: [
          "التذاكر الورقية تضيع أو تتلطخ أو تُعلَّق في المكان الخطأ. وعندما تضيف الطاولة طبقًا جديدًا تصل إلى المطبخ ورقة ثانية لا ترتبط بالأولى، ولا يعرف أحد أي تذكرة تنتظر منذ أطول وقت حتى يشتكي الضيف.",
          "شاشة المطبخ تعرض كل التذاكر المفتوحة في مكان واحد، وتنقل التذكرة من جديدة إلى جاهزة بلمسة، وتجعل التذاكر المتأخرة واضحة لا يمكن تجاهلها. وإذا تعذّر تحضير طبق يستطيع المطبخ إبلاغ ذلك مع السبب بدل إرسال أحد للبحث عن النادل.",
        ],
      },
      capabilities: {
        title: "كيف تعمل شاشة المطبخ",
        items: [
          { icon: "kds", title: "جديد، مقبول، قيد التحضير، جاهز", body: "تتوزع التذاكر على أربعة أعمدة؛ يضغط الطاهي للقبول ثم بدء التحضير ثم جاهز، ويعلّم فريق الصالة الطلب بأنه قُدّم." },
          { icon: "menu", title: "شاشة لكل محطة", body: "اربط الأصناف بمحطات مثل الشواية أو القلي أو المشروبات. تتذكر كل شاشة محطتها، أو تعرض كل المحطات مع عدد التذاكر لكل منها." },
          { icon: "orders", title: "مؤقت التأخير", body: "تعرض كل تذكرة الدقائق منذ وصولها، وتُميَّز متأخرة بعد 15 دقيقة ومتأخرة جدًا بعد 30 دقيقة، وتبرز التذاكر الجديدة في أول دقيقتين." },
          { icon: "realtime", title: "تحديث مباشر مع تنبيه صوتي", body: "تصل التذاكر الجديدة عبر اتصال مباشر مع تنبيه صوتي يمكن كتمه لكل شاشة. وإذا انقطع الاتصال يظهر شريط تنبيه وتستمر التذاكر في التحديث كل بضع ثوانٍ." },
          { icon: "offers", title: "تذاكر ذات أولوية", body: "علّم التذكرة بأولوية ليعرف المطبخ كله أنها تسبق غيرها." },
          { icon: "tables", title: "الرفض مع ذكر السبب", body: "إذا تعذّر تحضير طبق، ارفض التذكرة مع سبب مثل نفاد المخزون أو عطل في المعدات؛ يُبلَّغ الضيف أو الطاولة، وتبقى التذكرة مسجلة باسم الطاهي." },
          { icon: "qr", title: "الطلبات الإلكترونية الواردة", body: "تظهر طلبات QR التي تحتاج موافقة أعلى الشاشة، فيقبلها المطبخ أو المدير أو يرفضها." },
          { icon: "billing", title: "تذاكر ورقية عند الحاجة", body: "اطبع تذكرة المطبخ من المتصفح أو على طابعة حرارية شبكية، وأعد طباعتها مع علامة REPRINT واضحة." },
          { icon: "staff", title: "حسابات للمطبخ فقط", body: "امنح أجهزة المطبخ دور موظف مطبخ يرى التذاكر فقط دون الفواتير أو العملاء أو الإعدادات. وتعرض الشاشة أيضًا متوسط زمن التجهيز اليوم." },
        ],
      },
      limits: {
        title: "معلومات مهمة",
        points: [
          "شاشة المطبخ صفحة ويب تعمل على أي جهاز لوحي أو شاشة بمتصفح حديث، ولا يوجد تطبيق منفصل لها.",
          "لا تشغّل المتصفحات الصوت إلا بعد لمس الشاشة مرة واحدة، فالمس الشاشة عند فتحها.",
          "طابعات المطبخ الموصولة بمنفذ USB غير مدعومة في النسخة السحابية، ويجب أن تكون الطابعات الشبكية متاحة عبر الإنترنت. وتطبع الطابعات الحرارية بخطها الخاص الذي لا يتضمن الحروف العربية، فاطبع التذاكر العربية من المتصفح.",
        ],
      },
      faq: [
        {
          q: "ما الأجهزة المطلوبة لشاشة المطبخ؟",
          a: "أي جهاز لوحي أو حاسوب متكامل أو شاشة بمتصفح حديث. استخدمه بالوضع الأفقي، واضبطه ليبقى قيد التشغيل أثناء الشحن، وسجّل الدخول بحساب موظف مطبخ.",
        },
        {
          q: "هل يمكن أن يكون لكل محطة شاشتها؟",
          a: "نعم. تختار كل شاشة محطتها، مثل الشواية أو المشروبات، وتتذكرها. ويمكن لشاشة المدير عرض كل المحطات معًا.",
        },
        {
          q: "كيف يعرف النادل أن الطلب جاهز؟",
          a: "عندما يعلّم المطبخ التذكرة جاهزة، تعرض نقطة البيع الطلب جاهزًا للتقديم، ويرى الضيف الذي طلب عبر QR أصنافه جاهزة على جواله.",
        },
        {
          q: "ماذا يحدث إذا نفد صنف؟",
          a: "يستطيع المطبخ رفض التذكرة مع سبب مثل نفاد المخزون فتُبلَّغ الطاولة. ويمكن للمدير أيضًا جعل الصنف غير متاح في القائمة فيختفي من نقطة البيع وصفحة QR والكشك.",
        },
        {
          q: "هل ما زلت أحتاج إلى طابعات المطبخ؟",
          a: "ليس بالضرورة، ويمكنك الإبقاء عليها. بعض المطابخ تعمل بالشاشات فقط، وبعضها يطبع تذكرة لكل طلب كنسخة احتياطية أو لمحطة بلا شاشة.",
        },
      ],
      cta: {
        title: "شاهد التذاكر تتحرك في مطبخ حقيقي",
        body: "اطلب عرضًا تجريبيًا وسيتواصل معك فريق Wem Studios ليجهّز محطات مثل محطات مطبخك ويعرض كيف تنتقل التذاكر من الكاشير وطلبات QR إلى شاشة المطبخ.",
      },
      image: {
        src: "/images/product/screens/kds-ar.png",
        alt: "شاشة المطبخ بالعربية مع أعمدة التذاكر الجديدة والمقبولة وقيد التحضير والجاهزة واختيار المحطة",
      },
    },
  },
};
