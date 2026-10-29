import type { Article } from "./types";

// How table QR ordering works. Product behaviour described here is taken from
// apps/api/src/modules/public (per-table qrToken, orders added to the open tab,
// WAITER/BILL requests, server-side pricing), TablesService.rotateQrToken, the
// kiosk (docs/KIOSK-AND-KDS.md) and OrdersService (acceptance gate only for
// integration orders unless the branch auto-confirms). No payment gateway.

export const howQrOrderingWorksInRestaurants: Article = {
  slug: "how-qr-ordering-works-in-restaurants",
  published: "2026-10-29",
  locales: ["en", "ar"],
  relatedSolutions: ["qr-ordering-system", "kitchen-display-system", "restaurant-pos-software"],
  copy: {
    en: {
      title: "How QR Ordering Works in Restaurants: From Table Scan to Kitchen",
      description:
        "What happens between a guest scanning a table QR code and the dish reaching the kitchen — the guest experience, kitchen flow, staff checks and the pitfalls to avoid.",
      keywords: [
        "QR code ordering system",
        "QR ordering for restaurants",
        "table QR ordering",
        "contactless ordering restaurant",
        "QR menu ordering",
      ],
      minutes: 6,
      body: [
        {
          type: "p",
          text: "A QR code on a restaurant table looks simple: scan, order, eat. Behind it is a chain of small decisions about menus, prices, kitchen tickets and staff responsibilities. When any link in that chain is weak, guests get confused and the kitchen gets surprises. This guide walks through the whole journey and the practical choices that make it work.",
        },
        { type: "h2", text: "QR menu, QR ordering and QR payment are different things" },
        {
          type: "p",
          text: "A QR code is only a link. What matters is what the link opens. Restaurants usually mean one of three things:",
        },
        {
          type: "ul",
          items: [
            "QR menu: the guest views the menu on their phone, then orders from a waiter as usual.",
            "QR ordering: the guest places the order from their phone and it goes into the restaurant's system and to the kitchen.",
            "QR payment: the guest pays the bill on their phone, which requires a connection to a payment provider.",
          ],
        },
        {
          type: "p",
          text: "This guide is about QR ordering at the table, which changes the most about how service runs.",
        },
        { type: "h2", text: "Step by step: what happens after the scan" },
        {
          type: "ol",
          items: [
            "Each table has its own code. The code contains a unique link tied to that table, so the system knows where the order comes from without the guest typing a table number.",
            "The menu opens in the phone's browser. No app download or account is needed, and the menu should show current prices, photos, options and only the items that are available right now.",
            "The guest builds the order, choosing sizes, extras and other options. Required choices, such as a cooking level, should be enforced before the order can be sent.",
            "The order is sent and the server recalculates it. Prices, tax and totals must be calculated by the restaurant's system, never trusted from the phone.",
            "The order reaches the kitchen within moments — on a kitchen display or printer — split by station, with the table number on every ticket.",
            "The guest can follow the order, add another round to the same tab later, call a waiter or ask for the bill from the same page.",
            "Payment is taken, usually by staff at the table or counter, and recorded against the order.",
          ],
        },
        { type: "h2", text: "How it works in Ahemad's Restro" },
        {
          type: "p",
          text: "To make this concrete, here is how our own product handles it. Each table gets its own QR code from table management. The guest page works in Arabic or English. A second order from the same table is added to the table's open tab rather than opening a separate bill. \"Call waiter\" and \"Bring the bill\" requests appear live for staff who manage tables, and new orders appear on the kitchen display straight away. The server recalculates every price and tax amount, so a guest's phone can never change what is charged.",
        },
        {
          type: "p",
          text: "For walk-up customers there is a self-service kiosk mode: the guest chooses eat-in or take-away, orders, and receives an order number; payment is taken at the counter. What it does not do is take payment on the guest's phone — there is no payment gateway built in. Staff record the payment after the card terminal or wallet approves it.",
        },
        { type: "h2", text: "The guest experience: what makes guests use it" },
        {
          type: "ul",
          items: [
            "The menu loads quickly on mobile data, without a login or app download.",
            "Item names are clear in the languages your guests read, with photos for dishes people do not know.",
            "Options are grouped and explained: \"Choose your bread\" is better than a long list of add-ons.",
            "The call-waiter and bill buttons are easy to find, so guests do not feel abandoned.",
            "Staff still greet the table and explain the code. QR ordering works best as an option, not a wall between guests and people.",
          ],
        },
        { type: "h2", text: "The kitchen side" },
        {
          type: "p",
          text: "QR ordering means more orders reach the kitchen without a waiter reading them first. That puts more weight on the ticket itself. Modifiers must be impossible to miss, notes must be short and readable, and items must be routed to the right station — grill, cold kitchen, drinks — so no one has to re-sort tickets by hand.",
        },
        {
          type: "p",
          text: "Guests also order differently. Some order drinks first and food ten minutes later; some order everything at once. A kitchen display that shows each round as it arrives, with timers that turn amber and red when tickets age, helps the team pace a table without a waiter relaying messages.",
        },
        { type: "h2", text: "Staff acceptance: who checks the order?" },
        {
          type: "p",
          text: "There are two sensible models. For guests physically seated at a table, orders can go straight to the kitchen: the risk is low, and speed is the point. For orders from outside the restaurant — your own website or a partner channel — a staff member should accept or decline the order before cooking starts, unless you deliberately choose auto-confirmation.",
        },
        {
          type: "p",
          text: "Ahemad's Restro follows this split. Table QR and kiosk orders go straight to the kitchen display. Orders that arrive from outside through the integration API wait for a staff member to accept or decline them, unless the branch is set to confirm them automatically.",
        },
        {
          type: "p",
          text: "QR ordering does not remove waiters. It moves them from writing orders to looking after tables: answering questions, recommending dishes, checking on allergies and clearing plates.",
        },
        { type: "h2", text: "Pitfalls and how to avoid them" },
        { type: "h3", text: "Printed codes that never change" },
        {
          type: "p",
          text: "A photo of a table's QR code can be shared, which in theory lets someone send orders to that table from outside. Watch for orders on empty tables, and replace codes when you suspect misuse or redo your table cards. In Ahemad's Restro a table's code can be regenerated, which stops the old one working immediately — so plan cards that are easy to reprint and swap.",
        },
        { type: "h3", text: "Weak Wi-Fi and mobile signal" },
        {
          type: "p",
          text: "Guests order on their own phones. Restaurants in basements, malls and thick-walled buildings often have poor signal. Either offer guest Wi-Fi with the network name and password printed next to the code, or test signal at every table before launch. Your own POS and kitchen screens also need a stable connection, ideally on a network separate from guest Wi-Fi.",
        },
        { type: "h3", text: "A menu that does not match the kitchen" },
        {
          type: "p",
          text: "When a dish runs out, mark it unavailable at once. On paper menus a waiter can apologise; on a phone the guest has already ordered and is waiting.",
        },
        { type: "h3", text: "Codes on the wrong table" },
        {
          type: "p",
          text: "Tables get moved, merged and renumbered. A card on the wrong table sends food to the wrong guests. Make checking the cards part of the opening routine.",
        },
        { type: "h3", text: "Unclear payment" },
        {
          type: "p",
          text: "Tell guests on the card how they will pay: at the table with a waiter, or at the counter. Uncertainty about the bill is the most common reason guests wave staff over anyway.",
        },
        { type: "h3", text: "Guests who do not want to use a phone" },
        {
          type: "p",
          text: "Keep printed menus and let staff take orders at the POS as before. A good system puts QR and staff orders into the same tab for the table.",
        },
        { type: "h2", text: "A simple rollout checklist" },
        {
          type: "ol",
          items: [
            "Tidy the menu: photos, clear names in each language, sensible option groups and correct availability.",
            "Create your tables in the system and print one code per table.",
            "Scan every code from its own table and place a test order.",
            "Brief the team on who watches for new orders, waiter calls and bill requests.",
            "Start with one section or one service period before rolling out everywhere.",
            "Review the first week's orders for mistakes, confusing items and slow tickets, then adjust.",
          ],
        },
        {
          type: "p",
          text: "Done well, QR ordering shortens the wait for the first order, reduces mistakes from misheard requests and frees staff for hospitality. Done carelessly, it moves the confusion from the waiter's notepad to the guest's phone. The difference is almost entirely in the preparation.",
        },
      ],
      cta: {
        title: "Watch a QR order reach the kitchen",
        body: "In a demo, scan a table code with your own phone, place an order and see it appear on the kitchen display. Wem Studios can set it up with a few dishes from your real menu.",
      },
    },
    ar: {
      title: "كيف يعمل الطلب عبر رمز QR في المطاعم؟ من مسح الرمز حتى المطبخ",
      description:
        "ماذا يحدث بين مسح الضيف لرمز QR على الطاولة ووصول الطلب إلى المطبخ: تجربة الضيف، وسير العمل في المطبخ، ودور الموظفين، والأخطاء التي يجب تجنبها.",
      keywords: [
        "الطلب عبر رمز QR",
        "نظام طلبات المطاعم QR",
        "منيو QR للمطاعم",
        "الطلب من الطاولة",
        "قائمة طعام إلكترونية",
      ],
      minutes: 6,
      body: [
        {
          type: "p",
          text: "يبدو رمز QR على طاولة المطعم أمرًا بسيطًا: يمسحه الضيف، ويطلب، ويأكل. لكن خلفه سلسلة من القرارات الصغيرة تخص القائمة والأسعار وتذاكر المطبخ ومسؤوليات الموظفين، وإذا ضعفت حلقة واحدة منها ارتبك الضيف وتفاجأ المطبخ. في هذا الدليل نمر على الرحلة كاملة وعلى الخيارات العملية التي تنجحها.",
        },
        { type: "h2", text: "منيو QR والطلب عبر QR والدفع عبر QR ليست شيئًا واحدًا" },
        {
          type: "p",
          text: "رمز QR مجرد رابط، والمهم هو ما يفتحه هذا الرابط. وعادةً تقصد المطاعم واحدًا من ثلاثة أمور:",
        },
        {
          type: "ul",
          items: [
            "منيو QR: يتصفح الضيف القائمة على جواله ثم يطلب من المباشر كالمعتاد.",
            "الطلب عبر QR: يرسل الضيف طلبه من جواله فيدخل نظام المطعم ويصل إلى المطبخ.",
            "الدفع عبر QR: يدفع الضيف الفاتورة من جواله، وهذا يتطلب ربطًا مع مزوّد دفع.",
          ],
        },
        {
          type: "p",
          text: "يتناول هذا الدليل الطلب من الطاولة عبر QR، وهو الأكثر تأثيرًا في طريقة سير الخدمة.",
        },
        { type: "h2", text: "خطوة بخطوة: ماذا يحدث بعد المسح؟" },
        {
          type: "ol",
          items: [
            "لكل طاولة رمزها الخاص، ويحمل رابطًا فريدًا مرتبطًا بها، فيعرف النظام مصدر الطلب دون أن يكتب الضيف رقم الطاولة.",
            "تفتح القائمة في متصفح الجوال دون تنزيل تطبيق أو إنشاء حساب، ويجب أن تعرض الأسعار الحالية والصور والخيارات والأصناف المتوفرة الآن فقط.",
            "يجهّز الضيف طلبه ويختار الحجم والإضافات والخيارات، ويجب ألا يُرسل الطلب قبل إكمال الخيارات الإلزامية مثل درجة الاستواء.",
            "يُرسل الطلب ويعيد الخادم احتسابه؛ فالأسعار والضريبة والإجمالي يحسبها نظام المطعم ولا تُؤخذ من الجوال.",
            "يصل الطلب إلى المطبخ خلال لحظات، على شاشة المطبخ أو الطابعة، مقسمًا حسب المحطات، ورقم الطاولة على كل تذكرة.",
            "يتابع الضيف حالة طلبه، ويضيف لاحقًا طلبًا آخر إلى الحساب نفسه، ويستدعي النادل أو يطلب الفاتورة من الصفحة نفسها.",
            "يُستلم الدفع، غالبًا عن طريق الموظف على الطاولة أو عند الكاشير، ويُسجّل على الطلب.",
          ],
        },
        { type: "h2", text: "كيف يعمل ذلك في Ahemad's Restro" },
        {
          type: "p",
          text: "لتوضيح الصورة، هذا ما يفعله منتجنا: لكل طاولة رمز QR خاص بها يُنشأ من إدارة الطاولات، وصفحة الضيف تعمل بالعربية أو الإنجليزية. وإذا طلبت الطاولة مرة ثانية يُضاف الطلب إلى حسابها المفتوح بدل فتح فاتورة جديدة. وتظهر طلبات «استدعاء النادل» و«إحضار الفاتورة» فورًا للموظفين المسؤولين عن الطاولات، وتظهر الطلبات الجديدة على شاشة المطبخ مباشرة. والخادم يعيد احتساب كل سعر وكل مبلغ ضريبة، فلا يستطيع جوال الضيف تغيير المبلغ المستحق.",
        },
        {
          type: "p",
          text: "وللزبائن الذين يطلبون من الكاونتر يوجد وضع كشك الخدمة الذاتية: يختار الضيف «محلي» أو «سفري»، ويطلب، ويحصل على رقم طلب، ثم يدفع عند الكاشير. أما ما لا يفعله النظام فهو استلام الدفع على جوال الضيف؛ إذ لا توجد بوابة دفع مدمجة، ويسجّل الموظف الدفع بعد موافقة جهاز الشبكة أو المحفظة.",
        },
        { type: "h2", text: "تجربة الضيف: ما الذي يجعله يستخدمه فعلًا؟" },
        {
          type: "ul",
          items: [
            "قائمة تفتح بسرعة على بيانات الجوال، دون تسجيل دخول أو تطبيق.",
            "أسماء أصناف واضحة باللغات التي يقرؤها ضيوفك، مع صور للأطباق غير المألوفة.",
            "خيارات مرتبة ومفهومة؛ فعبارة «اختر نوع الخبز» أوضح من قائمة طويلة من الإضافات.",
            "زر استدعاء النادل وزر الفاتورة ظاهران، حتى لا يشعر الضيف بأنه متروك وحده.",
            "الموظف ما زال يرحب بالضيوف ويشرح الرمز؛ فالطلب عبر QR أنجح حين يكون خيارًا إضافيًا لا حاجزًا بين الضيف والفريق.",
          ],
        },
        { type: "h2", text: "من جهة المطبخ" },
        {
          type: "p",
          text: "الطلب عبر QR يعني أن طلبات أكثر تصل إلى المطبخ دون أن يقرأها مباشر قبله، وهذا يزيد أهمية التذكرة نفسها: الإضافات يجب أن تكون واضحة، والملاحظات قصيرة ومقروءة، وكل صنف يذهب إلى محطته الصحيحة، كالشواية والمقبلات الباردة والمشروبات، حتى لا يعيد أحد ترتيب التذاكر يدويًا.",
        },
        {
          type: "p",
          text: "والضيوف كذلك يطلبون بطرق مختلفة؛ بعضهم يطلب المشروبات أولًا ثم الطعام بعد عشر دقائق، وبعضهم يطلب كل شيء دفعة واحدة. وشاشة المطبخ التي تعرض كل دفعة عند وصولها، مع مؤقتات يتغير لونها عند تأخر التذكرة، تساعد الفريق على ضبط إيقاع الطاولة دون أن ينقل المباشر الرسائل ذهابًا وإيابًا.",
        },
        { type: "h2", text: "قبول الطلب: من يراجعه؟" },
        {
          type: "p",
          text: "هناك نموذجان منطقيان. الضيف الجالس فعلًا على الطاولة يمكن أن يذهب طلبه مباشرة إلى المطبخ؛ فالمخاطرة قليلة والسرعة هي الهدف. أما الطلبات القادمة من خارج المطعم، مثل موقعك الإلكتروني أو قناة شريكة، فالأفضل أن يقبلها موظف أو يرفضها قبل بدء التحضير، إلا إذا اخترت عمدًا التأكيد التلقائي.",
        },
        {
          type: "p",
          text: "ويتبع Ahemad's Restro هذا التقسيم: طلبات QR من الطاولة وطلبات الكشك تذهب مباشرة إلى شاشة المطبخ، أما الطلبات القادمة من الخارج عبر واجهة التكامل البرمجية فتنتظر قبول الموظف أو رفضه، ما لم يكن الفرع مضبوطًا على التأكيد التلقائي.",
        },
        {
          type: "p",
          text: "والطلب عبر QR لا يلغي دور المباشرين، بل ينقلهم من كتابة الطلبات إلى خدمة الطاولات: الإجابة عن الأسئلة، واقتراح الأطباق، والتأكد من الحساسية الغذائية، ورفع الأطباق.",
        },
        { type: "h2", text: "أخطاء شائعة وكيف تتجنبها" },
        { type: "h3", text: "رموز مطبوعة لا تتغير أبدًا" },
        {
          type: "p",
          text: "صورة رمز الطاولة يمكن أن تُتداول، ونظريًا قد يرسل أحدهم طلبات إلى تلك الطاولة من خارج المطعم. انتبه للطلبات على طاولات فارغة، وغيّر الرموز إذا اشتبهت في إساءة استخدام أو عند تجديد بطاقات الطاولات. في Ahemad's Restro يمكن إعادة توليد رمز الطاولة فيتوقف الرمز القديم فورًا، لذا اختر بطاقات يسهل طباعتها واستبدالها.",
        },
        { type: "h3", text: "ضعف الواي فاي وتغطية الجوال" },
        {
          type: "p",
          text: "يطلب الضيوف من جوالاتهم، والمطاعم في الأدوار السفلية والمراكز التجارية والمباني ذات الجدران السميكة كثيرًا ما تعاني من ضعف التغطية. إما أن توفر واي فاي للضيوف مع كتابة اسم الشبكة وكلمة المرور بجانب الرمز، أو تختبر التغطية عند كل طاولة قبل الإطلاق. وأجهزة الكاشير وشاشات المطبخ تحتاج كذلك إلى اتصال مستقر، ويُفضّل أن تكون على شبكة منفصلة عن شبكة الضيوف.",
        },
        { type: "h3", text: "قائمة لا تطابق المطبخ" },
        {
          type: "p",
          text: "إذا نفد طبق فأوقف توفره فورًا. في القائمة الورقية يستطيع المباشر الاعتذار، أما على الجوال فالضيف قد طلب وينتظر.",
        },
        { type: "h3", text: "رمز على الطاولة الخطأ" },
        {
          type: "p",
          text: "الطاولات تُنقل وتُدمج ويتغير ترقيمها، وبطاقة على طاولة خطأ تعني طعامًا يذهب لضيوف آخرين. اجعل التحقق من البطاقات جزءًا من روتين الافتتاح.",
        },
        { type: "h3", text: "طريقة دفع غير واضحة" },
        {
          type: "p",
          text: "اكتب على البطاقة كيف سيدفع الضيف: على الطاولة مع المباشر أو عند الكاشير. فالغموض حول الفاتورة هو أكثر ما يجعل الضيف ينادي الموظف رغم وجود الرمز.",
        },
        { type: "h3", text: "ضيوف لا يرغبون في استخدام الجوال" },
        {
          type: "p",
          text: "احتفظ بقوائم مطبوعة، ودع الموظفين يسجلون الطلبات من نقطة البيع كالمعتاد. والنظام الجيد يجمع طلبات QR وطلبات الموظفين في حساب الطاولة نفسه.",
        },
        { type: "h2", text: "قائمة تحقق مختصرة للإطلاق" },
        {
          type: "ol",
          items: [
            "رتّب القائمة: صور، وأسماء واضحة بكل لغة، ومجموعات خيارات منطقية، وتوفر صحيح.",
            "أنشئ الطاولات في النظام واطبع رمزًا واحدًا لكل طاولة.",
            "امسح كل رمز من طاولته وأرسل طلبًا تجريبيًا.",
            "حدد للفريق من يتابع الطلبات الجديدة واستدعاءات النادل وطلبات الفاتورة.",
            "ابدأ بقسم واحد أو فترة خدمة واحدة قبل التعميم.",
            "راجع طلبات الأسبوع الأول بحثًا عن الأخطاء والأصناف المربكة والتذاكر البطيئة، ثم عدّل.",
          ],
        },
        {
          type: "p",
          text: "إذا نُفذ الطلب عبر QR بإتقان، فإنه يختصر انتظار الطلب الأول، ويقلل الأخطاء الناتجة عن سوء السماع، ويفرّغ الفريق للضيافة. وإذا نُفذ بإهمال، فإنه ينقل الارتباك من دفتر المباشر إلى جوال الضيف. والفرق كله تقريبًا في التحضير.",
        },
      ],
      cta: {
        title: "شاهد طلب QR يصل إلى المطبخ",
        body: "في العرض التجريبي امسح رمز طاولة بجوالك، وأرسل طلبًا، وشاهده يظهر على شاشة المطبخ. ويمكن لفريق Wem Studios تجهيزه ببعض الأطباق من قائمتك الحقيقية.",
      },
    },
  },
};
