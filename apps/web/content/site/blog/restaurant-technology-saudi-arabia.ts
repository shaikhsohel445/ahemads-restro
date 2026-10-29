import type { Article } from "./types";

// Saudi Arabia guide, dated "as of October 2026". Regulatory facts are kept to
// well-established, publicly documented points (15% VAT since July 2020; ZATCA
// e-invoicing Phase 1 from December 2021 and Phase 2 rolled out in waves from
// January 2023). No market statistics. Product statements follow
// docs/cloudflare/SAUDI-LOCALIZATION.md, including that Phase 2 is not included
// and that payments are recorded by staff (no gateway).

export const restaurantTechnologySaudiArabia: Article = {
  slug: "restaurant-technology-saudi-arabia",
  published: "2026-10-29",
  locales: ["en", "ar"],
  relatedSolutions: ["restaurant-software-saudi-arabia", "arabic-restaurant-software", "restaurant-billing-software"],
  copy: {
    en: {
      title: "Restaurant Technology in Saudi Arabia: Arabic, VAT, E-Invoicing and Payments",
      description:
        "A practical guide for Saudi restaurants, as of October 2026: Arabic interfaces, VAT-inclusive pricing, simplified tax invoices, ZATCA Phase 1 and 2, and payments.",
      keywords: [
        "restaurant software Saudi Arabia",
        "restaurant POS Saudi Arabia",
        "ZATCA e-invoicing restaurants",
        "simplified tax invoice QR code",
        "Arabic restaurant software",
        "mada payments restaurant",
      ],
      minutes: 7,
      body: [
        {
          type: "note",
          text: "Written as of October 2026. This article is general information, not tax or legal advice. Rules and deadlines change: confirm your obligations with the Zakat, Tax and Customs Authority (ZATCA) or a qualified adviser before relying on any system.",
        },
        {
          type: "p",
          text: "Restaurant software built for other markets often arrives in Saudi Arabia with an Arabic translation added at the end. That is rarely enough. A restaurant here needs a system that is comfortable in Arabic, calculates VAT the way Saudi consumers see prices, prints invoices that follow ZATCA's e-invoicing rules, and records the payment methods guests actually use. This guide walks through each area and the questions worth asking.",
        },
        { type: "h2", text: "Arabic and right-to-left: more than a translated menu" },
        {
          type: "p",
          text: "Many restaurant teams in the Kingdom are multinational, and guests may prefer Arabic or English. The system should serve both without compromise. When you evaluate software, check the following:",
        },
        {
          type: "ul",
          items: [
            "The entire interface switches to Arabic and mirrors to right-to-left — menus, tables, forms and reports, not only the ordering screen.",
            "Each staff member can choose their own language, so an Arabic-speaking cashier and an English-speaking kitchen manager can work in the same system.",
            "Printed receipts use a clear Arabic font that stays legible on a thermal printer.",
            "Order numbers, phone numbers and amounts display correctly inside Arabic sentences instead of jumping around.",
            "Menu items can carry both names, for example \"كبسة دجاج — Chicken Kabsa\", and both display cleanly.",
            "Guest-facing screens such as QR ordering and kiosks open in Arabic with an easy switch to English.",
          ],
        },
        {
          type: "p",
          text: "The quickest test: switch the system to Arabic, take a complete order from start to finish, print the receipt and open a sales report. Anything that falls back to English or breaks the layout will show up in ten minutes.",
        },
        { type: "h2", text: "VAT-inclusive pricing" },
        {
          type: "p",
          text: "The standard VAT rate in Saudi Arabia has been 15% since July 2020, and prices shown to consumers must include VAT. In practice that means your menu says 23 SAR, and the system works out the VAT inside that price — 20 SAR plus 3 SAR VAT — rather than adding tax on top at the till.",
        },
        {
          type: "ul",
          items: [
            "The system should calculate VAT on the server, from the inclusive price, so no one can type a tax amount by hand.",
            "It should support a different rate per item in case any item is treated differently.",
            "Discounts should reduce the taxable amount correctly, not just the total.",
            "Ask your adviser how service charges, tips and delivery fees should be treated, and check the system can match that.",
            "VAT registration numbers in Saudi Arabia have 15 digits and start and end with 3; a system that warns about a mistyped number saves an awkward correction later.",
          ],
        },
        { type: "h2", text: "Simplified tax invoices and the Phase 1 QR code" },
        {
          type: "p",
          text: "ZATCA's e-invoicing programme, known as FATOORA, began with Phase 1, the generation phase, on 4 December 2021. Since then, VAT-registered businesses must issue invoices electronically through a compliant solution. For restaurants, most sales to consumers are documented with a simplified tax invoice, and that invoice must carry a QR code.",
        },
        {
          type: "p",
          text: "The Phase 1 QR code encodes five pieces of information: the seller's name, the VAT registration number, the date and time of the invoice, the invoice total including VAT, and the VAT amount. Saudi VAT rules also require tax invoices to be in Arabic; another language may appear alongside it. When you check a system's receipt, look for:",
        },
        {
          type: "ul",
          items: [
            "the title \"Simplified Tax Invoice\" in Arabic (فاتورة ضريبية مبسطة), with English beside it if you want a bilingual receipt;",
            "your VAT number and legal name exactly as registered;",
            "a QR code that a scanner decodes into the five fields above;",
            "no QR code on provisional bills printed before payment, so only final invoices carry it.",
          ],
        },
        { type: "h2", text: "Phase 2: integration with FATOORA" },
        {
          type: "p",
          text: "Phase 2, the integration phase, has been rolled out in waves since 1 January 2023. ZATCA selects taxpayers for each wave and notifies them in advance. Being in Phase 2 means much more than a QR code on a receipt. Each invoice must be produced as a structured XML file (UBL 2.1), signed with a cryptographic stamp using a certificate issued by ZATCA, linked to the previous invoice through a hash chain, and shared with ZATCA's platform: standard tax invoices for business customers are cleared before they are issued, and simplified invoices are reported within the deadline ZATCA sets. The software, or each device, also has to be onboarded with ZATCA.",
        },
        {
          type: "p",
          text: "For a restaurant choosing software, the practical questions are:",
        },
        {
          type: "ol",
          items: [
            "Have you received a Phase 2 notification from ZATCA, and what is your deadline?",
            "Does the system handle Phase 2 itself, through a partner, or not at all?",
            "If it is through a partner, who is responsible for onboarding, certificates and support when an invoice is rejected?",
            "What happens to invoices issued while the connection to ZATCA is down?",
          ],
        },
        {
          type: "p",
          text: "To be clear about our own product: Ahemad's Restro prints bilingual simplified tax invoices with the Phase 1 QR code for Saudi branches that have a VAT number, but it does not include Phase 2 integration. A restaurant that is subject to Phase 2 needs a separate integration or a certified provider for that part before relying on the system for compliant invoicing.",
        },
        { type: "h2", text: "Payment methods guests expect" },
        {
          type: "p",
          text: "Card and contactless payments are part of everyday dining in the Kingdom. Guests expect to pay with mada, the national debit card network, with international credit cards, and with phone wallets such as Apple Pay and STC Pay. Cash still has a place, especially at counters. Brand names and acceptance terms change, so confirm the current options with your bank or payment provider.",
        },
        {
          type: "p",
          text: "Card terminals come from your acquiring bank or payment provider, not from the restaurant software. There are two common set-ups. In a standalone set-up, the cashier enters the amount on the terminal and records the payment method in the POS. In an integrated set-up, the POS sends the amount to the terminal automatically, which requires a supported integration between the two.",
        },
        {
          type: "p",
          text: "Either way, record each method separately — mada, credit card, Apple Pay, STC Pay, cash — so that your daily report can be matched against the settlement report from your provider. Ahemad's Restro records mada, STC Pay and Apple Pay as payment methods alongside cash, card and bank transfer; staff record the payment after the terminal or wallet approves it. It does not include a payment gateway.",
        },
        { type: "h2", text: "Other things to plan for" },
        {
          type: "ul",
          items: [
            "Time zone: Saudi Arabia uses Arabia Standard Time (UTC+3) with no daylight saving. Make sure reports use Riyadh time even if your cloud servers or your accountant are elsewhere.",
            "Working week: the weekend is Friday and Saturday, so schedules and staff rosters should follow that week.",
            "Ramadan: opening hours, menus and kitchen rhythm change around iftar and suhoor. A system where you can switch items and categories on and off quickly makes the month easier.",
            "Menu information: the Saudi Food and Drug Authority (SFDA) has rules on information such as calories shown on menus. Check the current requirements and keep that data in one place so printed and digital menus agree.",
            "Delivery apps: ask whether orders from the delivery platforms you use can flow into the same system, and how — through a direct integration, an API, or re-entry by hand.",
            "Personal data: the Saudi Personal Data Protection Law (PDPL) is in force. Ask vendors where data is hosted, who can access it and how you can export or delete it.",
            "Connectivity: a cloud system needs a reliable connection. Consider a backup mobile connection for the counter, and a written routine for taking orders if it fails.",
          ],
        },
        { type: "h2", text: "A short checklist before you sign" },
        {
          type: "ol",
          items: [
            "Run a full order in Arabic, from POS to kitchen to receipt.",
            "Print a simplified tax invoice and scan its QR code.",
            "Check how VAT is shown on a discounted order.",
            "Ask for the vendor's Phase 2 position in writing.",
            "Record a mada payment and an Apple Pay payment, then find them in the daily report.",
            "Confirm where your data is hosted and how you can export it.",
          ],
        },
        {
          type: "p",
          text: "None of these checks takes long, and together they will tell you more about a system's fit for Saudi Arabia than any feature list.",
        },
      ],
      cta: {
        title: "See Arabic receipts and VAT invoices in a demo",
        body: "Wem Studios can show you the full Arabic interface, a VAT-inclusive menu and a printed simplified tax invoice with the Phase 1 QR code — and talk through what Phase 2 would require for your business.",
      },
    },
    ar: {
      title: "التقنية في المطاعم السعودية: العربية والضريبة والفوترة الإلكترونية والدفع",
      description:
        "دليل عملي للمطاعم السعودية حتى أكتوبر 2026: الواجهة العربية، والأسعار الشاملة للضريبة، والفاتورة المبسطة، ومرحلتا الفوترة الإلكترونية، وطرق الدفع.",
      keywords: [
        "برنامج مطاعم في السعودية",
        "نظام كاشير مطاعم",
        "الفوترة الإلكترونية للمطاعم",
        "الفاتورة الضريبية المبسطة",
        "نظام مطاعم عربي",
        "الدفع عبر مدى",
      ],
      minutes: 6,
      body: [
        {
          type: "note",
          text: "كُتب هذا المقال حتى أكتوبر 2026، وهو معلومات عامة وليس استشارة ضريبية أو نظامية. الأنظمة والمواعيد تتغير، فتحقق من التزاماتك مع هيئة الزكاة والضريبة والجمارك أو مستشار مؤهل قبل الاعتماد على أي نظام.",
        },
        {
          type: "p",
          text: "كثير من برامج المطاعم المصممة لأسواق أخرى تصل إلى السعودية وقد أُضيفت إليها الترجمة العربية في آخر خطوة، وهذا نادرًا ما يكفي. المطعم هنا يحتاج إلى نظام مريح بالعربية، يحسب ضريبة القيمة المضافة بالطريقة التي يرى بها المستهلك الأسعار، ويطبع فواتير تتوافق مع متطلبات الفوترة الإلكترونية، ويسجّل طرق الدفع التي يستخدمها الضيوف فعلًا. في هذا الدليل نمر على كل جانب والأسئلة التي تستحق أن تُطرح.",
        },
        { type: "h2", text: "العربية ومن اليمين إلى اليسار: أكثر من قائمة مترجمة" },
        {
          type: "p",
          text: "فرق العمل في كثير من مطاعم المملكة متعددة الجنسيات، والضيوف قد يفضّلون العربية أو الإنجليزية، فيجب أن يخدم النظام اللغتين دون تنازل. عند تقييم أي برنامج تحقق مما يلي:",
        },
        {
          type: "ul",
          items: [
            "الواجهة كلها تتحول إلى العربية وتنعكس من اليمين إلى اليسار: القوائم والطاولات والنماذج والتقارير، لا شاشة الطلب وحدها.",
            "كل موظف يختار لغته بنفسه، فيعمل كاشير يتحدث العربية ومدير مطبخ يفضّل الإنجليزية على النظام نفسه.",
            "الإيصال المطبوع بخط عربي واضح يبقى مقروءًا على الطابعة الحرارية.",
            "أرقام الطلبات والجوالات والمبالغ تظهر في مكانها الصحيح داخل الجملة العربية ولا تتبعثر.",
            "الصنف يحمل الاسمين معًا، مثل «كبسة دجاج — Chicken Kabsa»، ويظهر الاسمان بشكل سليم.",
            "شاشات الضيوف، مثل الطلب عبر QR والكشك، تفتح بالعربية مع زر سهل للتحويل إلى الإنجليزية.",
          ],
        },
        {
          type: "p",
          text: "أسرع اختبار: حوّل النظام إلى العربية، ونفّذ طلبًا كاملًا من البداية إلى النهاية، واطبع الإيصال، وافتح تقرير المبيعات. أي جزء يعود إلى الإنجليزية أو يختل تخطيطه سيظهر خلال عشر دقائق.",
        },
        { type: "h2", text: "الأسعار الشاملة للضريبة" },
        {
          type: "p",
          text: "النسبة الأساسية لضريبة القيمة المضافة في السعودية 15% منذ يوليو 2020، والأسعار المعروضة على المستهلك يجب أن تكون شاملة للضريبة. عمليًا يعني ذلك أن القائمة تقول 23 ريالًا، والنظام يستخرج الضريبة من داخل هذا السعر، أي 20 ريالًا قيمة الصنف و3 ريالات ضريبة، بدل أن يضيفها فوقه عند الكاشير.",
        },
        {
          type: "ul",
          items: [
            "يجب أن يحسب النظام الضريبة على الخادم انطلاقًا من السعر الشامل، فلا يستطيع أحد إدخال مبلغ الضريبة يدويًا.",
            "يجب أن يدعم نسبة مختلفة لكل صنف إن عومل صنف ما معاملة مختلفة.",
            "يجب أن يخفض الخصم المبلغ الخاضع للضريبة بشكل صحيح، لا الإجمالي فقط.",
            "اسأل مستشارك عن معاملة رسوم الخدمة والإكراميات ورسوم التوصيل، وتأكد أن النظام يطابق ذلك.",
            "الرقم الضريبي في السعودية من 15 خانة يبدأ بالرقم 3 وينتهي به، والنظام الذي ينبهك إلى خطأ في إدخاله يوفر عليك تصحيحًا محرجًا لاحقًا.",
          ],
        },
        { type: "h2", text: "الفاتورة الضريبية المبسطة ورمز QR للمرحلة الأولى" },
        {
          type: "p",
          text: "بدأت هيئة الزكاة والضريبة والجمارك برنامج الفوترة الإلكترونية «فاتورة» بالمرحلة الأولى، مرحلة الإصدار، في 4 ديسمبر 2021. ومنذ ذلك الحين يجب على المنشآت المسجلة في ضريبة القيمة المضافة إصدار فواتيرها إلكترونيًا عبر حل متوافق. وفي المطاعم توثَّق معظم المبيعات للمستهلكين بفاتورة ضريبية مبسطة، ويجب أن تحمل هذه الفاتورة رمز QR.",
        },
        {
          type: "p",
          text: "يتضمن رمز QR في المرحلة الأولى خمس معلومات: اسم البائع، والرقم الضريبي، وتاريخ الفاتورة ووقتها، وإجمالي الفاتورة شاملًا الضريبة، ومبلغ الضريبة. كما تشترط أنظمة ضريبة القيمة المضافة أن تكون الفاتورة الضريبية باللغة العربية، ويجوز أن تظهر بجانبها لغة أخرى. وعند فحص إيصال أي نظام ابحث عن:",
        },
        {
          type: "ul",
          items: [
            "عنوان «فاتورة ضريبية مبسطة» بالعربية، وبجانبه الإنجليزية إن أردت إيصالًا ثنائي اللغة؛",
            "رقمك الضريبي واسمك النظامي كما هما في التسجيل تمامًا؛",
            "رمز QR يُقرأ عند مسحه ويعرض المعلومات الخمس المذكورة؛",
            "عدم وجود رمز QR على الفاتورة المبدئية التي تُطبع قبل الدفع، حتى لا يحمله إلا الفاتورة النهائية.",
          ],
        },
        { type: "h2", text: "المرحلة الثانية: الربط والتكامل مع منصة فاتورة" },
        {
          type: "p",
          text: "بدأ تطبيق المرحلة الثانية، مرحلة الربط والتكامل، على دفعات (موجات) منذ 1 يناير 2023، وتختار الهيئة المنشآت المشمولة في كل موجة وتبلغها مسبقًا. والدخول في المرحلة الثانية أكبر بكثير من رمز على الإيصال؛ إذ يجب إصدار كل فاتورة بصيغة XML منظمة (UBL 2.1)، وختمها بختم تشفيري باستخدام شهادة تصدرها الهيئة، وربطها بالفاتورة السابقة عبر سلسلة من قيم التجزئة، ومشاركتها مع منصة الهيئة: الفواتير الضريبية القياسية للمنشآت تُعتمد قبل إصدارها، والفواتير المبسطة يُبلَّغ عنها خلال المهلة التي تحددها الهيئة. كما يجب تسجيل البرنامج أو كل جهاز لدى الهيئة.",
        },
        { type: "p", text: "وللمطعم الذي يختار برنامجًا، الأسئلة العملية هي:" },
        {
          type: "ol",
          items: [
            "هل وصلك إشعار من الهيئة بالدخول في المرحلة الثانية؟ وما الموعد المحدد لك؟",
            "هل يتولى النظام المرحلة الثانية بنفسه، أم عبر شريك، أم لا يدعمها إطلاقًا؟",
            "إن كان عبر شريك، فمن المسؤول عن التسجيل والشهادات والدعم عند رفض فاتورة؟",
            "ماذا يحدث للفواتير الصادرة أثناء انقطاع الاتصال بمنصة الهيئة؟",
          ],
        },
        {
          type: "p",
          text: "وللوضوح بشأن منتجنا: يطبع Ahemad's Restro فواتير ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى للفروع السعودية التي لديها رقم ضريبي، لكنه لا يشمل الربط الخاص بالمرحلة الثانية. والمطعم الخاضع للمرحلة الثانية يحتاج إلى تكامل منفصل أو مزوّد معتمد لهذا الجزء قبل الاعتماد على النظام في الفوترة المتوافقة.",
        },
        { type: "h2", text: "طرق الدفع التي يتوقعها الضيوف" },
        {
          type: "p",
          text: "الدفع بالبطاقات واللمس جزء من تجربة المطاعم اليومية في المملكة. يتوقع الضيف أن يدفع ببطاقة مدى، الشبكة الوطنية لبطاقات الخصم، وبالبطاقات الائتمانية الدولية، وبمحافظ الجوال مثل Apple Pay وSTC Pay، ولا يزال للنقد مكانه خصوصًا عند الكاونتر. وأسماء الخدمات وشروط قبولها تتغير، فتأكد من الخيارات الحالية مع البنك أو مزوّد الدفع.",
        },
        {
          type: "p",
          text: "أجهزة الشبكة تأتي من البنك المحصّل أو مزوّد الدفع، لا من برنامج المطعم. وهناك إعدادان شائعان: في الإعداد المستقل يُدخل الكاشير المبلغ في جهاز الشبكة ثم يسجّل طريقة الدفع في نقطة البيع، وفي الإعداد المتكامل ترسل نقطة البيع المبلغ إلى الجهاز تلقائيًا، وهذا يتطلب تكاملًا مدعومًا بين الطرفين.",
        },
        {
          type: "p",
          text: "وفي الحالتين سجّل كل طريقة دفع على حدة: مدى، والبطاقة الائتمانية، وApple Pay، وSTC Pay، والنقد، حتى تطابق التقرير اليومي مع كشف التسوية من مزوّد الدفع. ويسجّل Ahemad's Restro مدى وSTC Pay وApple Pay طرقًا للدفع إلى جانب النقد والبطاقة والتحويل البنكي، ويسجّل الموظف الدفع بعد موافقة جهاز الشبكة أو المحفظة، ولا يتضمن بوابة دفع.",
        },
        { type: "h2", text: "أمور أخرى تستحق التخطيط" },
        {
          type: "ul",
          items: [
            "التوقيت: تعتمد السعودية توقيت الرياض (UTC+3) دون توقيت صيفي، فتأكد أن التقارير بتوقيت الرياض حتى لو كانت الخوادم أو المحاسب في مكان آخر.",
            "أيام العمل: عطلة نهاية الأسبوع الجمعة والسبت، فيجب أن تتبع الجداول ومناوبات الموظفين هذا الأسبوع.",
            "رمضان: تتغير ساعات العمل والقائمة وإيقاع المطبخ حول الإفطار والسحور، والنظام الذي يتيح إيقاف الأصناف والفئات وتشغيلها بسرعة يسهّل الشهر كثيرًا.",
            "معلومات القائمة: للهيئة العامة للغذاء والدواء متطلبات بشأن معلومات مثل السعرات الحرارية في قوائم الطعام، فتحقق من المتطلبات الحالية واحفظ هذه البيانات في مكان واحد حتى تتطابق القائمة المطبوعة والرقمية.",
            "تطبيقات التوصيل: اسأل إن كانت طلبات المنصات التي تعمل معها يمكن أن تدخل النظام نفسه وكيف: بتكامل مباشر، أم عبر واجهة برمجية، أم بإعادة إدخالها يدويًا.",
            "البيانات الشخصية: نظام حماية البيانات الشخصية نافذ في المملكة، فاسأل المزوّد أين تُستضاف البيانات ومن يطّلع عليها وكيف تصدّرها أو تحذفها.",
            "الاتصال: النظام السحابي يحتاج إلى اتصال موثوق، ففكّر في اتصال جوال احتياطي للكاشير، وإجراء مكتوب لتسجيل الطلبات إذا انقطع.",
          ],
        },
        { type: "h2", text: "قائمة تحقق مختصرة قبل التوقيع" },
        {
          type: "ol",
          items: [
            "نفّذ طلبًا كاملًا بالعربية من نقطة البيع إلى المطبخ إلى الإيصال.",
            "اطبع فاتورة ضريبية مبسطة وامسح رمز QR الخاص بها.",
            "تحقق من طريقة ظهور الضريبة في طلب عليه خصم.",
            "اطلب من المزوّد موقفه من المرحلة الثانية كتابيًا.",
            "سجّل دفعة بمدى وأخرى بـ Apple Pay، ثم ابحث عنهما في التقرير اليومي.",
            "تأكد من مكان استضافة بياناتك وطريقة تصديرها.",
          ],
        },
        {
          type: "p",
          text: "لا يستغرق أي من هذه الاختبارات وقتًا طويلًا، لكنها مجتمعة تخبرك عن ملاءمة النظام للسوق السعودي أكثر مما تخبرك به أي قائمة مزايا.",
        },
      ],
      cta: {
        title: "شاهد الإيصال العربي والفاتورة الضريبية في عرض تجريبي",
        body: "يستطيع فريق Wem Studios أن يعرض لك الواجهة العربية كاملة، وقائمة بأسعار شاملة للضريبة، وفاتورة ضريبية مبسطة مطبوعة مع رمز QR للمرحلة الأولى، وأن يناقش معك ما تتطلبه المرحلة الثانية لمنشأتك.",
      },
    },
  },
};
