import type { SolutionPage } from "./types";

// Restaurant groups and chains: several branches in one account, branch
// access, per-branch settings, stock transfers and the branch overview.
// Limits are spelled out because the product scopes most data per branch.
export const multiBranchRestaurantManagement: SolutionPage = {
  slug: "multi-branch-restaurant-management",
  locales: ["en", "ar"],
  related: ["restaurant-management-software", "restaurant-billing-software", "restaurant-pos-software"],
  copy: {
    en: {
      metaTitle: "Multi-Branch Restaurant Management | Ahemad's Restro",
      metaDescription:
        "Run several restaurant branches from one account: branch access per staff member, per-branch menus and tax, stock transfers and a side-by-side overview.",
      keywords: [
        "multi-branch restaurant management",
        "restaurant chain management software",
        "multi-location restaurant software",
        "restaurant software for multiple branches",
        "central restaurant management system",
      ],
      navLabel: "Multi-branch management",
      h1: "Multi-branch restaurant management from one account",
      intro:
        "Ahemad's Restro keeps every branch in one account and one live database. Staff only see the branches they work at, each branch keeps its own menu and settings, and owners can compare branches and move stock between them.",
      problem: {
        title: "The trouble with one system per branch",
        paragraphs: [
          "When each branch runs its own till and spreadsheets, the owner has to collect numbers from every location before they can compare them. Staff who cover shifts at two branches need two logins, and one branch runs out of an ingredient while another has a full shelf of it.",
          "Multi-branch restaurant management puts the branches side by side. Every branch writes to the same online database, so there is nothing to synchronise at night, and each person's access follows the branches they are assigned to.",
        ],
      },
      capabilities: {
        title: "What multi-branch management covers",
        items: [
          { icon: "branches", title: "All branches in one account", body: "Switch between branches with the branch switcher. Each branch has its own floors and tables, menu and prices, kitchen stations, printers and kiosk." },
          { icon: "staff", title: "Access per branch", body: "Assign each staff member to one or more branches with a role. A cashier at one branch never sees another branch's orders unless you allow it." },
          { icon: "currency", title: "Tax settings per branch", body: "Each branch sets its own tax regime, VAT or GST number, tax-inclusive or exclusive pricing and receipt label." },
          { icon: "inventory", title: "Stock transfers between branches", body: "Move ingredients from one branch to another, with a transfer history showing what moved, where to and when." },
          { icon: "reports", title: "Branch overview", body: "See sales, paid and open orders, inventory value and low-stock items for every branch side by side for any date range." },
          { icon: "dashboard", title: "Dashboards and reports per branch", body: "Each branch has its own dashboard and full report catalogue, and reports can be e-mailed on a schedule per branch." },
          { icon: "realtime", title: "One live database", body: "Every device in every branch works on the same data, so a change in one place appears everywhere within moments, with no sync to run." },
          { icon: "orders", title: "Per-branch order handling", body: "Choose for each branch whether online orders and table bookings are accepted automatically or wait for staff." },
        ],
      },
      limits: {
        title: "How branches are scoped",
        points: [
          "Branches are not created from a screen inside the app yet; Wem Studios adds them to your account.",
          "Each branch keeps its own menu; there is no tool to copy a menu from one branch to another.",
          "Currency and time zone are set once for the whole restaurant, so branches in countries with different currencies need separate accounts.",
          "Standard reports run per branch; the branch overview is the cross-branch comparison.",
        ],
      },
      faq: [
        {
          q: "How many branches can one account have?",
          a: "Your plan and price depend on the number of branches and devices, so tell us your plans when you request a demo.",
        },
        {
          q: "Can a manager see every branch?",
          a: "Yes, if they are assigned to every branch. Owners and managers switch between branches with the branch switcher, and the branch overview compares them side by side.",
        },
        {
          q: "Can each branch have different menu prices?",
          a: "Yes. Every branch has its own menu, prices, tax rates and kitchen stations, which suits groups where branches sell different items or charge different prices.",
        },
        {
          q: "Can I move stock from the central kitchen to a branch?",
          a: "Yes. If your central kitchen is set up as a branch, you can transfer ingredients from it to any other branch and keep a history of every transfer.",
        },
        {
          q: "Can branches be in different countries?",
          a: "Tax settings are per branch, so a branch can use its own tax regime. Currency and time zone are shared by the whole account, so branches that need a different currency should run as a separate account.",
        },
      ],
      cta: {
        title: "Plan your branches with us",
        body: "Tell us how many branches you run and how they share stock and staff. Wem Studios will contact you and show how the setup would look in Ahemad's Restro.",
      },
      image: {
        src: "/images/product/screens/reports-en.webp",
        alt: "Reports catalogue with sales, item, staff, tax and inventory reports for the selected branch",
      },
    },
    ar: {
      metaTitle: "إدارة المطاعم متعددة الفروع | Ahemad's Restro",
      metaDescription:
        "أدِر عدة فروع لمطعمك من حساب واحد: صلاحيات الموظفين حسب الفرع، وقائمة وضريبة لكل فرع، ونقل المخزون بين الفروع، ومقارنة أداء الفروع جنبًا إلى جنب.",
      keywords: [
        "إدارة المطاعم متعددة الفروع",
        "برنامج إدارة سلسلة مطاعم",
        "نظام مطاعم متعدد الفروع",
        "برنامج إدارة فروع المطعم",
        "نظام إدارة المطاعم المركزي",
      ],
      navLabel: "إدارة الفروع المتعددة",
      h1: "إدارة المطاعم متعددة الفروع من حساب واحد",
      intro:
        "يجمع Ahemad's Restro كل الفروع في حساب واحد وقاعدة بيانات مباشرة واحدة. لا يرى الموظف إلا الفروع التي يعمل بها، ولكل فرع قائمته وإعداداته، ويستطيع المالك مقارنة الفروع ونقل المخزون بينها.",
      problem: {
        title: "مشكلة النظام المنفصل لكل فرع",
        paragraphs: [
          "عندما يعمل كل فرع بكاشير وجداول بيانات خاصة به، يضطر المالك إلى جمع الأرقام من كل موقع قبل أن يقارن بينها. ويحتاج الموظف الذي يغطي مناوبات في فرعين إلى حسابين، وينفد مكوّن في فرع بينما يملك فرع آخر رفًا ممتلئًا منه.",
          "إدارة المطاعم متعددة الفروع تضع الفروع جنبًا إلى جنب. كل فرع يكتب في قاعدة البيانات السحابية نفسها، فلا حاجة إلى مزامنة ليلية، وصلاحيات كل شخص تتبع الفروع المعيّن عليها.",
        ],
      },
      capabilities: {
        title: "ما تشمله إدارة الفروع",
        items: [
          { icon: "branches", title: "كل الفروع في حساب واحد", body: "تنقّل بين الفروع من أداة اختيار الفرع. ولكل فرع طوابقه وطاولاته وقائمته وأسعاره ومحطات مطبخه وطابعاته وكشكه." },
          { icon: "staff", title: "صلاحيات حسب الفرع", body: "عيّن كل موظف على فرع أو أكثر مع دوره. ولا يرى كاشير فرع ما طلبات فرع آخر إلا إذا سمحت بذلك." },
          { icon: "currency", title: "إعدادات ضريبية لكل فرع", body: "يحدد كل فرع نظامه الضريبي ورقمه الضريبي وهل الأسعار شاملة للضريبة أم لا، ومسمى الضريبة على الإيصال." },
          { icon: "inventory", title: "نقل المخزون بين الفروع", body: "انقل المكونات من فرع إلى آخر مع سجل يوضح ما نُقل وإلى أي فرع ومتى." },
          { icon: "reports", title: "نظرة عامة على الفروع", body: "اعرض المبيعات والطلبات المدفوعة والمفتوحة وقيمة المخزون والأصناف منخفضة المخزون لكل الفروع جنبًا إلى جنب لأي فترة." },
          { icon: "dashboard", title: "لوحة تحكم وتقارير لكل فرع", body: "لكل فرع لوحة تحكمه ودليل تقاريره الكامل، ويمكن إرسال التقارير بالبريد على جدول زمني لكل فرع." },
          { icon: "realtime", title: "قاعدة بيانات مباشرة واحدة", body: "تعمل كل الأجهزة في كل الفروع على البيانات نفسها، فيظهر أي تغيير في كل مكان خلال لحظات دون أي مزامنة." },
          { icon: "orders", title: "استقبال الطلبات حسب الفرع", body: "اختر لكل فرع هل تُقبل الطلبات الإلكترونية وحجوزات الطاولات تلقائيًا أم تنتظر الموظف." },
        ],
      },
      limits: {
        title: "حدود عمل الفروع",
        points: [
          "لا تُنشأ الفروع الجديدة من شاشة داخل التطبيق حاليًا؛ يضيفها فريق Wem Studios إلى حسابك.",
          "لكل فرع قائمته الخاصة، ولا توجد أداة لنسخ القائمة من فرع إلى آخر.",
          "العملة والمنطقة الزمنية تُضبطان مرة واحدة للمطعم كله، لذا تحتاج الفروع في دول بعملات مختلفة إلى حسابات منفصلة.",
          "التقارير المعتادة تعمل لكل فرع على حدة، والنظرة العامة على الفروع هي أداة المقارنة بينها.",
        ],
      },
      faq: [
        {
          q: "كم فرعًا يمكن أن يضم الحساب الواحد؟",
          a: "يعتمد السعر على عدد الفروع والأجهزة، لذا أخبرنا بخططك عند طلب العرض التجريبي.",
        },
        {
          q: "هل يستطيع المدير رؤية كل الفروع؟",
          a: "نعم، إذا كان معيّنًا عليها. يتنقل المالك والمدير بين الفروع من أداة اختيار الفرع، وتقارن النظرة العامة بين الفروع جنبًا إلى جنب.",
        },
        {
          q: "هل يمكن أن تختلف أسعار القائمة من فرع لآخر؟",
          a: "نعم. لكل فرع قائمته وأسعاره ونسب ضريبته ومحطات مطبخه، وهذا يناسب المجموعات التي تبيع فروعها أصنافًا أو أسعارًا مختلفة.",
        },
        {
          q: "هل يمكن نقل المخزون من المطبخ المركزي إلى الفروع؟",
          a: "نعم. إذا أُعدّ المطبخ المركزي كفرع، يمكنك نقل المكونات منه إلى أي فرع آخر مع سجل لكل عملية نقل.",
        },
        {
          q: "هل يمكن أن تكون الفروع في دول مختلفة؟",
          a: "الإعدادات الضريبية لكل فرع، فيمكن لكل فرع استخدام نظامه الضريبي. أما العملة والمنطقة الزمنية فمشتركة للحساب كله، لذا يُفضَّل تشغيل الفروع التي تحتاج عملة مختلفة بحساب منفصل.",
        },
      ],
      cta: {
        title: "خطّط لفروعك معنا",
        body: "أخبرنا بعدد فروعك وكيف تتشارك المخزون والموظفين، وسيتواصل معك فريق Wem Studios ليعرض كيف سيبدو الإعداد في Ahemad's Restro.",
      },
      image: {
        src: "/images/product/screens/reports-ar.webp",
        alt: "دليل التقارير بالعربية مع تقارير المبيعات والأصناف والموظفين والضريبة والمخزون للفرع المحدد",
      },
    },
  },
};
