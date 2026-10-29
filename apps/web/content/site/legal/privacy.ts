import type { LegalDoc } from "./types";

// Privacy Policy. Describes only processing that exists in this repository:
//   - demo form: apps/web/components/site/demo-form.tsx -> apps/api/src/modules/leads
//     (stored in D1; e-mailed via Resend/SendGrid only when DEMO_NOTIFY_EMAIL and a
//     provider are configured; cf-ipcountry + user-agent stored, IP address not stored)
//   - analytics: apps/web/components/site/analytics.tsx (GA4, consent-gated, only when
//     NEXT_PUBLIC_GA_MEASUREMENT_ID is set; choice in localStorage "ar-analytics-consent")
//   - app: httpOnly cookie "nodedr_session"; language in localStorage "nodedr-locale"
// Bracketed placeholders must be completed by the owner; the whole text must be
// reviewed by qualified legal counsel before publication.

export const PRIVACY: LegalDoc = {
  en: {
    title: "Privacy Policy",
    description:
      "How the Ahemad's Restro website and restaurant software handle personal data: demo requests, consent-based analytics, essential cookies, hosting and your rights.",
    updated: "Last updated: 29 October 2026",
    body: [
      {
        type: "note",
        text: "Template notice: this policy was prepared as a draft for review by qualified legal counsel before publication. Text in square brackets, such as [Legal entity name] and [Registered address], must be replaced with the operator's real details. It is not legal advice.",
      },
      { type: "h2", text: "1. Who we are" },
      {
        type: "p",
        text: "Ahemad's Restro is restaurant management software. The website and the software are operated by [Legal entity name], registered at [Registered address] (company or commercial registration number: [Registration number]) (\"we\", \"us\"). Wem Studios develops the software and handles demo requests, sales and support on our behalf.",
      },
      {
        type: "p",
        text: "This policy has two parts. Sections 2 to 10 cover this marketing website. Section 11 covers the Ahemad's Restro software that restaurants use, where the restaurant decides what data is processed.",
      },
      { type: "h2", text: "2. Information you give us through the demo request form" },
      { type: "p", text: "When you request a demo, we collect the information you type into the form:" },
      {
        type: "ul",
        items: [
          "your name;",
          "your business e-mail address;",
          "your phone number;",
          "your company or restaurant name;",
          "your country;",
          "the number of branches you selected (1, 2–5, 6–20 or 21+);",
          "your message, if you write one;",
          "the language of the page you used (English or Arabic).",
        ],
      },
      { type: "h3", text: "Collected automatically with a demo request" },
      {
        type: "ul",
        items: [
          "The country your request came from, as determined by our hosting provider (Cloudflare) from the network connection. We store the country code only; we do not store your IP address with your request.",
          "Your browser's user-agent string (for example the browser and operating system name), shortened to 300 characters, to help us spot automated spam.",
        ],
      },
      {
        type: "p",
        text: "The form also contains a hidden field that people do not see. If it is filled in, we treat the submission as automated and store nothing. Our hosting provider and our application limit how many requests can be sent from one connection in a short time; this requires processing the connection's IP address briefly for security, without adding it to your demo request.",
      },
      { type: "h2", text: "3. How we use demo request information" },
      {
        type: "ul",
        items: [
          "to contact you about your request, arrange a product walkthrough and answer your questions;",
          "to prepare a quote that fits your number of branches and devices;",
          "to keep a record of requests so that none is lost, and to detect and block spam.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your information, we do not use it for advertising profiles, and we do not add you to a newsletter. If you later become a customer, the contract with you will describe any further use.",
      },
      { type: "h2", text: "4. Where demo requests are stored and who receives them" },
      {
        type: "ul",
        items: [
          "Every request is stored in the service's database, which runs on Cloudflare D1. Only people authorised by us and Wem Studios can read it, using a private access key.",
          "If e-mail notifications are configured, a copy of the request (your form answers, without the country derived from your connection or your user-agent) is sent to Wem Studios by e-mail through our e-mail delivery provider, which is either Resend or SendGrid.",
          "Wem Studios staff use the information to respond to you.",
        ],
      },
      { type: "h2", text: "5. Analytics and cookies on this website" },
      {
        type: "p",
        text: "This website does not set its own tracking cookies. If website analytics are configured, we use Google Analytics 4, provided by Google, and only after you click \"Accept\" in the cookie banner. Until you accept, the analytics script is not loaded at all. If you decline, it is not loaded.",
      },
      {
        type: "p",
        text: "If you accept, Google Analytics sets its own cookies and receives information such as the pages you view, the type of device and browser, approximate location and the referring page. We also send a small number of events: clicks on call-to-action buttons and the fact that a demo request was submitted, together with the branch-count range you chose. We never send the contents of the form (name, e-mail, phone, company or message) to Google Analytics. IP anonymisation is requested in the configuration.",
      },
      {
        type: "p",
        text: "Your choice is saved in your browser's local storage under the key \"ar-analytics-consent\" so that the banner does not appear on every page. To change your choice, clear this website's stored data in your browser settings; the banner will appear again on your next visit.",
      },
      { type: "h2", text: "6. Legal bases" },
      {
        type: "ul",
        items: [
          "Demo requests: to take steps at your request before a possible contract, and our legitimate interest in responding to business enquiries.",
          "Spam prevention and security: our legitimate interest in keeping the website and service secure.",
          "Analytics: your consent, which you can withdraw at any time as described above.",
        ],
      },
      {
        type: "p",
        text: "Depending on where you are, data protection laws such as Saudi Arabia's Personal Data Protection Law (PDPL) and India's Digital Personal Data Protection Act, 2023 (DPDP Act) may apply. We aim to handle personal data in line with the principles of these laws. We do not claim any certification under them.",
      },
      { type: "h2", text: "7. How long we keep information" },
      {
        type: "p",
        text: "We keep demo requests for as long as we need them to respond and to follow up on a possible business relationship, and delete or anonymise them within [retention period] after our last contact if no contract results. Records that we must keep for legal reasons are kept for the period the law requires. Analytics data is kept according to the retention setting of our Google Analytics property: [analytics retention period].",
      },
      { type: "h2", text: "8. International processing" },
      {
        type: "p",
        text: "The website and the service are hosted on Cloudflare's global network. Your information may therefore be processed in data centres outside your country, including outside Saudi Arabia and India. Our e-mail delivery provider and Google (if you accept analytics) may also process data in other countries. Where the law requires safeguards for such transfers, we will rely on the mechanisms it allows: [describe transfer safeguards, e.g. contractual terms with providers].",
      },
      { type: "h2", text: "9. Security" },
      {
        type: "p",
        text: "The website is served over HTTPS. Demo requests can only be read through a protected endpoint that requires a private access key, and requests are rate-limited to reduce abuse. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
      },
      { type: "h2", text: "10. Your rights" },
      {
        type: "p",
        text: "Subject to the law that applies to you, you may ask us to:",
      },
      {
        type: "ul",
        items: [
          "tell you what personal data we hold about you and give you a copy;",
          "correct inaccurate or incomplete data;",
          "delete your data when we no longer need it or you withdraw consent;",
          "stop or restrict certain processing;",
          "withdraw your consent to analytics at any time;",
          "where the DPDP Act applies, nominate another person to exercise your rights in case of death or incapacity, and use our grievance process.",
        ],
      },
      {
        type: "p",
        text: "To make a request or raise a concern, call Wem Studios on +91 8308042362 or use the contact options at https://wemstudios.in/. Grievance contact: [Name or role of the person responsible for privacy requests]. We may need to confirm your identity before acting on a request. If you are not satisfied with our answer, you can complain to the data protection authority where you live — in Saudi Arabia, the Saudi Data & AI Authority (SDAIA); in India, the Data Protection Board of India.",
      },
      { type: "h2", text: "11. The Ahemad's Restro software (for restaurants and their guests)" },
      { type: "h3", text: "Restaurants control their own data" },
      {
        type: "p",
        text: "Restaurants that use Ahemad's Restro enter and manage their own data: menus, orders, bills, customer profiles and loyalty balances, reservations and waitlists, staff records, attendance and payroll, suppliers and stock. For personal data about their guests and staff, the restaurant is the controller (in the DPDP Act's terms, the data fiduciary) and decides why and how that data is used. When we and Wem Studios host and support the software, we process that data on the restaurant's instructions and for no other purpose, under the terms agreed with the restaurant [and a data processing agreement].",
      },
      {
        type: "p",
        text: "If you are a guest of a restaurant that uses Ahemad's Restro and want to access, correct or delete your data, please contact that restaurant. If you contact us instead, we will pass your request to the restaurant where we can identify it.",
      },
      { type: "h3", text: "Account data of restaurant users" },
      {
        type: "p",
        text: "To give restaurant staff access, the software stores each user's name, sign-in e-mail or identifier, role and branch assignments, a securely hashed password and PIN, two-factor authentication settings if enabled, and an audit log of significant actions (for example refunds, discounts and settings changes) so that the restaurant can review who did what.",
      },
      { type: "h3", text: "Guest-facing screens" },
      {
        type: "p",
        text: "The table QR ordering page and the self-service kiosk do not require an account. The kiosk does not ask for a name, phone number or e-mail address. The QR ordering page may ask for a name to label the order, and records the items ordered and any \"call waiter\" or \"bring the bill\" request for that table.",
      },
      { type: "h3", text: "Essential cookies and browser storage in the software" },
      {
        type: "ul",
        items: [
          "nodedr_session — an httpOnly session cookie that keeps a signed-in user signed in and protects their requests. It cannot be read by scripts on the page and is required for the software to work.",
          "Language preference — the chosen interface language is saved in the browser's local storage (key \"nodedr-locale\").",
          "Device preferences — for example the kitchen display station chosen on a kitchen screen is remembered in local storage on that device.",
        ],
      },
      {
        type: "p",
        text: "The software does not use advertising cookies. Because these items are necessary for the service, they are not covered by the website's analytics banner.",
      },
      { type: "h3", text: "Hosting" },
      {
        type: "p",
        text: "The software runs on Cloudflare: data is stored in Cloudflare D1 (database) and R2 (uploaded files such as menu photos and documents), and live updates pass through Cloudflare. As with the website, data may be processed outside the restaurant's or guest's country. If the restaurant enables e-mail features (for example scheduled reports or marketing campaigns), messages are sent through the configured e-mail provider.",
      },
      { type: "h2", text: "12. Children" },
      {
        type: "p",
        text: "This website and the software are intended for businesses. We do not knowingly collect personal data from children through the website.",
      },
      { type: "h2", text: "13. Changes to this policy" },
      {
        type: "p",
        text: "We may update this policy when our services or the law change. We will change the date at the top of this page and, for significant changes, make reasonable efforts to inform customers.",
      },
      { type: "h2", text: "14. Contact" },
      {
        type: "p",
        text: "[Legal entity name], [Registered address]. Phone: +91 8308042362 (Wem Studios). Website: https://wemstudios.in/.",
      },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    description:
      "كيف يتعامل موقع Ahemad's Restro وبرنامج إدارة المطاعم مع البيانات الشخصية: طلبات العرض التجريبي، والتحليلات بعد الموافقة، وملفات تعريف الارتباط الضرورية، والاستضافة، وحقوقك.",
    updated: "آخر تحديث: 29 أكتوبر 2026",
    body: [
      {
        type: "note",
        text: "تنبيه: هذه السياسة مسودة أُعدّت لتراجعها جهة قانونية مختصة قبل النشر. يجب استبدال النصوص الواردة بين قوسين معقوفين، مثل [اسم الكيان القانوني] و[العنوان المسجل]، بالبيانات الفعلية للجهة المشغّلة. هذا النص ليس استشارة قانونية.",
      },
      { type: "h2", text: "1. من نحن" },
      {
        type: "p",
        text: "Ahemad's Restro برنامج لإدارة المطاعم. يتولى تشغيل الموقع والبرنامج [اسم الكيان القانوني]، وعنوانه المسجل [العنوان المسجل]، ورقم السجل التجاري أو رقم التسجيل [رقم التسجيل] (ويُشار إليه بـ«نحن»). وتتولى Wem Studios تطوير البرنامج ومتابعة طلبات العرض التجريبي والمبيعات والدعم نيابةً عنا.",
      },
      {
        type: "p",
        text: "تتكون هذه السياسة من جزأين: الأقسام من 2 إلى 10 تخص هذا الموقع التعريفي، والقسم 11 يخص برنامج Ahemad's Restro الذي تستخدمه المطاعم، حيث يحدد المطعم نفسه البيانات التي تُعالج.",
      },
      { type: "h2", text: "2. البيانات التي تقدمها عبر نموذج طلب العرض التجريبي" },
      { type: "p", text: "عند طلب عرض تجريبي نجمع البيانات التي تكتبها في النموذج:" },
      {
        type: "ul",
        items: [
          "الاسم؛",
          "البريد الإلكتروني للعمل؛",
          "رقم الجوال أو الهاتف؛",
          "اسم الشركة أو المطعم؛",
          "الدولة؛",
          "عدد الفروع الذي تختاره (1، أو 2–5، أو 6–20، أو 21 فأكثر)؛",
          "رسالتك إن كتبت رسالة؛",
          "لغة الصفحة التي استخدمتها (العربية أو الإنجليزية).",
        ],
      },
      { type: "h3", text: "بيانات تُجمع تلقائيًا مع الطلب" },
      {
        type: "ul",
        items: [
          "الدولة التي أُرسل منها الطلب كما يحددها مزوّد الاستضافة (Cloudflare) من الاتصال الشبكي. نحفظ رمز الدولة فقط، ولا نحفظ عنوان IP الخاص بك مع الطلب.",
          "معرّف المتصفح (User-Agent) الذي يوضح مثلًا اسم المتصفح ونظام التشغيل، مختصرًا إلى 300 حرف، لمساعدتنا على كشف الرسائل الآلية المزعجة.",
        ],
      },
      {
        type: "p",
        text: "يحتوي النموذج أيضًا على حقل مخفي لا يراه الزوار؛ فإذا تمت تعبئته نعدّ الطلب آليًا ولا نحفظ شيئًا. كما يحدّ مزوّد الاستضافة والتطبيق من عدد الطلبات المرسلة من الاتصال نفسه خلال وقت قصير، وهذا يتطلب معالجة عنوان IP لفترة وجيزة لأغراض الأمان دون إضافته إلى طلبك.",
      },
      { type: "h2", text: "3. كيف نستخدم بيانات طلب العرض التجريبي" },
      {
        type: "ul",
        items: [
          "للتواصل معك بخصوص طلبك وترتيب جولة تعريفية في المنتج والإجابة عن أسئلتك؛",
          "لإعداد عرض سعر يناسب عدد فروعك وأجهزتك؛",
          "للاحتفاظ بسجل الطلبات حتى لا يضيع أي طلب، ولكشف الرسائل المزعجة وحجبها.",
        ],
      },
      {
        type: "p",
        text: "لا نبيع بياناتك، ولا نستخدمها لبناء ملفات إعلانية، ولا نضيفك إلى نشرة بريدية. وإذا أصبحت عميلًا لاحقًا فسيوضح العقد معك أي استخدام إضافي.",
      },
      { type: "h2", text: "4. أين تُحفظ الطلبات ومن يطّلع عليها" },
      {
        type: "ul",
        items: [
          "يُحفظ كل طلب في قاعدة بيانات الخدمة التي تعمل على Cloudflare D1، ولا يقرؤها إلا الأشخاص المخوّلون من قبلنا ومن Wem Studios باستخدام مفتاح وصول خاص.",
          "إذا كانت إشعارات البريد مفعّلة، تُرسل نسخة من الطلب (إجاباتك في النموذج، دون الدولة المستنتجة من الاتصال ودون معرّف المتصفح) إلى Wem Studios بالبريد الإلكتروني عبر مزوّد إرسال البريد لدينا، وهو Resend أو SendGrid.",
          "يستخدم فريق Wem Studios هذه البيانات للرد عليك.",
        ],
      },
      { type: "h2", text: "5. التحليلات وملفات تعريف الارتباط في هذا الموقع" },
      {
        type: "p",
        text: "لا يضع هذا الموقع ملفات تتبّع خاصة به. وإذا كانت التحليلات مفعّلة فإننا نستخدم Google Analytics 4 المقدَّم من Google، ولا يحدث ذلك إلا بعد أن تضغط «موافق» في شريط ملفات تعريف الارتباط. قبل موافقتك لا يُحمَّل برنامج التحليلات إطلاقًا، وإذا رفضت فلن يُحمَّل.",
      },
      {
        type: "p",
        text: "إذا وافقت، يضع Google Analytics ملفاته الخاصة ويتلقى معلومات مثل الصفحات التي تزورها ونوع الجهاز والمتصفح والموقع التقريبي والصفحة التي جئت منها. ونرسل كذلك عددًا محدودًا من الأحداث: النقر على أزرار الدعوة إلى الإجراء، وإرسال طلب عرض تجريبي مع فئة عدد الفروع التي اخترتها. لا نرسل محتوى النموذج (الاسم أو البريد أو الهاتف أو الشركة أو الرسالة) إلى Google Analytics مطلقًا، ونطلب في الإعدادات إخفاء جزء من عنوان IP.",
      },
      {
        type: "p",
        text: "يُحفظ اختيارك في التخزين المحلي للمتصفح تحت المفتاح «ar-analytics-consent» حتى لا يظهر الشريط في كل صفحة. ولتغيير اختيارك امسح البيانات المخزنة لهذا الموقع من إعدادات المتصفح، وسيظهر الشريط مجددًا في زيارتك التالية.",
      },
      { type: "h2", text: "6. الأسس النظامية للمعالجة" },
      {
        type: "ul",
        items: [
          "طلبات العرض التجريبي: اتخاذ خطوات بناءً على طلبك قبل تعاقد محتمل، ومصلحتنا المشروعة في الرد على الاستفسارات التجارية.",
          "منع الرسائل المزعجة والأمان: مصلحتنا المشروعة في حماية الموقع والخدمة.",
          "التحليلات: موافقتك، ويمكنك سحبها في أي وقت كما هو موضح أعلاه.",
        ],
      },
      {
        type: "p",
        text: "بحسب مكان وجودك، قد ينطبق نظام حماية البيانات الشخصية في المملكة العربية السعودية، أو قانون حماية البيانات الشخصية الرقمية الهندي لعام 2023 (DPDP Act). نسعى إلى التعامل مع البيانات الشخصية وفق مبادئ هذه الأنظمة، ولا ندّعي الحصول على أي شهادة بموجبها.",
      },
      { type: "h2", text: "7. مدة الاحتفاظ بالبيانات" },
      {
        type: "p",
        text: "نحتفظ بطلبات العرض التجريبي طوال المدة اللازمة للرد عليها ومتابعة أي علاقة تجارية محتملة، ونحذفها أو نجعلها مجهولة الهوية خلال [مدة الاحتفاظ] من آخر تواصل إذا لم يُبرم عقد. وتُحفظ السجلات التي يلزمنا النظام بالاحتفاظ بها للمدة التي يحددها. أما بيانات التحليلات فتُحفظ وفق إعداد الاحتفاظ في حساب Google Analytics لدينا: [مدة الاحتفاظ ببيانات التحليلات].",
      },
      { type: "h2", text: "8. المعالجة خارج بلدك" },
      {
        type: "p",
        text: "يُستضاف الموقع والخدمة على شبكة Cloudflare العالمية، لذا قد تُعالج بياناتك في مراكز بيانات خارج بلدك، بما في ذلك خارج المملكة العربية السعودية والهند. وقد يعالج مزوّد البريد وGoogle (إذا وافقت على التحليلات) البيانات في دول أخرى كذلك. وحيث يشترط النظام ضمانات لهذا النقل، نعتمد على الآليات التي يسمح بها: [وصف ضمانات النقل، مثل الشروط التعاقدية مع المزوّدين].",
      },
      { type: "h2", text: "9. الأمان" },
      {
        type: "p",
        text: "يعمل الموقع عبر اتصال HTTPS مشفّر. ولا يمكن قراءة طلبات العرض التجريبي إلا من خلال نقطة وصول محمية تتطلب مفتاحًا خاصًا، كما أن عدد الطلبات محدود للحد من إساءة الاستخدام. ومع ذلك لا توجد وسيلة نقل أو تخزين آمنة تمامًا، فلا يمكننا ضمان الأمان المطلق.",
      },
      { type: "h2", text: "10. حقوقك" },
      { type: "p", text: "وفقًا للنظام المطبق عليك، يحق لك أن تطلب منا:" },
      {
        type: "ul",
        items: [
          "إعلامك بالبيانات الشخصية التي نحتفظ بها عنك وتزويدك بنسخة منها؛",
          "تصحيح البيانات غير الدقيقة أو غير المكتملة؛",
          "حذف بياناتك عند انتفاء الحاجة إليها أو عند سحب موافقتك؛",
          "إيقاف معالجة معينة أو تقييدها؛",
          "سحب موافقتك على التحليلات في أي وقت؛",
          "حيث ينطبق القانون الهندي: تعيين شخص يمارس حقوقك في حال الوفاة أو العجز، واستخدام آلية التظلم لدينا.",
        ],
      },
      {
        type: "p",
        text: "لتقديم طلب أو ملاحظة، اتصل بـ Wem Studios على الرقم ‎+91 8308042362 أو استخدم وسائل التواصل في الموقع https://wemstudios.in/. مسؤول طلبات الخصوصية: [اسم أو صفة المسؤول عن طلبات الخصوصية]. قد نحتاج إلى التحقق من هويتك قبل تنفيذ الطلب. وإذا لم تكن راضيًا عن ردنا فيمكنك تقديم شكوى إلى الجهة المختصة بحماية البيانات في بلدك؛ ففي المملكة العربية السعودية هي الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)، وفي الهند هي مجلس حماية البيانات الهندي.",
      },
      { type: "h2", text: "11. برنامج Ahemad's Restro (للمطاعم وضيوفها)" },
      { type: "h3", text: "المطعم هو صاحب القرار في بياناته" },
      {
        type: "p",
        text: "تُدخل المطاعم التي تستخدم Ahemad's Restro بياناتها وتديرها بنفسها: قوائم الطعام والطلبات والفواتير وملفات العملاء وأرصدة الولاء والحجوزات وقوائم الانتظار وسجلات الموظفين والحضور والرواتب والموردين والمخزون. وبالنسبة للبيانات الشخصية لضيوف المطعم وموظفيه، يكون المطعم هو جهة التحكم التي تحدد أغراض المعالجة وطريقتها. وعندما نستضيف البرنامج وندعمه نحن وWem Studios، فإننا نعالج هذه البيانات وفق تعليمات المطعم ولا نستخدمها لأي غرض آخر، بموجب الشروط المتفق عليها مع المطعم [واتفاقية معالجة البيانات].",
      },
      {
        type: "p",
        text: "إذا كنت ضيفًا في مطعم يستخدم Ahemad's Restro وتريد الاطلاع على بياناتك أو تصحيحها أو حذفها، فتواصل مع المطعم مباشرة. وإذا تواصلت معنا فسننقل طلبك إلى المطعم متى أمكننا تحديده.",
      },
      { type: "h3", text: "بيانات حسابات مستخدمي المطعم" },
      {
        type: "p",
        text: "لتمكين موظفي المطعم من الدخول، يحفظ البرنامج لكل مستخدم اسمه ومعرّف الدخول أو بريده الإلكتروني ودوره والفروع المسندة إليه، وكلمة المرور ورمز PIN بصيغة مشفرة غير قابلة للاسترجاع، وإعدادات التحقق بخطوتين إن فُعّل، وسجل تدقيق للإجراءات المهمة (مثل الاسترداد والخصومات وتغيير الإعدادات) ليتمكن المطعم من معرفة من قام بماذا.",
      },
      { type: "h3", text: "الشاشات المخصصة للضيوف" },
      {
        type: "p",
        text: "لا تتطلب صفحة الطلب عبر رمز QR على الطاولة ولا كشك الخدمة الذاتية إنشاء حساب. ولا يطلب الكشك اسمًا أو رقم جوال أو بريدًا إلكترونيًا. وقد تطلب صفحة الطلب عبر QR اسمًا لتمييز الطلب، وتسجل الأصناف المطلوبة وأي طلب «استدعاء النادل» أو «إحضار الفاتورة» لتلك الطاولة.",
      },
      { type: "h3", text: "ملفات تعريف الارتباط والتخزين الضروري في البرنامج" },
      {
        type: "ul",
        items: [
          "nodedr_session: ملف جلسة من نوع httpOnly يُبقي المستخدم مسجلًا دخوله ويحمي طلباته، ولا يمكن لبرامج الصفحة قراءته، وهو ضروري لعمل البرنامج.",
          "تفضيل اللغة: تُحفظ لغة الواجهة المختارة في التخزين المحلي للمتصفح (المفتاح «nodedr-locale»).",
          "تفضيلات الجهاز: مثل محطة المطبخ المختارة على شاشة المطبخ، وتُحفظ في التخزين المحلي لذلك الجهاز.",
        ],
      },
      {
        type: "p",
        text: "لا يستخدم البرنامج ملفات تعريف ارتباط إعلانية. ولأن هذه العناصر ضرورية لعمل الخدمة فهي لا تخضع لشريط موافقة التحليلات في الموقع.",
      },
      { type: "h3", text: "الاستضافة" },
      {
        type: "p",
        text: "يعمل البرنامج على Cloudflare؛ إذ تُحفظ البيانات في Cloudflare D1 (قاعدة البيانات) وR2 (الملفات المرفوعة مثل صور الأصناف والمستندات)، وتمر التحديثات الفورية عبر Cloudflare. وكما هو الحال في الموقع، قد تُعالج البيانات خارج بلد المطعم أو الضيف. وإذا فعّل المطعم مزايا البريد الإلكتروني (مثل التقارير المجدولة أو الحملات التسويقية) فتُرسل الرسائل عبر مزوّد البريد المُعدّ.",
      },
      { type: "h2", text: "12. الأطفال" },
      {
        type: "p",
        text: "هذا الموقع والبرنامج موجهان للمنشآت التجارية، ولا نجمع عن علم بيانات شخصية من الأطفال عبر الموقع.",
      },
      { type: "h2", text: "13. التعديلات على هذه السياسة" },
      {
        type: "p",
        text: "قد نحدّث هذه السياسة عند تغيّر خدماتنا أو الأنظمة، وسنغيّر التاريخ في أعلى الصفحة، ونبذل جهدًا معقولًا لإبلاغ العملاء بالتغييرات الجوهرية.",
      },
      { type: "h2", text: "14. التواصل" },
      {
        type: "p",
        text: "[اسم الكيان القانوني]، [العنوان المسجل]. الهاتف: ‎+91 8308042362 ‏(Wem Studios). الموقع: https://wemstudios.in/.",
      },
    ],
  },
};
