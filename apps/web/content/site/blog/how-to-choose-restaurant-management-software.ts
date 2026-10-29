import type { Article } from "./types";

// Buyer's guide. Product statements are limited to what the repository
// implements (see content/site/home.ts and docs/cloudflare/FEATURE-CHECKLIST.md),
// including the limits: no ZATCA Phase 2, no offline mode, USB printing not
// available in the cloud edition.

export const howToChooseRestaurantManagementSoftware: Article = {
  slug: "how-to-choose-restaurant-management-software",
  published: "2026-10-29",
  locales: ["en", "ar"],
  relatedSolutions: ["restaurant-management-software", "restaurant-pos-software", "multi-branch-restaurant-management"],
  copy: {
    en: {
      title: "How to Choose Restaurant Management Software: A Practical Buyer's Guide",
      description:
        "A vendor-neutral checklist for choosing restaurant management software: what to test, the questions to ask, data ownership, language and tax fit, hardware and the real total cost.",
      keywords: [
        "restaurant management software",
        "how to choose restaurant software",
        "restaurant software buying guide",
        "restaurant POS checklist",
        "restaurant software features",
      ],
      minutes: 7,
      body: [
        {
          type: "p",
          text: "Few restaurants choose software at a calm moment. Usually the old system is failing, a new branch is about to open, or the accountant has finally refused to reconcile another month of handwritten bills. That pressure makes it easy to pick whichever demo looked smoothest. This guide is the checklist we would want any owner to use — whichever vendor they end up with, including us.",
        },
        { type: "h2", text: "Start with how your restaurant actually works" },
        {
          type: "p",
          text: "Before you watch a single demo, write down an ordinary day in your restaurant. It takes an hour and it will save you from buying features you never use while missing the one you need every evening.",
        },
        {
          type: "ul",
          items: [
            "Order types: dine-in, takeaway, delivery, table QR ordering, a self-service kiosk, phone orders.",
            "Peak load: how many orders arrive in your busiest hour, and how many people are taking them.",
            "Who touches the system: cashiers, waiters, kitchen staff, managers, the owner, the accountant.",
            "Branches: one location today, or several within the next two years.",
            "Languages: the language your staff read best, and the language your guests expect on menus and receipts.",
            "Tax: your tax regime, whether menu prices include tax, and any e-invoicing rules you must follow.",
          ],
        },
        {
          type: "p",
          text: "Then write down two or three \"hard moments\" from real service: a table of eight splitting the bill four ways, a delivery order with a changed item and a coupon, a dish that runs out halfway through dinner. Ask every vendor to perform exactly those moments in their demo. A system that handles your hard moments will handle the easy ones.",
        },
        { type: "h2", text: "The capability checklist" },
        { type: "h3", text: "Front of house" },
        {
          type: "ul",
          items: [
            "A point of sale that is fast with your real menu: modifiers, combos, half portions, notes to the kitchen.",
            "Split bills and split payments, including part cash and part card.",
            "A table plan with live status, table merges, reservations and a waitlist if you seat guests.",
            "All your order types in one place, so takeaway and delivery do not live in a separate tool.",
          ],
        },
        { type: "h3", text: "Kitchen" },
        {
          type: "ul",
          items: [
            "A kitchen display system or printed tickets — or both — with orders routed to the right station.",
            "Modifiers and notes that are impossible to miss on the ticket.",
            "Timers that show which orders are waiting too long.",
          ],
        },
        { type: "h3", text: "Guest ordering" },
        {
          type: "ul",
          items: [
            "Table QR ordering that sends orders to the kitchen and lets guests call a waiter or ask for the bill.",
            "A kiosk mode if you serve walk-up customers.",
            "For orders from outside the restaurant, a way for staff to accept or decline them before cooking starts.",
          ],
        },
        { type: "h3", text: "Back office" },
        {
          type: "ul",
          items: [
            "Menu management with photos, availability switches and a tax rate per item.",
            "Inventory linked to recipes if food cost matters to you, with low-stock alerts and purchasing.",
            "Staff management: roles, shifts and attendance.",
            "Reports you can filter by branch, date, item and staff member, and export.",
          ],
        },
        { type: "h3", text: "Control and security" },
        {
          type: "ul",
          items: [
            "Roles and permissions, so a cashier cannot give discounts or issue refunds without a manager.",
            "An audit log that records who voided, refunded or changed what.",
            "Two-factor sign-in for owners and managers, and quick PIN switching on shared terminals.",
          ],
        },
        { type: "h2", text: "Questions to ask every vendor" },
        {
          type: "ol",
          items: [
            "What happens when the internet connection drops in the middle of service? Ask them to show you, not tell you.",
            "Who calculates the bill — the device or the server? Can a staff member type in a different tax amount?",
            "How are voids, refunds and discounts recorded, and who is allowed to do each one?",
            "Which of the features in this demo are included in the plan you are quoting me?",
            "What does onboarding include: menu setup, table plan, printer setup, staff training?",
            "How are updates released, and could the screens change during a busy evening?",
            "What does support look like at nine o'clock on a Friday night?",
            "Can I speak to the person who would actually set us up?",
          ],
        },
        { type: "h2", text: "Data ownership and exports" },
        {
          type: "p",
          text: "Your sales history, customer list, recipes and supplier prices are business assets. Treat them that way before you sign, not when you want to leave.",
        },
        {
          type: "ul",
          items: [
            "Can you export your data yourself, at any time, in formats your accountant can open?",
            "What happens to your data at the end of the contract, and for how long can you still download it?",
            "Is there an API or webhooks if you later want to connect accounting, delivery or other systems?",
            "Where is the data hosted, and who at the vendor can see it?",
          ],
        },
        {
          type: "p",
          text: "To use our own product as an example: Ahemad's Restro exports reports to CSV, Excel and PDF, offers an integration API and webhooks, and is built on an open-source project licensed under AGPL-3.0, so the code that handles your data is not a black box. Whatever you choose, get the answers to these questions in writing.",
        },
        { type: "h2", text: "Language and tax fit" },
        {
          type: "p",
          text: "If your team or your guests read Arabic, test the whole workflow in Arabic, not just the menu screen. Check that the layout truly runs right to left, that printed receipts use a legible Arabic font, and that item names mixing Arabic and English display cleanly. Each staff member should be able to choose their own language.",
        },
        {
          type: "p",
          text: "Tax deserves the same scrutiny. In Saudi Arabia you need VAT-inclusive menu prices and simplified tax invoices that carry the QR code from ZATCA's e-invoicing Phase 1; ask separately about Phase 2, which requires integration with ZATCA's FATOORA platform. In India you will want GST settings that match your registration and receipts that split CGST and SGST where required. Be wary of vague answers. For the record, Ahemad's Restro prints Phase 1 simplified tax invoices but does not include Phase 2 integration — a restaurant that falls under Phase 2 needs a separate solution for that part.",
        },
        { type: "h2", text: "Hardware: use what works, test what you buy" },
        {
          type: "p",
          text: "Browser-based systems run on tablets, desktop computers and phones you may already own. The details that cause trouble are usually printers, cash drawers and the kitchen screen.",
        },
        {
          type: "ul",
          items: [
            "Ask exactly which receipt and kitchen printers are supported and how they connect. Cloud systems often print through the browser or through network printers; direct USB printing is not always possible.",
            "Check the kitchen screen size, viewing distance and how it will be mounted away from heat and steam.",
            "Walk the restaurant with a phone and check Wi-Fi coverage at the counter, in the kitchen and at the furthest table.",
            "Confirm with your bank or payment provider how card terminals will work alongside the system.",
          ],
        },
        { type: "h2", text: "Total cost, not just the monthly price" },
        {
          type: "ul",
          items: [
            "Subscription fees per branch or per device.",
            "Onboarding, menu setup and training.",
            "Hardware: tablets, screens, printers, stands, network equipment.",
            "Card terminal fees, which come from your payment provider, not the software.",
            "Integrations or customisation you will need in the first year.",
            "Staff time to learn the system, and the cost of a bad first week.",
          ],
        },
        {
          type: "p",
          text: "Ask for a written quote that lists what is included and what is extra. A low monthly fee with paid onboarding, paid reports and paid support can cost more than a higher all-inclusive price.",
        },
        { type: "h2", text: "Run a real trial before you commit" },
        {
          type: "ol",
          items: [
            "Load part of your real menu, with your real modifiers and prices.",
            "Act out your hard moments with the people who will use the system every day — a cashier, a waiter and a cook.",
            "Print receipts and show them to your accountant.",
            "Export a report and open it in the tools you already use.",
            "If you serve Arabic-speaking guests or staff, repeat the whole test in Arabic.",
          ],
        },
        { type: "h2", text: "Red flags" },
        {
          type: "ul",
          items: [
            "The vendor cannot give you a written list of what your plan includes.",
            "There is no way to export your own data, or it costs extra.",
            "Vague answers about where your data is stored.",
            "A demo built entirely from slides, with no live system.",
            "Pressure to sign today to keep a discount.",
          ],
        },
        {
          type: "p",
          text: "The right system is the one your team can use on a busy night without thinking about it, that keeps your numbers honest, and that you could leave with your data intact. Everything else is detail.",
        },
      ],
      cta: {
        title: "Bring your hard moments to a live demo",
        body: "Send us your menu and the service situations that trip up your current system. Wem Studios will walk through them in Ahemad's Restro — and tell you plainly where it is not a fit.",
      },
    },
    ar: {
      title: "كيف تختار برنامج إدارة المطاعم المناسب؟ دليل عملي قبل الشراء",
      description:
        "قائمة تحقق محايدة لاختيار برنامج إدارة المطاعم: ما الذي تختبره، والأسئلة التي تطرحها على المزوّد، وملكية البيانات، وملاءمة اللغة والضريبة، والأجهزة، والتكلفة الفعلية.",
      keywords: [
        "برنامج إدارة المطاعم",
        "اختيار برنامج مطاعم",
        "نظام إدارة المطاعم",
        "نظام نقاط البيع للمطاعم",
        "مميزات برنامج المطاعم",
      ],
      minutes: 6,
      body: [
        {
          type: "p",
          text: "قلّما يختار صاحب المطعم برنامجه وهو في وقت مريح؛ فغالبًا يكون النظام القديم قد بدأ يتعطل، أو هناك فرع جديد على وشك الافتتاح، أو المحاسب لم يعد يحتمل مطابقة شهر آخر من الفواتير اليدوية. هذا الضغط يدفع إلى اختيار العرض التجريبي الأكثر لمعانًا. في هذا الدليل نضع قائمة التحقق التي نتمنى أن يستخدمها كل صاحب مطعم، أيًّا كان المزوّد الذي سيختاره في النهاية، ونحن منهم.",
        },
        { type: "h2", text: "ابدأ من طريقة عمل مطعمك الفعلية" },
        {
          type: "p",
          text: "قبل أن تشاهد أي عرض، اكتب كيف يمر يوم عادي في مطعمك. ستستغرق ساعة واحدة، لكنها تحميك من شراء مزايا لن تستخدمها وتفويت الميزة التي تحتاجها كل ليلة.",
        },
        {
          type: "ul",
          items: [
            "أنواع الطلبات: محلي، سفري، توصيل، طلب من الطاولة عبر رمز QR، كشك خدمة ذاتية، طلبات هاتفية.",
            "وقت الذروة: كم طلبًا يصلك في أكثر ساعة ازدحامًا، وكم شخصًا يستقبلها.",
            "من يستخدم النظام: الكاشير، والمباشرون، وفريق المطبخ، والمدير، والمالك، والمحاسب.",
            "الفروع: فرع واحد اليوم، أم عدة فروع خلال السنتين القادمتين.",
            "اللغة: اللغة التي يقرؤها فريقك بسهولة، واللغة التي يتوقعها ضيوفك في القائمة والفاتورة.",
            "الضريبة: هل أسعار القائمة شاملة للضريبة؟ وما متطلبات الفوترة الإلكترونية التي تلتزم بها؟",
          ],
        },
        {
          type: "p",
          text: "ثم اكتب موقفين أو ثلاثة من «المواقف الصعبة» في الخدمة الحقيقية: طاولة من ثمانية أشخاص يريدون تقسيم الحساب على أربع، أو طلب توصيل فيه تعديل على صنف مع كوبون خصم، أو طبق ينفد في منتصف وقت العشاء. اطلب من كل مزوّد أن ينفذ هذه المواقف بعينها أمامك. النظام الذي يتعامل مع مواقفك الصعبة سيتعامل مع السهلة دون عناء.",
        },
        { type: "h2", text: "قائمة المزايا التي تتحقق منها" },
        { type: "h3", text: "الصالة والكاشير" },
        {
          type: "ul",
          items: [
            "نقطة بيع سريعة مع قائمتك الحقيقية: الإضافات، والوجبات المجمّعة، وأنصاف الحصص، والملاحظات للمطبخ.",
            "تقسيم الفاتورة وتقسيم الدفع، مثل جزء نقدًا وجزء بالبطاقة.",
            "مخطط طاولات يوضح الحالة لحظيًا، مع دمج الطاولات والحجوزات وقائمة الانتظار إن كنت تستقبل ضيوفًا في الصالة.",
            "جميع أنواع الطلبات في مكان واحد، بدل أن يكون السفري والتوصيل في أداة منفصلة.",
          ],
        },
        { type: "h3", text: "المطبخ" },
        {
          type: "ul",
          items: [
            "شاشة مطبخ أو تذاكر مطبوعة، أو الاثنتان معًا، مع توجيه كل صنف إلى المحطة الصحيحة.",
            "إضافات وملاحظات واضحة لا يمكن أن تفوت الطاهي.",
            "مؤقتات تُظهر الطلبات التي تأخرت أكثر من اللازم.",
          ],
        },
        { type: "h3", text: "طلبات الضيوف" },
        {
          type: "ul",
          items: [
            "طلب من الطاولة عبر رمز QR يصل إلى المطبخ مباشرة، ويتيح للضيف استدعاء النادل أو طلب الفاتورة.",
            "وضع كشك للخدمة الذاتية إن كان لديك زبائن يطلبون من الكاونتر.",
            "للطلبات القادمة من خارج المطعم: إمكانية أن يقبلها الموظف أو يرفضها قبل بدء التحضير.",
          ],
        },
        { type: "h3", text: "الإدارة" },
        {
          type: "ul",
          items: [
            "إدارة القائمة بالصور ومفاتيح التوفر ونسبة ضريبة لكل صنف.",
            "مخزون مرتبط بالوصفات إن كانت تكلفة الطعام تهمك، مع تنبيهات النقص وإدارة المشتريات.",
            "إدارة الموظفين: الأدوار والمناوبات والحضور.",
            "تقارير يمكن تصفيتها حسب الفرع والتاريخ والصنف والموظف وتصديرها.",
          ],
        },
        { type: "h3", text: "الرقابة والأمان" },
        {
          type: "ul",
          items: [
            "أدوار وصلاحيات تمنع الكاشير من منح خصم أو استرداد مبلغ دون موافقة المدير.",
            "سجل تدقيق يوضح من ألغى أو استرد أو عدّل وماذا عدّل.",
            "تحقق بخطوتين للمالك والمديرين، وتبديل سريع برمز PIN على الأجهزة المشتركة.",
          ],
        },
        { type: "h2", text: "أسئلة اطرحها على كل مزوّد" },
        {
          type: "ol",
          items: [
            "ماذا يحدث إذا انقطع الإنترنت في منتصف الخدمة؟ اطلب أن يُريك ذلك عمليًا لا أن يشرحه.",
            "من يحسب الفاتورة: الجهاز أم الخادم؟ وهل يستطيع الموظف كتابة مبلغ ضريبة مختلف بيده؟",
            "كيف تُسجّل عمليات الإلغاء والاسترداد والخصم، ومن المسموح له بكل منها؟",
            "أي من المزايا التي رأيتها في العرض مشمولة فعلًا في الباقة المعروضة عليّ؟",
            "ماذا يشمل الإعداد: إدخال القائمة، ومخطط الطاولات، وتجهيز الطابعات، وتدريب الموظفين؟",
            "كيف تصدر التحديثات؟ وهل يمكن أن تتغير الشاشات في ليلة مزدحمة؟",
            "كيف يكون الدعم الساعة التاسعة مساء الخميس؟",
            "هل يمكنني التحدث مع الشخص الذي سيتولى الإعداد فعليًا؟",
          ],
        },
        { type: "h2", text: "ملكية البيانات وتصديرها" },
        {
          type: "p",
          text: "سجل مبيعاتك وقائمة عملائك ووصفاتك وأسعار مورديك أصول تجارية. تعامل معها بهذه الجدية قبل التوقيع، لا عندما تقرر المغادرة.",
        },
        {
          type: "ul",
          items: [
            "هل تستطيع تصدير بياناتك بنفسك في أي وقت وبصيغ يفتحها محاسبك؟",
            "ماذا يحدث لبياناتك عند انتهاء العقد، وكم من الوقت يبقى لك لتنزيلها؟",
            "هل توجد واجهة برمجية (API) أو Webhooks إن أردت لاحقًا ربط المحاسبة أو التوصيل أو أنظمة أخرى؟",
            "أين تُستضاف البيانات، ومن لدى المزوّد يستطيع الاطلاع عليها؟",
          ],
        },
        {
          type: "p",
          text: "وعلى سبيل المثال من منتجنا: يصدّر Ahemad's Restro التقارير بصيغ CSV وExcel وPDF، ويوفر واجهة تكامل برمجية وWebhooks، وهو مبني على مشروع مفتوح المصدر برخصة AGPL-3.0، فالشيفرة التي تتعامل مع بياناتك ليست صندوقًا مغلقًا. وأيًّا كان اختيارك، احصل على إجابات هذه الأسئلة مكتوبة.",
        },
        { type: "h2", text: "ملاءمة اللغة والضريبة" },
        {
          type: "p",
          text: "إذا كان فريقك أو ضيوفك يقرؤون العربية، فاختبر سير العمل كاملًا بالعربية، لا شاشة القائمة وحدها. تأكد أن الواجهة تعمل فعلًا من اليمين إلى اليسار، وأن الإيصال المطبوع بخط عربي واضح، وأن أسماء الأصناف التي تجمع العربية والإنجليزية تظهر بشكل سليم، وأن كل موظف يستطيع اختيار لغته بنفسه.",
        },
        {
          type: "p",
          text: "والضريبة تستحق التدقيق نفسه. في السعودية تحتاج إلى أسعار شاملة لضريبة القيمة المضافة، وفواتير ضريبية مبسطة تحمل رمز QR الخاص بالمرحلة الأولى من الفوترة الإلكترونية لدى هيئة الزكاة والضريبة والجمارك. واسأل بشكل منفصل عن المرحلة الثانية التي تتطلب الربط مع منصة «فاتورة». ولا تقبل الإجابات المبهمة. وللوضوح: يطبع Ahemad's Restro الفواتير الضريبية المبسطة للمرحلة الأولى، لكنه لا يشمل الربط الخاص بالمرحلة الثانية؛ فالمطعم الخاضع لها يحتاج إلى حل منفصل لهذا الجزء.",
        },
        { type: "h2", text: "الأجهزة: استخدم ما يعمل واختبر ما ستشتريه" },
        {
          type: "p",
          text: "الأنظمة التي تعمل عبر المتصفح تشتغل على الأجهزة اللوحية والحواسيب والجوالات التي قد تملكها أصلًا. والمشكلات تظهر عادةً في الطابعات ودرج النقود وشاشة المطبخ.",
        },
        {
          type: "ul",
          items: [
            "اسأل بالتحديد عن طابعات الإيصالات والمطبخ المدعومة وطريقة توصيلها؛ فالأنظمة السحابية تطبع غالبًا عبر المتصفح أو طابعات الشبكة، والطباعة المباشرة عبر USB ليست ممكنة دائمًا.",
            "تحقق من حجم شاشة المطبخ ومسافة الرؤية وطريقة تثبيتها بعيدًا عن الحرارة والبخار.",
            "تجوّل في المطعم بجوالك وتحقق من قوة الواي فاي عند الكاشير وفي المطبخ وعند أبعد طاولة.",
            "تأكد مع البنك أو مزوّد الدفع من طريقة عمل أجهزة الشبكة (مدى) جنبًا إلى جنب مع النظام.",
          ],
        },
        { type: "h2", text: "التكلفة الكاملة لا الاشتراك الشهري فقط" },
        {
          type: "ul",
          items: [
            "رسوم الاشتراك لكل فرع أو لكل جهاز.",
            "الإعداد وإدخال القائمة والتدريب.",
            "الأجهزة: أجهزة لوحية، شاشات، طابعات، حوامل، معدات شبكة.",
            "رسوم أجهزة الدفع، وهي من مزوّد الدفع لا من البرنامج.",
            "التكاملات أو التخصيص الذي ستحتاجه في السنة الأولى.",
            "وقت الموظفين في التعلّم، وتكلفة أسبوع أول متعثر.",
          ],
        },
        {
          type: "p",
          text: "اطلب عرض سعر مكتوبًا يوضح ما هو مشمول وما هو إضافي. فالاشتراك الشهري المنخفض مع إعداد مدفوع وتقارير مدفوعة ودعم مدفوع قد يكلفك أكثر من سعر أعلى يشمل كل شيء.",
        },
        { type: "h2", text: "جرّب فعليًا قبل الالتزام" },
        {
          type: "ol",
          items: [
            "أدخل جزءًا من قائمتك الحقيقية بإضافاتها وأسعارها الفعلية.",
            "نفّذ مواقفك الصعبة مع من سيستخدم النظام يوميًا: كاشير ومباشر وطاهٍ.",
            "اطبع إيصالات واعرضها على محاسبك.",
            "صدّر تقريرًا وافتحه في الأدوات التي تستخدمها حاليًا.",
            "إذا كان ضيوفك أو فريقك يتحدثون العربية، فأعد الاختبار كله بالعربية.",
          ],
        },
        { type: "h2", text: "علامات تستدعي الحذر" },
        {
          type: "ul",
          items: [
            "المزوّد لا يستطيع أن يعطيك قائمة مكتوبة بما تشمله باقتك.",
            "لا توجد طريقة لتصدير بياناتك، أو أن التصدير برسوم إضافية.",
            "إجابات غامضة عن مكان تخزين بياناتك.",
            "عرض تجريبي قائم على شرائح فقط دون نظام فعلي.",
            "الضغط عليك للتوقيع اليوم حتى لا يضيع الخصم.",
          ],
        },
        {
          type: "p",
          text: "النظام المناسب هو الذي يستخدمه فريقك في ليلة مزدحمة دون أن يفكر فيه، ويحافظ على دقة أرقامك، وتستطيع مغادرته وبياناتك كاملة معك. وما عدا ذلك تفاصيل.",
        },
      ],
      cta: {
        title: "اعرض مواقفك الصعبة في عرض تجريبي مباشر",
        body: "أرسل لنا قائمتك والمواقف التي تُربك نظامك الحالي، وسيستعرضها فريق Wem Studios معك في Ahemad's Restro، وسيخبرك بوضوح إن كان هناك ما لا يناسبك.",
      },
    },
  },
};
