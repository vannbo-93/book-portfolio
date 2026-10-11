/** @format */
// ثوابت الموقع: الاسم والروابط.
// معلومات التواصل (البريد، المدينة، المنطقة الزمنية، التوفر، الحسابات) من لوحة التحكم: useSiteData().settings

export type NavItem = { href: string; label: string };

// روابط الصفحات (بلا Home: الضغط على USSAIN يعيد للرئيسية)
export const NAV_LINKS: NavItem[] = [
  { href: "/work", label: "Work" }, // الأعمال: أول ما يريد العميل رؤيته
  { href: "/services", label: "Services" }, // ماذا يصمم: غلاف، تنسيق داخلي، كتاب إلكتروني...
  { href: "/process", label: "Process" }, // كيف يسير المشروع: المراحل والمدة والتعديلات
  { href: "/about", label: "About" },
];

export const BRAND = "USSAIN";
export const CONTACT_URL = "/contact";
