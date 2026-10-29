import type { SiteLocale } from "@/lib/site/config";

// Plan presentation for the pricing section. Commercial prices have not been
// set, so every plan shows "Contact for pricing" (price: null). To publish a
// price later, set `price` (a number) and `interval`; nothing else changes.
// Plan contents describe the same software at different support/scale
// levels — every feature listed exists in the product today.

export interface Plan {
  id: "starter" | "professional" | "multi-branch";
  highlighted?: boolean;
  price: number | null;
  currency: string;
  interval: "month" | "year" | null;
  name: Record<SiteLocale, string>;
  audience: Record<SiteLocale, string>;
  features: Record<SiteLocale, string[]>;
  cta: Record<SiteLocale, string>;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    price: null,
    currency: "SAR",
    interval: null,
    name: { en: "Starter", ar: "الأساسية" },
    audience: { en: "Cafés and small restaurants with one location", ar: "للمقاهي والمطاعم الصغيرة ذات الفرع الواحد" },
    features: {
      en: ["Point of sale and order management", "Menu, tables and QR ordering", "Kitchen display", "Billing, discounts and receipts", "Daily sales reports", "English and Arabic"],
      ar: ["نقطة البيع وإدارة الطلبات", "قائمة الطعام والطاولات والطلب عبر QR", "شاشة المطبخ", "الفواتير والخصومات والإيصالات", "تقارير المبيعات اليومية", "العربية والإنجليزية"],
    },
    cta: { en: "Contact for pricing", ar: "تواصل لمعرفة السعر" },
  },
  {
    id: "professional",
    highlighted: true,
    price: null,
    currency: "SAR",
    interval: null,
    name: { en: "Professional", ar: "الاحترافية" },
    audience: { en: "Busy restaurants that want the full back office", ar: "للمطاعم المزدحمة التي تحتاج الإدارة الكاملة" },
    features: {
      en: ["Everything in Starter", "Inventory, recipes and procurement", "Loyalty points, coupons and gift cards", "Staff roles, shifts and attendance", "Accounting, VAT report and budgets", "Scheduled report e-mails"],
      ar: ["كل ما في الباقة الأساسية", "المخزون والوصفات والمشتريات", "نقاط الولاء والكوبونات وبطاقات الهدايا", "أدوار الموظفين والمناوبات والحضور", "المحاسبة وتقرير الضريبة والميزانيات", "إرسال التقارير بالبريد بشكل مجدول"],
    },
    cta: { en: "Request a custom quote", ar: "اطلب عرض سعر مخصص" },
  },
  {
    id: "multi-branch",
    price: null,
    currency: "SAR",
    interval: null,
    name: { en: "Multi-Branch", ar: "متعددة الفروع" },
    audience: { en: "Restaurant groups and multi-location brands", ar: "لمجموعات المطاعم والعلامات متعددة الفروع" },
    features: {
      en: ["Everything in Professional", "Multiple branches under one account", "Branch switcher and stock transfers", "Branch comparison in accounting", "Integration API, webhooks and MCP", "Onboarding and customisation by Wem Studios"],
      ar: ["كل ما في الباقة الاحترافية", "عدة فروع ضمن حساب واحد", "التنقل بين الفروع ونقل المخزون", "مقارنة الفروع في المحاسبة", "واجهة التكامل وWebhooks وMCP", "الإعداد والتخصيص من Wem Studios"],
    },
    cta: { en: "Talk to us", ar: "تحدث معنا" },
  },
];
