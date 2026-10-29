import type { SolutionPage } from "./types";

// "How do bills work" intent: tax maths, discounts, tips, split and partial
// payments, refunds, receipts and cash close. Order-taking speed belongs to
// restaurant-pos-software.
export const restaurantBillingSoftware: SolutionPage = {
  slug: "restaurant-billing-software",
  locales: ["en", "ar"],
  related: ["restaurant-pos-software", "restaurant-software-saudi-arabia", "restaurant-software-india", "restaurant-management-software"],
  copy: {
    en: {
      metaTitle: "Restaurant Billing Software with VAT & GST | Ahemad's Restro",
      metaDescription:
        "Restaurant billing with server-calculated VAT or GST, discounts, tips, split and part payments, refunds, cash close and printed receipts. Request a demo now.",
      keywords: [
        "restaurant billing software",
        "restaurant billing system",
        "restaurant invoice software",
        "billing software for restaurants with VAT",
        "restaurant bill splitting",
      ],
      navLabel: "Restaurant billing software",
      h1: "Restaurant billing software that gets every bill right",
      intro:
        "Ahemad's Restro calculates every bill on the server: item prices, tax, discounts, tips and delivery fees. Guests can pay together, separately or in parts, and paid bills are corrected with refunds, never edited.",
      problem: {
        title: "Where restaurant bills go wrong",
        paragraphs: [
          "Most billing mistakes come from the same few places: a discount applied after tax instead of before, a tip that ends up being taxed, a table that pays in three parts and leaves the till short, or a paid bill quietly edited to fix an error. Each one is small, but together they make the tax report and the cash count disagree.",
          "Good restaurant billing software makes those mistakes hard. The amounts come from one calculation that every screen shares, discounts reduce the taxable value correctly, every payment and refund is a separate record with a method and a name, and the end-of-day cash close shows any difference before the drawer is locked.",
        ],
      },
      capabilities: {
        title: "How billing works",
        items: [
          { icon: "billing", title: "Bills calculated on the server", body: "Prices, tax and totals are worked out by the server with the same engine for the POS, QR orders and the kiosk; a device can never send its own tax amount." },
          { icon: "currency", title: "VAT or GST, inclusive or exclusive", body: "Each branch picks its tax regime and whether menu prices include tax. Rates are set per item, so zero-rated items are possible; tips and delivery fees stay outside the taxable amount." },
          { icon: "offers", title: "Discounts, coupons and promotions", body: "Percentage or flat discounts for roles allowed to give them, coupon codes, automatic promotions such as happy hours, loyalty points and gift cards, with discounts reducing the taxable value pro rata." },
          { icon: "pos", title: "Split bills and part payments", body: "Split a bill equally between guests or take part payments by cash, card, mada, STC Pay, Apple Pay, UPI and more; the balance stays due and the table stays open." },
          { icon: "tables", title: "Bills before payment", body: "Print a bill for the guest without charging anything, edit open bills, move a bill to another table or merge two tables' bills." },
          { icon: "orders", title: "Refunds instead of edits", body: "Paid bills are locked. Issue a full or partial refund with a method and reason, and record which units went back into stock." },
          { icon: "language", title: "Receipts for your market", body: "Receipts in English or Arabic, bilingual simplified tax invoices with the ZATCA Phase 1 QR code in Saudi Arabia, and a CGST/SGST split with the GSTIN in India." },
          { icon: "reports", title: "Cash close and tax summary", body: "Close the day with opening float, expected and counted cash and the over or short amount, then review taxable value by rate, payment methods and discounts in reports." },
        ],
      },
      limits: {
        title: "What billing does not do",
        points: [
          "No payment gateway: payments are recorded by staff after the terminal or wallet approves them.",
          "ZATCA Phase 2 (FATOORA clearance and reporting) and India GST e-invoicing (IRN) are not included.",
          "Direct ESC/POS thermal receipts print in the printer's own character set, without Arabic text or the ZATCA QR; use browser printing for those.",
          "There is no separate service-charge line; tips are entered at checkout.",
        ],
      },
      faq: [
        {
          q: "How is VAT calculated on a restaurant bill?",
          a: "Each item carries its own tax rate. With tax-inclusive prices the tax is extracted from the price; with tax-exclusive prices it is added. Discounts reduce the taxable value proportionally, while tips and delivery fees are outside it. The calculation always runs on the server.",
        },
        {
          q: "Can one table pay with different payment methods?",
          a: "Yes. Record as many part payments as needed, each with its own method, for example one guest by mada and another in cash. The bill shows what has been paid so far and what is still due.",
        },
        {
          q: "How do refunds work?",
          a: "Paid bills cannot be edited. Instead you issue a refund for the full amount or part of it, choose the refund method, add a reason, and enter any units that physically came back and can go back into stock.",
        },
        {
          q: "Can I print the bill before the guest pays?",
          a: "Yes. Printing the bill charges nothing and leaves the table open. In Saudi Arabia this provisional bill does not carry the ZATCA QR code; the simplified tax invoice is printed once the bill is paid.",
        },
        {
          q: "Does it produce ZATCA-compliant invoices?",
          a: "For branches using the Saudi VAT setting with a VAT number, paid receipts are bilingual simplified tax invoices with the ZATCA Phase 1 QR code. Phase 2 integration with FATOORA is not included. Confirm your obligations with ZATCA or a tax adviser.",
        },
        {
          q: "How do I check the cash drawer at the end of the day?",
          a: "Use cash close: enter the opening float and the counted cash, and the system shows the expected amount from cash sales, cash refunds and cash expenses, plus any amount over or short.",
        },
      ],
      cta: {
        title: "Check your billing rules in a live demo",
        body: "Tell us how you price, discount and split bills. Wem Studios will contact you and walk through the same cases in Ahemad's Restro.",
      },
      image: {
        src: "/images/product/screens/receipt-en.webp",
        alt: "Printed restaurant receipt with items, VAT, total and the ZATCA QR code",
      },
    },
    ar: {
      metaTitle: "برنامج فواتير المطاعم مع الضريبة | Ahemad's Restro",
      metaDescription:
        "برنامج فواتير المطاعم يحسب ضريبة القيمة المضافة على الخادم مع الخصومات والإكراميات وتقسيم الفاتورة والدفع الجزئي والاسترداد وإقفال الصندوق. اطلب عرضًا تجريبيًا.",
      keywords: [
        "برنامج فواتير المطاعم",
        "نظام فواتير المطاعم",
        "برنامج فواتير ضريبية للمطاعم",
        "تقسيم الفاتورة في المطعم",
        "فاتورة ضريبية مبسطة للمطاعم",
      ],
      navLabel: "برنامج فواتير المطاعم",
      h1: "برنامج فواتير المطاعم الذي يضبط كل فاتورة",
      intro:
        "يحسب Ahemad's Restro كل فاتورة على الخادم: أسعار الأصناف والضريبة والخصومات والإكراميات ورسوم التوصيل. ويستطيع الضيوف الدفع معًا أو كلٌّ على حدة أو على دفعات، وتُصحَّح الفواتير المدفوعة بالاسترداد لا بالتعديل.",
      problem: {
        title: "أين تخطئ فواتير المطاعم عادةً؟",
        paragraphs: [
          "تأتي معظم أخطاء الفواتير من مواضع متكررة: خصم يُطبَّق بعد الضريبة بدل قبلها، أو إكرامية تُحتسب عليها ضريبة، أو طاولة تدفع على ثلاث دفعات فينقص الصندوق، أو فاتورة مدفوعة تُعدَّل بصمت لتصحيح خطأ. كل خطأ صغير وحده، لكنها معًا تجعل تقرير الضريبة وجرد النقد غير متطابقين.",
          "برنامج الفواتير الجيد يصعّب وقوع هذه الأخطاء: المبالغ تأتي من حساب واحد تشترك فيه كل الشاشات، والخصم يخفّض القيمة الخاضعة للضريبة بالشكل الصحيح، وكل دفعة واسترداد سجل مستقل بوسيلته واسم الموظف، وإقفال الصندوق في نهاية اليوم يُظهر أي فرق قبل إغلاق الدرج.",
        ],
      },
      capabilities: {
        title: "كيف تعمل الفواتير",
        items: [
          { icon: "billing", title: "فواتير يحسبها الخادم", body: "تُحسب الأسعار والضريبة والإجمالي على الخادم بالمحرك نفسه لنقطة البيع وطلبات QR والكشك، ولا يمكن لأي جهاز إرسال مبلغ ضريبة من عنده." },
          { icon: "currency", title: "ضريبة شاملة أو مضافة", body: "يختار كل فرع نظامه الضريبي وهل تشمل الأسعار الضريبة. النسبة تُحدَّد لكل صنف فيمكن وجود أصناف بنسبة صفرية، وتبقى الإكراميات ورسوم التوصيل خارج المبلغ الخاضع للضريبة." },
          { icon: "offers", title: "الخصومات والكوبونات والعروض", body: "خصم بنسبة أو بمبلغ ثابت للأدوار المصرّح لها، وكوبونات، وعروض تلقائية مثل الساعات السعيدة، ونقاط الولاء وبطاقات الهدايا، مع تخفيض القيمة الخاضعة للضريبة بالتناسب." },
          { icon: "pos", title: "تقسيم الفاتورة والدفع الجزئي", body: "قسّم الفاتورة بالتساوي أو سجّل دفعات جزئية نقدًا أو بالبطاقة أو مدى أو STC Pay أو Apple Pay وغيرها، ويبقى المتبقي مستحقًا والطاولة مفتوحة." },
          { icon: "tables", title: "الفاتورة قبل الدفع", body: "اطبع الفاتورة للضيف دون أي تحصيل، وعدّل الفواتير المفتوحة، وانقل الفاتورة إلى طاولة أخرى أو ادمج فاتورتي طاولتين." },
          { icon: "orders", title: "استرداد بدل التعديل", body: "الفواتير المدفوعة مقفلة. أصدر استردادًا كاملًا أو جزئيًا مع الوسيلة والسبب، وسجّل الكميات التي عادت إلى المخزون." },
          { icon: "language", title: "إيصالات تناسب السوق السعودي", body: "إيصالات بالعربية أو الإنجليزية، وفاتورة ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى من هيئة الزكاة والضريبة والجمارك لفروع السعودية." },
          { icon: "reports", title: "إقفال الصندوق وملخص الضريبة", body: "أقفل اليوم برصيد الافتتاح والنقد المتوقع والنقد المعدود ومقدار الزيادة أو العجز، ثم راجع القيمة الخاضعة للضريبة حسب النسبة ووسائل الدفع والخصومات في التقارير." },
        ],
      },
      limits: {
        title: "ما لا تشمله الفواتير",
        points: [
          "لا يوجد ربط مع بوابة دفع؛ يسجّل الموظف الدفعة بعد موافقة جهاز الشبكة أو المحفظة.",
          "المرحلة الثانية من الفوترة الإلكترونية (الربط والاعتماد عبر منصة فاتورة) غير مشمولة.",
          "الإيصالات الحرارية المطبوعة مباشرة بنظام ESC/POS تستخدم خط الطابعة فلا تتضمن النص العربي ولا رمز QR الخاص بالهيئة؛ اطبعها من المتصفح.",
          "لا يوجد بند مستقل لرسوم الخدمة؛ تُسجَّل الإكرامية عند الدفع.",
        ],
      },
      faq: [
        {
          q: "كيف تُحسب ضريبة القيمة المضافة على فاتورة المطعم؟",
          a: "لكل صنف نسبة ضريبة خاصة به. إذا كانت الأسعار شاملة للضريبة تُستخرج الضريبة من السعر، وإذا كانت غير شاملة تُضاف إليه. والخصومات تخفّض القيمة الخاضعة للضريبة بالتناسب، أما الإكراميات ورسوم التوصيل فخارجها. ويجري الحساب دائمًا على الخادم.",
        },
        {
          q: "هل يمكن لطاولة واحدة الدفع بأكثر من وسيلة؟",
          a: "نعم. سجّل ما تحتاجه من دفعات جزئية، لكل منها وسيلتها، كأن يدفع ضيف بمدى وآخر نقدًا. وتعرض الفاتورة المبلغ المدفوع حتى الآن والمتبقي.",
        },
        {
          q: "كيف يتم الاسترداد؟",
          a: "لا يمكن تعديل الفاتورة المدفوعة. بدلًا من ذلك تُصدر استردادًا للمبلغ كاملًا أو لجزء منه، وتختار وسيلة الاسترداد، وتضيف السبب، وتسجّل الكميات التي عادت فعلًا ويمكن إرجاعها إلى المخزون.",
        },
        {
          q: "هل يمكن طباعة الفاتورة قبل أن يدفع الضيف؟",
          a: "نعم. طباعة الفاتورة لا تحصّل شيئًا وتبقى الطاولة مفتوحة. وهذه الفاتورة المبدئية لا تحمل رمز QR الخاص بالهيئة، إذ تُطبع الفاتورة الضريبية المبسطة بعد السداد.",
        },
        {
          q: "هل تتوافق الفواتير مع متطلبات هيئة الزكاة والضريبة والجمارك؟",
          a: "في الفروع التي تستخدم إعداد ضريبة القيمة المضافة السعودية مع رقم ضريبي، يكون الإيصال المدفوع فاتورة ضريبية مبسطة ثنائية اللغة مع رمز QR للمرحلة الأولى. أما المرحلة الثانية (الربط مع منصة فاتورة) فغير مشمولة. تحقق من التزاماتك مع الهيئة أو مستشار ضريبي.",
        },
        {
          q: "كيف أطابق درج النقد في نهاية اليوم؟",
          a: "استخدم إقفال الصندوق: أدخل رصيد الافتتاح والنقد المعدود، فيعرض النظام المبلغ المتوقع من المبيعات النقدية والاستردادات والمصروفات النقدية، ومقدار الزيادة أو العجز.",
        },
      ],
      cta: {
        title: "راجع طريقة فوترتك في عرض مباشر",
        body: "أخبرنا كيف تسعّر وتخصم وتقسّم الفواتير، وسيتواصل معك فريق Wem Studios ليجرب الحالات نفسها معك على Ahemad's Restro.",
      },
      image: {
        src: "/images/product/screens/receipt-ar.webp",
        alt: "إيصال مطعم مطبوع بالعربية مع الأصناف وضريبة القيمة المضافة والإجمالي ورمز QR الخاص بالهيئة",
      },
    },
  },
};
