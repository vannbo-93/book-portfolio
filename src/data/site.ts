/** @format */
// معلومات صاحب الموقع في مكان واحد: الناف بار والفوتر يقرآن منها.
// غيّر القيم هنا مرة واحدة فتتغير في كل الموقع.

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

// ---- قيم مؤقتة: ضع المعلومات الحقيقية لصاحب الموقع ----
export const EMAIL = "hello@example.com";
export const LOCATION = "Based in — City, Country";
export const RESPONSE_TIME = "Replies within 48 hours";
// للساعة في الناف بار: المدينة والمنطقة الزمنية لصاحب الموقع
// (أسماء المناطق الزمنية: "Europe/Paris"، "Africa/Casablanca"، "America/New_York"...)
export const CITY = "City, Country";
export const TIMEZONE = "UTC";

// حالة التوفر: true = يقبل مشاريع جديدة (نقطة خضراء)، false = مشغول (نقطة رمادية)
export const AVAILABLE = true;
export const AVAILABILITY = AVAILABLE
  ? "Available for new projects"
  : "Booked — join the waitlist";

// حسابات التواصل: احذف ما لا يملكه، وضع روابطه الحقيقية.
// Behance وInstagram هما الأهم لمصممي الأغلفة، لأن العملاء والناشرين يبحثون فيهما
export const SOCIALS: NavItem[] = [
  { href: "https://www.behance.net/", label: "Behance" },
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://www.linkedin.com/", label: "LinkedIn" },
  { href: "https://www.goodreads.com/", label: "Goodreads" },
];
