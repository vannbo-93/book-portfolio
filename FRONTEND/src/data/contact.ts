/** @format */
// محتوى قسم التواصل. العنوان والنص مؤقتان (من القالب) إلى أن تغيّرهما.
export const CONTACT_TEXT = {
  label: "Contact",
  side: "Inquiry",
  heading: "Say Hello",
  intro:
    "Every connection begins with a conversation. Share your vision with us, and together we'll create something that lasts",
};

// خيارات "الموضوع": أسماء الخدمات (من لوحة التحكم) ثم هذا الخيار الأخير
export const GENERAL_TOPIC = "General question";

// تفاصيل المشروع (اختيارية): تظهر لكل موضوع ما عدا "سؤال عام".
// تساعد المصممة على الرد بعرض مناسب من أول رسالة، دون أسعار ولا حجز.
// لتغيير الخيارات: عدّل القوائم هنا فقط (الخادم يقبل أي نص قصير)
export const PROJECT_DETAILS = [
  {
    name: "format",
    label: "Format",
    options: ["Print", "Ebook", "Print + ebook", "Not sure yet"],
  },
  {
    name: "length",
    label: "Length",
    options: ["Under 100 pages", "100–250 pages", "250+ pages", "Not sure yet"],
  },
  {
    name: "timeline",
    label: "Timeline",
    options: ["Flexible", "Within a month", "1–3 months", "3+ months"],
  },
] as const;
