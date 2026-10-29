import type { SiteLocale } from "@/lib/site/config";

export const BLOG_INDEX: Record<
  SiteLocale,
  { metaTitle: string; metaDescription: string; h1: string; intro: string; read: string; minutes: string; empty: string; back: string; published: string; updated: string }
> = {
  en: {
    metaTitle: "Restaurant Software Guides & Insights | Ahemad's Restro Blog",
    metaDescription: "Practical guides on restaurant POS, QR ordering, kitchen display systems and running restaurants in Saudi Arabia and India.",
    h1: "Restaurant software guides",
    intro: "Practical, vendor-honest guides for restaurant owners choosing and running restaurant technology.",
    read: "Read the guide",
    minutes: "{n} min read",
    empty: "New guides are on the way.",
    back: "All guides",
    published: "Published",
    updated: "Updated",
  },
  ar: {
    metaTitle: "أدلة برامج المطاعم ونصائح التشغيل | مدونة Ahemad's Restro",
    metaDescription: "أدلة عملية عن أنظمة نقاط البيع للمطاعم والطلب عبر QR وشاشات المطبخ وتشغيل المطاعم في السعودية.",
    h1: "أدلة برامج المطاعم",
    intro: "أدلة عملية وصريحة لأصحاب المطاعم عند اختيار التقنيات وتشغيلها.",
    read: "اقرأ الدليل",
    minutes: "{n} دقائق قراءة",
    empty: "أدلة جديدة قادمة قريبًا.",
    back: "كل الأدلة",
    published: "نُشر في",
    updated: "حُدّث في",
  },
};
