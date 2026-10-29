import type { DemoFormCopy } from "@/components/site/demo-form";
import type { SiteLocale } from "@/lib/site/config";

// Site-wide chrome text (header, footer, shared CTAs) in both languages.
// Product facts live in BRAND (packages/types/src/brand.ts).

export interface CommonCopy {
  nav: { features: string; howItWorks: string; screenshots: string; pricing: string; faq: string; blog: string; solutions: string };
  cta: { demo: string; features: string; signIn: string; contact: string };
  switchLanguage: string;
  switchLanguageLabel: string;
  skipToContent: string;
  menu: string;
  footer: {
    overview: string;
    product: string;
    solutions: string;
    company: string;
    contact: string;
    phone: string;
    website: string;
    privacy: string;
    terms: string;
    rights: string;
    attribution: string;
    builtOn: string;
    sourceCode: string;
    license: string;
  };
  cookie: { text: string; accept: string; decline: string; policy: string };
}

export const COMMON: Record<SiteLocale, CommonCopy> = {
  en: {
    nav: {
      features: "Features",
      howItWorks: "How it works",
      screenshots: "Screenshots",
      pricing: "Pricing",
      faq: "FAQ",
      blog: "Blog",
      solutions: "Solutions",
    },
    cta: { demo: "Request a Demo", features: "Explore Features", signIn: "Sign in", contact: "Contact Wem Studios" },
    switchLanguage: "العربية",
    switchLanguageLabel: "اقرأ هذه الصفحة بالعربية",
    skipToContent: "Skip to content",
    menu: "Menu",
    footer: {
      overview:
        "Restaurant management software for orders, tables, kitchen, billing and reports — in English and Arabic, with Saudi Riyal and VAT support.",
      product: "Product",
      solutions: "Solutions",
      company: "Company",
      contact: "Contact",
      phone: "Phone",
      website: "Website",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved.",
      attribution: "Designed & Developed by Wem Studios",
      builtOn: "Built on the open-source Nodedr OrderRestro",
      sourceCode: "Source code",
      license: "AGPL-3.0",
    },
    cookie: {
      text: "We use optional analytics cookies to understand how visitors use this site. No analytics run unless you accept.",
      accept: "Accept analytics",
      decline: "Decline",
      policy: "Privacy Policy",
    },
  },
  ar: {
    nav: {
      features: "المزايا",
      howItWorks: "كيف يعمل",
      screenshots: "لقطات الشاشة",
      pricing: "الأسعار",
      faq: "الأسئلة الشائعة",
      blog: "المدونة",
      solutions: "الحلول",
    },
    cta: { demo: "اطلب عرضًا تجريبيًا", features: "استكشف المزايا", signIn: "تسجيل الدخول", contact: "تواصل مع Wem Studios" },
    switchLanguage: "English",
    switchLanguageLabel: "Read this page in English",
    skipToContent: "انتقل إلى المحتوى",
    menu: "القائمة",
    footer: {
      overview:
        "برنامج لإدارة المطاعم يشمل الطلبات والطاولات والمطبخ والفواتير والتقارير، باللغتين العربية والإنجليزية، مع دعم الريال السعودي وضريبة القيمة المضافة.",
      product: "المنتج",
      solutions: "الحلول",
      company: "الشركة",
      contact: "التواصل",
      phone: "الهاتف",
      website: "الموقع",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      rights: "جميع الحقوق محفوظة.",
      attribution: "تصميم وتطوير Wem Studios",
      builtOn: "مبني على المشروع مفتوح المصدر Nodedr OrderRestro",
      sourceCode: "الشيفرة المصدرية",
      license: "AGPL-3.0",
    },
    cookie: {
      text: "نستخدم ملفات تعريف ارتباط تحليلية اختيارية لفهم كيفية استخدام الزوار لهذا الموقع، ولا يعمل أي تحليل إلا بعد موافقتك.",
      accept: "قبول التحليلات",
      decline: "رفض",
      policy: "سياسة الخصوصية",
    },
  },
};

export const DEMO_FORM: Record<SiteLocale, DemoFormCopy> = {
  en: {
    name: "Your name",
    email: "Business e-mail",
    phone: "Phone number",
    company: "Restaurant or company",
    country: "Country",
    branches: "Number of branches",
    branchOptions: { "1": "1 branch", "2-5": "2–5 branches", "6-20": "6–20 branches", "21+": "21 or more" },
    message: "What would you like to see?",
    messagePlaceholder: "For example: dine-in with QR ordering, a kitchen display for two stations, Arabic receipts…",
    submit: "Request a Demo",
    sending: "Sending…",
    successTitle: "Thank you — we've received your request",
    successBody: "Wem Studios will contact you shortly to arrange your demo.",
    errorGeneric: "Your request could not be sent. Please try again, or call us.",
    errorRate: "Too many attempts. Please wait a minute and try again.",
    errorInvalid: "Please check the highlighted fields.",
    privacy: "How we use your details",
    required: "Fields marked * are required. We use your details only to answer this request.",
  },
  ar: {
    name: "الاسم",
    email: "البريد الإلكتروني للعمل",
    phone: "رقم الجوال",
    company: "اسم المطعم أو الشركة",
    country: "الدولة",
    branches: "عدد الفروع",
    branchOptions: { "1": "فرع واحد", "2-5": "من 2 إلى 5 فروع", "6-20": "من 6 إلى 20 فرعًا", "21+": "21 فرعًا أو أكثر" },
    message: "ما الذي تودّ رؤيته؟",
    messagePlaceholder: "مثال: خدمة محلية مع الطلب عبر QR، وشاشة مطبخ لمحطتين، وإيصالات بالعربية…",
    submit: "اطلب عرضًا تجريبيًا",
    sending: "جارٍ الإرسال…",
    successTitle: "شكرًا لك، استلمنا طلبك",
    successBody: "سيتواصل معك فريق Wem Studios قريبًا لترتيب العرض التجريبي.",
    errorGeneric: "تعذّر إرسال طلبك. حاول مرة أخرى أو اتصل بنا.",
    errorRate: "محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.",
    errorInvalid: "يرجى مراجعة الحقول المحددة.",
    privacy: "كيف نستخدم بياناتك",
    required: "الحقول المميزة بـ * مطلوبة. نستخدم بياناتك فقط للرد على هذا الطلب.",
  },
};
