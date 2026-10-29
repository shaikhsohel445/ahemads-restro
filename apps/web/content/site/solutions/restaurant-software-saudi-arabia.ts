import type { SolutionPage } from "./types";

// Saudi market page: Arabic/RTL, SAR, Asia/Riyadh, SA_VAT (15 %, VAT-
// inclusive), ZATCA Phase 1 simplified invoice, Saudi payment methods.
// Phase 2 / FATOORA and payment gateways are stated as NOT included.
export const restaurantSoftwareSaudiArabia: SolutionPage = {
  slug: "restaurant-software-saudi-arabia",
  locales: ["en", "ar"],
  related: ["arabic-restaurant-software", "restaurant-billing-software", "restaurant-pos-software", "qr-ordering-system"],
  copy: {
    en: {
      metaTitle: "Restaurant Software in Saudi Arabia | Ahemad's Restro",
      metaDescription:
        "Restaurant POS and management software for Saudi Arabia: Arabic interface, SAR, 15% VAT-inclusive pricing and bilingual invoices with the ZATCA Phase 1 QR.",
      keywords: [
        "restaurant software Saudi Arabia",
        "restaurant POS Saudi Arabia",
        "restaurant management system KSA",
        "ZATCA restaurant invoice",
        "restaurant POS with VAT Saudi",
        "restaurant software Riyadh",
      ],
      navLabel: "Restaurant software for Saudi Arabia",
      h1: "Restaurant software set up for Saudi Arabia",
      intro:
        "New restaurants in Ahemad's Restro start with Saudi settings: Saudi Riyal, Riyadh time, 15% VAT included in menu prices, and receipts printed as bilingual simplified tax invoices. Your team can work in Arabic or English.",
      problem: {
        title: "What Saudi restaurants need from their software",
        paragraphs: [
          "A restaurant in Saudi Arabia has to show VAT-inclusive prices, print simplified tax invoices that carry the seller's VAT number and a QR code, and do it for staff who may prefer Arabic while managers read reports in English. Software built for another market often treats Arabic as an afterthought, prints the wrong tax wording or works in the wrong time zone.",
          "Ahemad's Restro was localised for Saudi Arabia from the start: the Arabic interface is complete and right-to-left, amounts and dates follow the restaurant's currency and time zone rather than the device's, and the Saudi VAT setting drives both the bill calculation and the printed invoice.",
        ],
      },
      capabilities: {
        title: "Saudi-ready features",
        items: [
          { icon: "language", title: "Complete Arabic interface", body: "Every screen in Arabic with a right-to-left layout and the IBM Plex Sans Arabic font; each staff member can switch to English on their own screen." },
          { icon: "currency", title: "SAR and Riyadh time", body: "Amounts in Saudi Riyal with two decimals, and every time shown in Asia/Riyadh, even when a device or server is set to another zone." },
          { icon: "billing", title: "VAT at 15%, included in prices", body: "New menu items default to the 15% standard rate with VAT-inclusive pricing. Rates stay editable per item, and discounts reduce the taxable value correctly." },
          { icon: "qr", title: "ZATCA Phase 1 simplified tax invoice", body: "Paid receipts from a branch with a VAT number print as bilingual simplified tax invoices with the QR code containing seller, VAT number, time, total and VAT." },
          { icon: "pos", title: "mada, STC Pay and Apple Pay", body: "Record payments by mada, STC Pay, Apple Pay, card, cash, bank transfer or gift card after your terminal or wallet approves them." },
          { icon: "reports", title: "VAT summary and cash close", body: "Review taxable value and VAT by rate for any period, and close each day with counted cash against the expected amount." },
          { icon: "responsive", title: "Kiosk and QR ordering in Arabic", body: "The self-service kiosk starts every customer in Arabic, and guests ordering by table QR code can switch between Arabic and English." },
        ],
      },
      local: {
        title: "Saudi defaults at a glance",
        points: [
          "Currency: Saudi Riyal (SAR)",
          "Time zone: Asia/Riyadh",
          "Tax: Saudi VAT, 15% standard rate, VAT-inclusive prices",
          "VAT number check: warns if it is not 15 digits starting and ending with 3",
          "Receipts: bilingual simplified tax invoice with the ZATCA Phase 1 QR code",
          "Payment methods: mada, STC Pay and Apple Pay alongside cash and card",
        ],
        note: "These features help you prepare compliant receipts but are not tax advice. Confirm the current VAT rate and the treatment of your items with ZATCA or a tax adviser before going live.",
      },
      limits: {
        title: "Not included",
        points: [
          "ZATCA Phase 2 (integration with the FATOORA platform: XML invoices, cryptographic stamp, clearance and reporting) is not implemented. Restaurants in scope must add a certified solution.",
          "No payment-gateway integration: mada, STC Pay and Apple Pay payments are taken on your own terminal and recorded by staff.",
          "The bilingual invoice with its QR code prints through browser printing; direct ESC/POS thermal printing has no Arabic characters and no ZATCA QR.",
          "Dates use the Gregorian calendar and Latin digits; Hijri dates are not shown.",
        ],
      },
      faq: [
        {
          q: "Is Ahemad's Restro ZATCA compliant?",
          a: "It covers Phase 1 (generation): paid receipts from a Saudi VAT branch with a VAT number are bilingual simplified tax invoices with the required QR code. Phase 2 integration with FATOORA is not included, so a restaurant that must comply with Phase 2 needs an additional certified solution.",
        },
        {
          q: "Does it accept mada payments?",
          a: "Staff record mada payments in the POS after your mada terminal approves them. The software is not connected to a payment gateway or acquirer.",
        },
        {
          q: "Are menu prices VAT-inclusive?",
          a: "Yes, by default, because Saudi consumer prices must include VAT. A branch can switch to VAT-exclusive pricing, and each menu item keeps its own rate.",
        },
        {
          q: "Can the staff use Arabic and the manager English?",
          a: "Yes. Language is chosen on each screen, so the cashier can work in Arabic while the manager reviews reports in English. The simplified tax invoice is always bilingual.",
        },
        {
          q: "Which printer should I use for Saudi invoices?",
          a: "Print the simplified tax invoice through the browser, on any receipt or office printer the device can use. That route prints the Arabic text and the ZATCA QR code; direct ESC/POS thermal printing does not.",
        },
        {
          q: "Is this tax advice?",
          a: "No. The software applies the settings you choose. Confirm your VAT registration, rates and invoicing obligations with ZATCA or a qualified tax adviser.",
        },
      ],
      cta: {
        title: "See a Saudi setup with your menu",
        body: "Request a demo and Wem Studios will contact you to show Arabic screens, VAT-inclusive pricing and the simplified tax invoice with your own items.",
      },
      image: {
        src: "/images/product/screens/receipt-en.png",
        alt: "Bilingual simplified tax invoice with seller VAT number, VAT total and the ZATCA QR code",
      },
    },
    ar: {
      metaTitle: "برنامج مطاعم في السعودية | Ahemad's Restro",
      metaDescription:
        "برنامج إدارة مطاعم ونقاط بيع للسوق السعودي: واجهة عربية كاملة، والريال السعودي، وضريبة 15% شاملة في الأسعار، وفاتورة ضريبية مبسطة مع رمز QR للمرحلة الأولى.",
      keywords: [
        "برنامج مطاعم في السعودية",
        "برنامج إدارة المطاعم في السعودية",
        "نظام كاشير مطاعم السعودية",
        "برنامج مطاعم مع ضريبة القيمة المضافة",
        "فاتورة ضريبية مبسطة للمطاعم",
        "برنامج مطاعم الرياض",
      ],
      navLabel: "برنامج مطاعم في السعودية",
      h1: "برنامج مطاعم مهيأ للسوق السعودي",
      intro:
        "تبدأ المطاعم الجديدة في Ahemad's Restro بالإعدادات السعودية: الريال السعودي، وتوقيت الرياض، وضريبة قيمة مضافة 15% مشمولة في أسعار القائمة، وإيصالات تُطبع فواتير ضريبية مبسطة ثنائية اللغة. ويعمل فريقك بالعربية أو الإنجليزية.",
      problem: {
        title: "ما يحتاجه المطعم في السعودية من برنامجه",
        paragraphs: [
          "على المطعم في السعودية أن يعرض أسعارًا شاملة لضريبة القيمة المضافة، وأن يطبع فواتير ضريبية مبسطة تحمل الرقم الضريبي للبائع ورمز QR، وأن يوفر ذلك لموظفين قد يفضّلون العربية بينما يقرأ المديرون التقارير بالإنجليزية. والبرامج المصممة لأسواق أخرى كثيرًا ما تعامل العربية كإضافة ثانوية، أو تطبع مسمى الضريبة خطأً، أو تعمل بمنطقة زمنية غير صحيحة.",
          "صُمم Ahemad's Restro للسوق السعودي منذ البداية: الواجهة العربية كاملة ومن اليمين إلى اليسار، والمبالغ والتواريخ تتبع عملة المطعم ومنطقته الزمنية لا إعدادات الجهاز، وإعداد ضريبة القيمة المضافة السعودية يحكم حساب الفاتورة والفاتورة المطبوعة معًا.",
        ],
      },
      capabilities: {
        title: "مزايا جاهزة للسوق السعودي",
        items: [
          { icon: "language", title: "واجهة عربية كاملة", body: "كل الشاشات بالعربية بتخطيط من اليمين إلى اليسار وخط IBM Plex Sans Arabic، ويمكن لكل موظف التبديل إلى الإنجليزية على شاشته." },
          { icon: "currency", title: "الريال السعودي وتوقيت الرياض", body: "المبالغ بالريال السعودي بخانتين عشريتين، وكل الأوقات بتوقيت الرياض حتى لو كان الجهاز أو الخادم على منطقة زمنية أخرى." },
          { icon: "billing", title: "ضريبة 15% مشمولة في الأسعار", body: "تأخذ الأصناف الجديدة النسبة الأساسية 15% افتراضيًا مع أسعار شاملة للضريبة، وتبقى النسبة قابلة للتعديل لكل صنف، وتخفّض الخصومات القيمة الخاضعة للضريبة بشكل صحيح." },
          { icon: "qr", title: "فاتورة ضريبية مبسطة للمرحلة الأولى", body: "تُطبع الإيصالات المدفوعة في الفرع الذي له رقم ضريبي فواتير ضريبية مبسطة ثنائية اللغة مع رمز QR يتضمن اسم البائع والرقم الضريبي والوقت والإجمالي ومبلغ الضريبة." },
          { icon: "pos", title: "مدى وSTC Pay وApple Pay", body: "سجّل المدفوعات بمدى وSTC Pay وApple Pay والبطاقة والنقد والتحويل البنكي وبطاقة الهدايا بعد موافقة جهاز الشبكة أو المحفظة." },
          { icon: "reports", title: "ملخص الضريبة وإقفال الصندوق", body: "راجع القيمة الخاضعة للضريبة ومبلغ الضريبة حسب النسبة لأي فترة، وأقفل كل يوم بمقارنة النقد المعدود بالمبلغ المتوقع." },
          { icon: "responsive", title: "الكشك والطلب عبر QR بالعربية", body: "يبدأ كشك الخدمة الذاتية مع كل عميل بالعربية، ويستطيع الضيف الذي يطلب عبر رمز QR التبديل بين العربية والإنجليزية." },
        ],
      },
      local: {
        title: "الإعدادات السعودية باختصار",
        points: [
          "العملة: الريال السعودي (SAR)",
          "المنطقة الزمنية: توقيت الرياض (Asia/Riyadh)",
          "الضريبة: ضريبة القيمة المضافة السعودية بنسبة 15% وأسعار شاملة للضريبة",
          "التحقق من الرقم الضريبي: تنبيه إذا لم يكن 15 رقمًا يبدأ وينتهي بالرقم 3",
          "الإيصالات: فاتورة ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى",
          "وسائل الدفع: مدى وSTC Pay وApple Pay إلى جانب النقد والبطاقة",
        ],
        note: "تساعدك هذه المزايا على إعداد إيصالات متوافقة، لكنها ليست استشارة ضريبية. تحقق من نسبة الضريبة الحالية ومعاملة أصنافك مع هيئة الزكاة والضريبة والجمارك أو مستشار ضريبي قبل التشغيل.",
      },
      limits: {
        title: "غير مشمول",
        points: [
          "المرحلة الثانية من الفوترة الإلكترونية (الربط مع منصة فاتورة: فواتير XML والختم التشفيري والاعتماد والإبلاغ) غير مطبقة، وعلى المطاعم المشمولة بها إضافة حل معتمد.",
          "لا يوجد ربط مع بوابات الدفع؛ تتم عمليات مدى وSTC Pay وApple Pay على جهازك ويسجّلها الموظف.",
          "تُطبع الفاتورة ثنائية اللغة ورمز QR من المتصفح؛ أما الطباعة الحرارية المباشرة بنظام ESC/POS فلا تتضمن الحروف العربية ولا رمز QR الخاص بالهيئة.",
          "تُعرض التواريخ بالتقويم الميلادي وبالأرقام اللاتينية، ولا يُعرض التاريخ الهجري.",
        ],
      },
      faq: [
        {
          q: "هل Ahemad's Restro متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك؟",
          a: "يغطي المرحلة الأولى (الإصدار): الإيصالات المدفوعة في فرع يستخدم ضريبة القيمة المضافة السعودية مع رقم ضريبي هي فواتير ضريبية مبسطة ثنائية اللغة مع رمز QR المطلوب. أما المرحلة الثانية (الربط مع منصة فاتورة) فغير مشمولة، ويحتاج المطعم الملزم بها إلى حل معتمد إضافي.",
        },
        {
          q: "هل يقبل الدفع بمدى؟",
          a: "يسجّل الموظف دفعات مدى في نقطة البيع بعد موافقة جهاز مدى. والبرنامج غير مرتبط ببوابة دفع أو بنك محصّل.",
        },
        {
          q: "هل أسعار القائمة شاملة للضريبة؟",
          a: "نعم افتراضيًا، لأن أسعار المستهلك في السعودية يجب أن تشمل الضريبة. ويمكن للفرع التحويل إلى أسعار غير شاملة، ويحتفظ كل صنف بنسبته الخاصة.",
        },
        {
          q: "هل يمكن أن يعمل الموظفون بالعربية والمدير بالإنجليزية؟",
          a: "نعم. تُختار اللغة على كل شاشة، فيعمل الكاشير بالعربية بينما يراجع المدير التقارير بالإنجليزية. والفاتورة الضريبية المبسطة ثنائية اللغة دائمًا.",
        },
        {
          q: "ما الطابعة المناسبة للفواتير في السعودية؟",
          a: "اطبع الفاتورة الضريبية المبسطة من المتصفح على أي طابعة إيصالات أو طابعة مكتبية يتعامل معها الجهاز؛ فهذه الطريقة تطبع النص العربي ورمز QR الخاص بالهيئة، بخلاف الطباعة الحرارية المباشرة بنظام ESC/POS.",
        },
        {
          q: "هل هذه استشارة ضريبية؟",
          a: "لا. يطبّق البرنامج الإعدادات التي تختارها. تحقق من تسجيلك في ضريبة القيمة المضافة والنسب والتزامات الفوترة مع الهيئة أو مستشار ضريبي مؤهل.",
        },
      ],
      cta: {
        title: "شاهد إعدادًا سعوديًا بقائمة مطعمك",
        body: "اطلب عرضًا تجريبيًا وسيتواصل معك فريق Wem Studios ليعرض لك الشاشات العربية والأسعار الشاملة للضريبة والفاتورة الضريبية المبسطة بأصنافك.",
      },
      image: {
        src: "/images/product/screens/receipt-ar.png",
        alt: "فاتورة ضريبية مبسطة ثنائية اللغة مع الرقم الضريبي للبائع ومبلغ الضريبة ورمز QR الخاص بالهيئة",
      },
    },
  },
};
