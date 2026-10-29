import { BRAND } from "@ahemads-restro/types";
import { SOURCE_CODE_URL } from "@/lib/site/config";
import type { LegalDoc } from "./types";

// Terms of Service for the marketing website and the software. Commercial
// terms (plans, fees, payment, term) are agreed separately with Wem Studios and
// deliberately not stated here. Bracketed placeholders must be completed by the
// owner; the whole text must be reviewed by qualified legal counsel before
// publication.

const up = BRAND.upstream;

export const TERMS: LegalDoc = {
  en: {
    title: "Terms of Service",
    description:
      "Terms for using the Ahemad's Restro website and restaurant management software: accounts, acceptable use, customer data, tax responsibility, availability and open-source licensing.",
    updated: "Last updated: 29 October 2026",
    body: [
      {
        type: "note",
        text: "Template notice: these terms were prepared as a draft for review by qualified legal counsel before publication. Text in square brackets, such as [Legal entity name], [Jurisdiction] and the limitation-of-liability wording, must be completed or replaced. It is not legal advice.",
      },
      { type: "h2", text: "1. About these terms" },
      {
        type: "p",
        text: "These terms apply to the Ahemad's Restro marketing website (the \"Website\") and to the Ahemad's Restro restaurant management software and related services (the \"Service\"), operated by [Legal entity name], registered at [Registered address] (\"we\", \"us\"). Wem Studios develops the Service and handles sales, onboarding and support on our behalf. \"Customer\" means the restaurant business that uses the Service, and \"Users\" are the people the Customer allows to use it.",
      },
      {
        type: "p",
        text: "By using the Website or the Service you agree to these terms. If you use the Service on behalf of a business, you confirm that you are authorised to accept them for that business.",
      },
      { type: "h2", text: "2. The Website" },
      {
        type: "p",
        text: "The Website describes the Service and lets you request a demo. Its content, including guides and blog articles, is general information. It is not an offer capable of acceptance, and it is not legal, tax or financial advice. Features and screenshots describe the Service at the time of writing and may change.",
      },
      {
        type: "p",
        text: "You may read, share links to and print pages for your own use. You may not copy the Website's content or design for commercial use, or use it to imply an endorsement, without our written permission.",
      },
      { type: "h2", text: "3. Access to the Service and commercial terms" },
      {
        type: "p",
        text: "Access to the Service is provided under a separate quotation, order form or agreement with Wem Studios (the \"Commercial Agreement\"). The Commercial Agreement sets out the plan, number of branches and devices, fees, billing, payment terms, subscription period, onboarding and any customisation. No prices are published on the Website. If the Commercial Agreement conflicts with these terms, the Commercial Agreement prevails.",
      },
      { type: "h2", text: "4. Accounts and security" },
      {
        type: "ul",
        items: [
          "The Customer is responsible for the Users it creates, the roles and permissions it gives them, and everything done under their accounts.",
          "Users must keep passwords and PINs confidential. We strongly recommend enabling two-factor authentication for owner and manager accounts.",
          "Tell us promptly at +91 8308042362 if you suspect unauthorised access.",
          "Links that give access without a sign-in — such as table QR codes and kiosk addresses — act like keys. The Customer should keep them under control and regenerate them if they are misused.",
        ],
      },
      { type: "h2", text: "5. Acceptable use" },
      { type: "p", text: "You must not, and must not allow others to:" },
      {
        type: "ul",
        items: [
          "use the Website or Service for anything unlawful, fraudulent or misleading, including issuing false invoices or misrepresenting tax;",
          "upload malware or content that infringes others' rights;",
          "try to access accounts, restaurants or data that are not yours, or test the security of the Service without our written permission;",
          "overload, disrupt or work around rate limits or other protections of the Service;",
          "use automated tools to scrape the Website or Service, other than search engines indexing public pages;",
          "resell or provide the hosted Service to third parties unless the Commercial Agreement allows it.",
        ],
      },
      { type: "h2", text: "6. Customer data" },
      {
        type: "p",
        text: "\"Customer Data\" is the information the Customer and its Users put into the Service, such as menus, prices, orders, guest and staff details, stock and financial records. As between the Customer and us, the Customer owns its Customer Data.",
      },
      {
        type: "ul",
        items: [
          "The Customer is responsible for the accuracy of its Customer Data, for having a lawful basis to collect it, and for informing its guests and staff about how their data is used.",
          "We process Customer Data only to provide, secure and support the Service and as the Customer instructs, as described in our Privacy Policy [and the data processing agreement].",
          "The Customer can export reports in CSV, Excel or PDF format while it has access. The Customer should keep its own copies of records it is legally required to retain.",
          "After the Service ends, we will make Customer Data available for export for [number] days and then delete it, unless the law requires us to keep it or the Commercial Agreement says otherwise.",
        ],
      },
      { type: "h2", text: "7. Tax, invoices and payments" },
      {
        type: "p",
        text: "The Service helps calculate prices, tax and receipts based on the settings the Customer chooses, such as tax regime, rates per item and whether prices include tax. The Customer remains solely responsible for its tax registration, the correctness of these settings, the invoices it issues and its filings with the tax authority.",
      },
      {
        type: "ul",
        items: [
          "For Saudi branches, the Service can print simplified tax invoices with the QR code required in ZATCA's e-invoicing Phase 1. Integration with ZATCA's FATOORA platform (Phase 2) is not included. A Customer that is or becomes subject to Phase 2 must arrange a separate compliant integration or provider.",
          "For Indian branches, GST settings and receipt formats are provided as tools; the Customer must confirm they meet its obligations.",
          "The Service records payments that staff take with the Customer's own card terminals, wallets or cash. No payment gateway is included, and we do not hold or transfer funds.",
        ],
      },
      {
        type: "p",
        text: "Nothing in the Service, the Website or our support is tax advice. Confirm your obligations with the tax authority or a qualified adviser.",
      },
      { type: "h2", text: "8. Availability, changes and support" },
      {
        type: "p",
        text: "We work to keep the Service available and reliable, but we do not guarantee any level of uptime unless a service level is written into the Commercial Agreement. The Service depends on the internet, on the Customer's devices and network, and on third-party infrastructure (including Cloudflare). It may be interrupted for maintenance, updates or events outside our control. The Customer should keep a simple fallback procedure, such as manual order taking, for outages.",
      },
      {
        type: "p",
        text: "We may improve, change or remove features. We will try to avoid changes that materially reduce core functionality during a paid period and to give reasonable notice of significant changes. Hardware such as printers, screens and card terminals is the Customer's responsibility; compatibility should be confirmed before purchase. Support channels and hours are set out in the Commercial Agreement.",
      },
      { type: "h2", text: "9. Third-party services" },
      {
        type: "p",
        text: "The Service may connect to services we do not control, such as e-mail delivery providers, payment terminals, delivery partners or systems the Customer links through the integration API, webhooks or MCP server. Their use is governed by their own terms, and we are not responsible for them.",
      },
      { type: "h2", text: "10. Open-source software" },
      {
        type: "p",
        text: `The Service is built on ${up.name}, copyright ${up.copyright}, which is licensed under the GNU Affero General Public License version 3 (AGPL-3.0). In line with that licence, the corresponding source code of the software is available at ${SOURCE_CODE_URL}. Nothing in these terms limits the rights the AGPL-3.0 gives you in that code.`,
      },
      {
        type: "p",
        text: "The AGPL-3.0 covers the software code. It does not grant rights to the \"Ahemad's Restro\" name, logo or brand, to the hosted Service operated by us, or to Customer Data.",
      },
      { type: "h2", text: "11. Intellectual property" },
      {
        type: "p",
        text: "Subject to section 10, the Website's content and design and the Ahemad's Restro name and logo belong to us or our licensors. The Customer keeps all rights in its own content, such as menu photos and descriptions, and grants us the rights needed to host and display it in the Service. If you send us suggestions, we may use them without obligation to you.",
      },
      { type: "h2", text: "12. Disclaimer" },
      {
        type: "p",
        text: "To the extent the law allows, the Website and the Service are provided \"as is\" and \"as available\", and we exclude warranties not expressly stated in these terms or the Commercial Agreement, including fitness for a particular purpose. Nothing in these terms excludes rights that cannot be excluded by law.",
      },
      { type: "h2", text: "13. Limitation of liability" },
      {
        type: "p",
        text: "[Limitation of liability clause to be drafted by legal counsel — for example: an exclusion of indirect and consequential loss, including lost profits and lost data; and a cap on total liability, such as the fees paid by the Customer in the [12] months before the claim. Carve-outs required by the governing law must be included.]",
      },
      { type: "h2", text: "14. Suspension and termination" },
      {
        type: "p",
        text: "We may suspend access, with notice where reasonably possible, if the Service is being used in breach of these terms, to protect the Service or other customers, or if fees under the Commercial Agreement are seriously overdue. Either party may end the Service as set out in the Commercial Agreement. Sections 6, 7, 10, 12, 13 and 16 continue after termination.",
      },
      { type: "h2", text: "15. Changes to these terms" },
      {
        type: "p",
        text: "We may update these terms. The date at the top shows the latest version. For significant changes affecting existing Customers, we will give reasonable notice before they take effect. Continuing to use the Service after that date means you accept the updated terms.",
      },
      { type: "h2", text: "16. Governing law and disputes" },
      {
        type: "p",
        text: "These terms are governed by the laws of [Jurisdiction]. The courts of [Venue] have [exclusive] jurisdiction over disputes, unless the Commercial Agreement provides another dispute resolution method. [Counsel to confirm consumer-protection or mandatory local rules that may apply.]",
      },
      { type: "h2", text: "17. Contact" },
      {
        type: "p",
        text: "[Legal entity name], [Registered address]. Phone: +91 8308042362 (Wem Studios). Website: https://wemstudios.in/.",
      },
    ],
  },
  ar: {
    title: "شروط الخدمة",
    description:
      "شروط استخدام موقع Ahemad's Restro وبرنامج إدارة المطاعم: الحسابات، والاستخدام المقبول، وبيانات العميل، والمسؤولية الضريبية، وتوفر الخدمة، وترخيص المصدر المفتوح.",
    updated: "آخر تحديث: 29 أكتوبر 2026",
    body: [
      {
        type: "note",
        text: "تنبيه: هذه الشروط مسودة أُعدّت لتراجعها جهة قانونية مختصة قبل النشر. يجب استكمال أو استبدال النصوص الواردة بين قوسين معقوفين، مثل [اسم الكيان القانوني] و[الاختصاص القضائي] وصياغة حدود المسؤولية. هذا النص ليس استشارة قانونية.",
      },
      { type: "h2", text: "1. نطاق هذه الشروط" },
      {
        type: "p",
        text: "تنطبق هذه الشروط على الموقع التعريفي لـ Ahemad's Restro («الموقع») وعلى برنامج Ahemad's Restro لإدارة المطاعم والخدمات المرتبطة به («الخدمة»)، ويتولى تشغيلهما [اسم الكيان القانوني]، وعنوانه المسجل [العنوان المسجل] («نحن»). وتتولى Wem Studios تطوير الخدمة والمبيعات والإعداد والدعم نيابةً عنا. ويُقصد بـ«العميل» المنشأة التي تستخدم الخدمة، وبـ«المستخدمين» الأشخاص الذين يسمح لهم العميل باستخدامها.",
      },
      {
        type: "p",
        text: "باستخدامك الموقع أو الخدمة فإنك توافق على هذه الشروط. وإذا كنت تستخدم الخدمة نيابةً عن منشأة فإنك تقر بأنك مفوّض بقبولها عنها.",
      },
      { type: "h2", text: "2. الموقع" },
      {
        type: "p",
        text: "يعرّف الموقع بالخدمة ويتيح لك طلب عرض تجريبي. ومحتواه، بما في ذلك الأدلة والمقالات، معلومات عامة؛ فهو ليس إيجابًا تعاقديًا، وليس استشارة نظامية أو ضريبية أو مالية. وتصف المزايا ولقطات الشاشة الخدمة وقت الكتابة، وقد تتغير.",
      },
      {
        type: "p",
        text: "يمكنك قراءة صفحات الموقع ومشاركة روابطها وطباعتها لاستخدامك الخاص، ولا يجوز نسخ محتوى الموقع أو تصميمه لاستخدام تجاري أو استخدامه بما يوحي بتأييدنا دون إذن كتابي منا.",
      },
      { type: "h2", text: "3. الوصول إلى الخدمة والشروط التجارية" },
      {
        type: "p",
        text: "يُتاح الوصول إلى الخدمة بموجب عرض سعر أو نموذج طلب أو اتفاقية مستقلة مع Wem Studios («الاتفاقية التجارية»)، وهي التي تحدد الباقة وعدد الفروع والأجهزة والرسوم والفوترة وشروط الدفع ومدة الاشتراك والإعداد وأي تخصيص. ولا تُنشر الأسعار على الموقع. وفي حال التعارض بين الاتفاقية التجارية وهذه الشروط تُقدَّم الاتفاقية التجارية.",
      },
      { type: "h2", text: "4. الحسابات والأمان" },
      {
        type: "ul",
        items: [
          "العميل مسؤول عن المستخدمين الذين ينشئهم، وعن الأدوار والصلاحيات التي يمنحها لهم، وعن كل ما يتم من خلال حساباتهم.",
          "يجب على المستخدمين الحفاظ على سرية كلمات المرور ورموز PIN، ونوصي بشدة بتفعيل التحقق بخطوتين لحسابات المالك والمديرين.",
          "أبلغنا فورًا على الرقم ‎+91 8308042362 إذا اشتبهت في دخول غير مصرّح به.",
          "الروابط التي تتيح الوصول دون تسجيل دخول، مثل رموز QR للطاولات وعناوين الكشك، تعمل عمل المفاتيح؛ لذا ينبغي للعميل التحكم بها وإعادة توليدها عند إساءة استخدامها.",
        ],
      },
      { type: "h2", text: "5. الاستخدام المقبول" },
      { type: "p", text: "لا يجوز لك، ولا يجوز أن تسمح لغيرك، بما يلي:" },
      {
        type: "ul",
        items: [
          "استخدام الموقع أو الخدمة لأي غرض مخالف للأنظمة أو احتيالي أو مضلل، ومن ذلك إصدار فواتير غير صحيحة أو التلاعب بالضريبة؛",
          "رفع برمجيات ضارة أو محتوى يتعدى على حقوق الآخرين؛",
          "محاولة الوصول إلى حسابات أو مطاعم أو بيانات لا تخصك، أو اختبار أمان الخدمة دون إذن كتابي منا؛",
          "إثقال الخدمة أو تعطيلها أو التحايل على حدود الطلبات ووسائل الحماية الأخرى؛",
          "استخدام أدوات آلية لاستخراج بيانات الموقع أو الخدمة، باستثناء محركات البحث عند فهرسة الصفحات العامة؛",
          "إعادة بيع الخدمة المستضافة أو تقديمها لأطراف أخرى ما لم تسمح بذلك الاتفاقية التجارية.",
        ],
      },
      { type: "h2", text: "6. بيانات العميل" },
      {
        type: "p",
        text: "«بيانات العميل» هي المعلومات التي يُدخلها العميل ومستخدموه في الخدمة، مثل قوائم الطعام والأسعار والطلبات وبيانات الضيوف والموظفين والمخزون والسجلات المالية. وفيما بيننا وبين العميل، تعود ملكية بيانات العميل إليه.",
      },
      {
        type: "ul",
        items: [
          "العميل مسؤول عن دقة بياناته، وعن وجود أساس نظامي لجمعها، وعن إبلاغ ضيوفه وموظفيه بكيفية استخدام بياناتهم.",
          "نعالج بيانات العميل فقط لتقديم الخدمة وتأمينها ودعمها ووفق تعليمات العميل، كما توضح سياسة الخصوصية [واتفاقية معالجة البيانات].",
          "يستطيع العميل تصدير التقارير بصيغ CSV وExcel وPDF طوال فترة وصوله إلى الخدمة، وعليه الاحتفاظ بنسخه الخاصة من السجلات التي يلزمه النظام بحفظها.",
          "بعد انتهاء الخدمة نتيح بيانات العميل للتصدير لمدة [عدد] يومًا ثم نحذفها، ما لم يلزمنا النظام بالاحتفاظ بها أو تنص الاتفاقية التجارية على غير ذلك.",
        ],
      },
      { type: "h2", text: "7. الضريبة والفواتير والمدفوعات" },
      {
        type: "p",
        text: "تساعد الخدمة على احتساب الأسعار والضريبة وإصدار الإيصالات وفق الإعدادات التي يختارها العميل، مثل النظام الضريبي ونسبة الضريبة لكل صنف وما إذا كانت الأسعار شاملة للضريبة. ويبقى العميل وحده مسؤولًا عن تسجيله الضريبي وصحة هذه الإعدادات والفواتير التي يصدرها وإقراراته لدى الجهة الضريبية.",
      },
      {
        type: "ul",
        items: [
          "للفروع في السعودية، تطبع الخدمة فواتير ضريبية مبسطة تحمل رمز QR المطلوب في المرحلة الأولى من الفوترة الإلكترونية لدى هيئة الزكاة والضريبة والجمارك. أما الربط مع منصة «فاتورة» (المرحلة الثانية) فغير مشمول، وعلى العميل الخاضع للمرحلة الثانية أو الذي يصبح خاضعًا لها ترتيب تكامل أو مزوّد مستقل متوافق.",
          "للفروع في الهند، تُقدَّم إعدادات ضريبة السلع والخدمات (GST) وتنسيقات الإيصالات كأدوات، وعلى العميل التأكد من مطابقتها لالتزاماته.",
          "تسجّل الخدمة المدفوعات التي يستلمها الموظفون عبر أجهزة الدفع والمحافظ الخاصة بالعميل أو نقدًا، ولا تتضمن بوابة دفع، ولا نحتفظ بأي أموال أو نحوّلها.",
        ],
      },
      {
        type: "p",
        text: "لا يُعد أي شيء في الخدمة أو الموقع أو الدعم الذي نقدمه استشارة ضريبية؛ فتحقق من التزاماتك مع الجهة الضريبية أو مستشار مؤهل.",
      },
      { type: "h2", text: "8. توفر الخدمة والتغييرات والدعم" },
      {
        type: "p",
        text: "نعمل على إبقاء الخدمة متاحة وموثوقة، لكننا لا نضمن أي نسبة تشغيل ما لم يُنص على مستوى خدمة في الاتفاقية التجارية. وتعتمد الخدمة على الإنترنت وعلى أجهزة العميل وشبكته وعلى بنية تحتية لأطراف أخرى (منها Cloudflare)، وقد تتوقف للصيانة أو التحديث أو لأسباب خارجة عن إرادتنا. لذا ينبغي للعميل الاحتفاظ بإجراء بديل بسيط، مثل تسجيل الطلبات يدويًا، عند الانقطاع.",
      },
      {
        type: "p",
        text: "قد نطوّر المزايا أو نغيّرها أو نزيلها، وسنحرص على تجنب التغييرات التي تقلل الوظائف الأساسية بشكل جوهري خلال فترة مدفوعة، وعلى الإشعار المعقول بالتغييرات المهمة. والأجهزة مثل الطابعات والشاشات وأجهزة الدفع مسؤولية العميل، وينبغي التأكد من توافقها قبل الشراء. وتحدد الاتفاقية التجارية قنوات الدعم وأوقاته.",
      },
      { type: "h2", text: "9. خدمات الأطراف الأخرى" },
      {
        type: "p",
        text: "قد تتصل الخدمة بخدمات لا نتحكم بها، مثل مزوّدي إرسال البريد وأجهزة الدفع وشركاء التوصيل أو الأنظمة التي يربطها العميل عبر واجهة التكامل البرمجية أو Webhooks أو خادم MCP، ويخضع استخدامها لشروطها الخاصة، ولسنا مسؤولين عنها.",
      },
      { type: "h2", text: "10. البرمجيات مفتوحة المصدر" },
      {
        type: "p",
        text: `بُنيت الخدمة على مشروع ${up.name}، وحقوق النشر محفوظة لـ ${up.copyright}، وهو مرخّص بموجب رخصة جنو أفيرو العمومية الإصدار 3 (AGPL-3.0). ووفقًا لهذه الرخصة، فإن الشيفرة المصدرية المقابلة للبرنامج متاحة على ${SOURCE_CODE_URL}. ولا يحدّ أي شيء في هذه الشروط من الحقوق التي تمنحها رخصة AGPL-3.0 في تلك الشيفرة.`,
      },
      {
        type: "p",
        text: "تشمل رخصة AGPL-3.0 الشيفرة البرمجية فقط، ولا تمنح أي حق في اسم «Ahemad's Restro» أو شعاره أو علامته، ولا في الخدمة المستضافة التي نشغّلها، ولا في بيانات العملاء.",
      },
      { type: "h2", text: "11. الملكية الفكرية" },
      {
        type: "p",
        text: "مع مراعاة البند 10، يعود محتوى الموقع وتصميمه واسم Ahemad's Restro وشعاره إلينا أو إلى المرخِّصين لنا. ويحتفظ العميل بجميع حقوقه في محتواه، مثل صور الأصناف وأوصافها، ويمنحنا الحقوق اللازمة لاستضافته وعرضه في الخدمة. وإذا أرسلت إلينا اقتراحات فيجوز لنا استخدامها دون أي التزام تجاهك.",
      },
      { type: "h2", text: "12. إخلاء المسؤولية" },
      {
        type: "p",
        text: "في الحدود التي يسمح بها النظام، يُقدَّم الموقع والخدمة «كما هما» و«حسب التوفر»، ونستبعد أي ضمانات لم تُذكر صراحةً في هذه الشروط أو في الاتفاقية التجارية، ومنها ملاءمتهما لغرض معين. ولا يستبعد أي شيء في هذه الشروط حقوقًا لا يجوز استبعادها نظامًا.",
      },
      { type: "h2", text: "13. حدود المسؤولية" },
      {
        type: "p",
        text: "[بند حدود المسؤولية تصوغه الجهة القانونية، ومثاله: استبعاد الخسائر غير المباشرة والتبعية، ومنها الأرباح والبيانات المفقودة؛ ووضع حد أقصى للمسؤولية الإجمالية، مثل الرسوم التي دفعها العميل خلال [12] شهرًا السابقة للمطالبة، مع إدراج الاستثناءات التي يفرضها النظام الحاكم.]",
      },
      { type: "h2", text: "14. الإيقاف والإنهاء" },
      {
        type: "p",
        text: "يجوز لنا إيقاف الوصول، مع الإشعار متى أمكن ذلك بشكل معقول، إذا استُخدمت الخدمة بما يخالف هذه الشروط، أو لحماية الخدمة أو العملاء الآخرين، أو عند التأخر الجسيم في سداد الرسوم المستحقة بموجب الاتفاقية التجارية. ويجوز لأي طرف إنهاء الخدمة وفق الاتفاقية التجارية. وتبقى البنود 6 و7 و10 و12 و13 و16 سارية بعد الإنهاء.",
      },
      { type: "h2", text: "15. تعديل هذه الشروط" },
      {
        type: "p",
        text: "قد نحدّث هذه الشروط، ويوضح التاريخ في أعلى الصفحة أحدث نسخة. وبالنسبة للتغييرات الجوهرية التي تمس العملاء الحاليين، سنقدم إشعارًا معقولًا قبل سريانها، ويُعد استمرارك في استخدام الخدمة بعد ذلك قبولًا للشروط المحدّثة.",
      },
      { type: "h2", text: "16. النظام الحاكم وتسوية النزاعات" },
      {
        type: "p",
        text: "تخضع هذه الشروط لأنظمة [الاختصاص القضائي]، وتختص محاكم [مكان المحكمة] [اختصاصًا حصريًا] بنظر النزاعات، ما لم تنص الاتفاقية التجارية على وسيلة أخرى لتسوية النزاعات. [على الجهة القانونية التأكد من أي قواعد إلزامية محلية أو أحكام حماية المستهلك التي قد تنطبق.]",
      },
      { type: "h2", text: "17. التواصل" },
      {
        type: "p",
        text: "[اسم الكيان القانوني]، [العنوان المسجل]. الهاتف: ‎+91 8308042362 ‏(Wem Studios). الموقع: https://wemstudios.in/.",
      },
    ],
  },
};
