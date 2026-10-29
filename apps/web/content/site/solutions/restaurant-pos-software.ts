import type { SolutionPage } from "./types";

// Order-taking at the counter and the table: speed, menu options, tables,
// sending to the kitchen and taking payment. Bill maths, tax and refunds
// are covered in depth by restaurant-billing-software.
export const restaurantPosSoftware: SolutionPage = {
  slug: "restaurant-pos-software",
  locales: ["en", "ar"],
  related: ["restaurant-billing-software", "kitchen-display-system", "qr-ordering-system", "restaurant-management-software"],
  copy: {
    en: {
      metaTitle: "Restaurant POS Software for Tablets & PCs | Ahemad's Restro",
      metaDescription:
        "Browser-based restaurant POS for dine-in, takeaway and delivery: modifiers, combos, table bills, kitchen tickets, split bills and fast checkout. Book a demo.",
      keywords: [
        "restaurant POS software",
        "restaurant POS system",
        "POS for restaurants",
        "cloud POS for restaurants",
        "tablet POS for restaurants",
        "cafe POS system",
      ],
      navLabel: "Restaurant POS software",
      h1: "Restaurant POS software built for a busy service",
      intro:
        "Take dine-in, takeaway and delivery orders on a tablet, desktop or phone, send them to the right kitchen station in one tap, and close the bill with any payment method your guests use.",
      problem: {
        title: "What slows a restaurant counter down",
        paragraphs: [
          "At peak time a cashier is juggling a queue, a table that wants to add dessert, and a delivery order on the phone. A POS that makes them hunt for options, re-type a table's order or walk to the kitchen with a slip costs minutes on every order and creates mistakes the guest will notice.",
          "A restaurant POS should know the difference between a table that already has an open bill and a new walk-in, force the cashier to pick required options such as size or spice level, and send each item to the station that cooks it. Payment should be one screen, whether the guest pays cash, by card or splits the bill with friends.",
        ],
      },
      capabilities: {
        title: "How the POS works",
        items: [
          { icon: "pos", title: "Every order type on one screen", body: "Switch between dine-in, takeaway and delivery; delivery orders take an address and phone number, and any order can be scheduled for later." },
          { icon: "menu", title: "Options, portions and combos", body: "Required and optional modifier groups, half or custom portions, combo items, menu search, sold-out items and vegetarian or non-vegetarian marks." },
          { icon: "tables", title: "Table-aware ordering", body: "Pick a table from the floor plan, see whether it already has open bills, and add another round to an existing bill as a new kitchen ticket." },
          { icon: "kds", title: "Straight to the kitchen", body: "Each item goes to its kitchen station's display, and you can print a kitchen order ticket. Checkout shows whether the kitchen has accepted, is preparing or has finished the order." },
          { icon: "billing", title: "Fast checkout", body: "One-tap buttons for cash, card, mada, STC Pay, Apple Pay, bank transfer, gift card and store credit, with quick cash amounts and change due." },
          { icon: "offers", title: "Split bills and part payments", body: "Split a table's bill equally between guests, record part payments by different methods, and keep the table open until the balance is paid." },
          { icon: "customers", title: "Customers at the counter", body: "Attach a customer by name or phone, redeem loyalty points, apply a coupon or gift card, and add a tip before payment." },
          { icon: "responsive", title: "Customer display", body: "Open a customer-facing screen on a second monitor so guests can follow their order and the amount due." },
          { icon: "staff", title: "Roles and PIN sign-in", body: "Staff sign in quickly with a PIN on a shared device, discounts are limited to roles that are allowed to give them, and actions are recorded in the audit log." },
        ],
      },
      limits: {
        title: "Good to know",
        points: [
          "Card payments are taken on your own terminal and recorded in the POS; no payment gateway is integrated.",
          "The POS needs an internet connection; orders are not queued offline.",
          "USB thermal printers attached to a tablet are not supported in the cloud edition; use browser printing or a network printer.",
          "There is no native iOS or Android app; the POS runs in the browser.",
        ],
      },
      faq: [
        {
          q: "Does the POS work on an iPad or Android tablet?",
          a: "Yes. It runs in a modern browser, so any recent iPad, Android tablet, Windows or Mac computer, or phone can be used as a POS. There is no app to install.",
        },
        {
          q: "Can a table split the bill?",
          a: "Yes. You can split the bill equally between a number of guests and record each share as a part payment, using a different payment method for each if needed. The table stays open until the full amount is paid.",
        },
        {
          q: "How do orders reach the kitchen?",
          a: "When you send an order, each item appears on the kitchen display of the station that prepares it. You can also print a kitchen order ticket through the browser or on a network thermal printer.",
        },
        {
          q: "Does the POS process card payments?",
          a: "The POS records the payment method and amount after your card terminal or wallet approves the payment. It is not connected to a payment gateway, so the card machine works separately.",
        },
        {
          q: "Can I stop cashiers from giving discounts?",
          a: "Yes. Discounts are controlled by role permissions. A cashier whose role does not allow discounts sees a message instead of the discount field.",
        },
        {
          q: "What happens if the internet goes down?",
          a: "Ahemad's Restro is a cloud system and needs a connection to take orders; there is no offline mode. A mobile data hotspot is a sensible backup connection to keep at the counter.",
        },
      ],
      cta: {
        title: "Try the POS with your own menu",
        body: "Request a demo and Wem Studios will contact you to show how your cashiers would take orders, send them to the kitchen and close bills.",
      },
      image: {
        src: "/images/product/screens/pos-en.png",
        alt: "Restaurant POS screen with menu categories, item cards and the current order with its total",
      },
    },
    ar: {
      metaTitle: "نظام نقاط البيع للمطاعم وبرنامج كاشير | Ahemad's Restro",
      metaDescription:
        "برنامج كاشير مطاعم يعمل من المتصفح للطلبات المحلية والسفري والتوصيل مع الإضافات والوجبات وفواتير الطاولات وتقسيم الفاتورة والدفع بمدى. اطلب عرضًا تجريبيًا.",
      keywords: [
        "نظام نقاط البيع للمطاعم",
        "برنامج كاشير مطاعم",
        "نظام كاشير للمطاعم",
        "برنامج نقاط البيع للمطاعم",
        "نظام POS للمطاعم",
        "برنامج كاشير للكافيهات",
      ],
      navLabel: "نظام نقاط البيع للمطاعم",
      h1: "نظام نقاط البيع للمطاعم مصمم لساعات الذروة",
      intro:
        "سجّل الطلبات المحلية والسفري والتوصيل من جهاز لوحي أو حاسوب أو جوال، وأرسلها إلى محطة المطبخ المناسبة بلمسة واحدة، وأغلق الفاتورة بأي وسيلة دفع يستخدمها ضيوفك.",
      problem: {
        title: "ما الذي يبطئ الكاشير في المطعم؟",
        paragraphs: [
          "في وقت الذروة يتعامل الكاشير مع طابور من الزبائن، وطاولة تريد إضافة حلى، وطلب توصيل على الهاتف في الوقت نفسه. وبرنامج الكاشير الذي يجعله يبحث عن الخيارات، أو يعيد كتابة طلب الطاولة، أو يحمل ورقة إلى المطبخ، يهدر دقائق في كل طلب ويسبب أخطاء يلاحظها الضيف.",
          "نظام نقاط البيع الجيد يميّز بين طاولة لها فاتورة مفتوحة وزبون جديد، ويُلزم الكاشير باختيار الخيارات المطلوبة مثل الحجم أو درجة الحرارة، ويرسل كل صنف إلى المحطة التي تحضّره. ويكون الدفع في شاشة واحدة سواء دفع الضيف نقدًا أو بمدى أو قسّم الفاتورة مع أصدقائه.",
        ],
      },
      capabilities: {
        title: "كيف يعمل نظام الكاشير",
        items: [
          { icon: "pos", title: "كل أنواع الطلبات في شاشة واحدة", body: "تنقّل بين الطلب المحلي والسفري والتوصيل؛ يُسجَّل لطلب التوصيل العنوان ورقم الجوال، ويمكن جدولة أي طلب لوقت لاحق." },
          { icon: "menu", title: "الإضافات والحصص والوجبات", body: "مجموعات إضافات إلزامية واختيارية، وأنصاف حصص أو حصص مخصصة، ووجبات مجمّعة، وبحث في القائمة، وتمييز الأصناف النافدة، وعلامة نباتي أو غير نباتي." },
          { icon: "tables", title: "طلبات مرتبطة بالطاولة", body: "اختر الطاولة من المخطط، واعرف إن كانت لها فواتير مفتوحة، وأضف جولة جديدة إلى الفاتورة القائمة تصل المطبخ كتذكرة جديدة." },
          { icon: "kds", title: "إلى المطبخ مباشرة", body: "يظهر كل صنف على شاشة محطة المطبخ التي تحضّره، ويمكن طباعة تذكرة المطبخ. وتعرض شاشة الدفع هل قبل المطبخ الطلب أو بدأ تحضيره أو أنهاه." },
          { icon: "billing", title: "دفع سريع", body: "أزرار بلمسة واحدة للنقد والبطاقة ومدى وSTC Pay وApple Pay والتحويل البنكي وبطاقة الهدايا والرصيد المحفوظ، مع مبالغ نقدية سريعة وحساب الباقي." },
          { icon: "offers", title: "تقسيم الفاتورة والدفع الجزئي", body: "قسّم فاتورة الطاولة بالتساوي بين الضيوف، وسجّل دفعات جزئية بوسائل مختلفة، وتبقى الطاولة مفتوحة حتى سداد المتبقي." },
          { icon: "customers", title: "العميل عند الكاشير", body: "اربط الطلب بعميل بالاسم أو الجوال، واستبدل نقاط الولاء، وطبّق كوبونًا أو بطاقة هدايا، وأضف الإكرامية قبل الدفع." },
          { icon: "responsive", title: "شاشة العميل", body: "افتح شاشة مخصصة للعميل على شاشة ثانية ليتابع طلبه والمبلغ المستحق." },
          { icon: "staff", title: "الأدوار والدخول برمز PIN", body: "يدخل الموظفون بسرعة برمز PIN على الجهاز المشترك، ويقتصر منح الخصم على الأدوار المسموح لها، وتُسجَّل العمليات في سجل التدقيق." },
        ],
      },
      limits: {
        title: "معلومات مهمة",
        points: [
          "تتم عمليات البطاقة ومدى على جهاز الشبكة لديك ثم تُسجَّل في النظام؛ لا يوجد ربط مع بوابة دفع.",
          "يحتاج النظام إلى اتصال بالإنترنت، ولا تُحفظ الطلبات دون اتصال.",
          "الطابعات الحرارية الموصولة بمنفذ USB غير مدعومة في النسخة السحابية؛ استخدم الطباعة من المتصفح أو طابعة شبكية.",
          "لا يوجد تطبيق أصلي لنظامي iOS أو Android؛ يعمل الكاشير في المتصفح.",
        ],
      },
      faq: [
        {
          q: "هل يعمل الكاشير على iPad أو جهاز Android اللوحي؟",
          a: "نعم. يعمل في أي متصفح حديث، لذلك يمكن استخدام أي iPad أو جهاز Android لوحي حديث أو حاسوب أو جوال كنقطة بيع، دون تثبيت تطبيق.",
        },
        {
          q: "هل يمكن تقسيم فاتورة الطاولة؟",
          a: "نعم. قسّم الفاتورة بالتساوي على عدد الضيوف وسجّل حصة كل ضيف كدفعة جزئية، بوسيلة دفع مختلفة لكل منهم عند الحاجة. وتبقى الطاولة مفتوحة حتى سداد المبلغ كاملًا.",
        },
        {
          q: "كيف تصل الطلبات إلى المطبخ؟",
          a: "عند إرسال الطلب يظهر كل صنف على شاشة المطبخ الخاصة بالمحطة التي تحضّره، ويمكن أيضًا طباعة تذكرة المطبخ من المتصفح أو على طابعة حرارية شبكية.",
        },
        {
          q: "هل يقبل النظام الدفع بمدى مباشرة؟",
          a: "يسجّل النظام وسيلة الدفع والمبلغ بعد موافقة جهاز الشبكة أو المحفظة. ولا يرتبط ببوابة دفع، لذا يعمل جهاز مدى بشكل منفصل.",
        },
        {
          q: "هل يمكن منع الكاشير من منح الخصومات؟",
          a: "نعم. الخصومات مرتبطة بصلاحيات الدور، والكاشير الذي لا يملك صلاحية الخصم تظهر له رسالة بدلًا من حقل الخصم.",
        },
        {
          q: "ماذا يحدث إذا انقطع الإنترنت؟",
          a: "Ahemad's Restro نظام سحابي يحتاج إلى اتصال لتسجيل الطلبات، ولا يوجد وضع عمل دون اتصال. ومن المفيد الاحتفاظ باتصال احتياطي عبر شريحة بيانات جوال عند الكاشير.",
        },
      ],
      cta: {
        title: "جرّب نظام الكاشير بقائمة مطعمك",
        body: "اطلب عرضًا تجريبيًا وسيتواصل معك فريق Wem Studios ليعرض لك كيف يسجّل الكاشير الطلبات ويرسلها إلى المطبخ ويغلق الفواتير.",
      },
      image: {
        src: "/images/product/screens/pos-ar.png",
        alt: "شاشة نقطة البيع بالعربية مع فئات القائمة والأصناف والطلب الحالي وإجماليه",
      },
    },
  },
};
