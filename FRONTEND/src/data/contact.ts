/** @format */
import { SERVICES } from "./services";

// محتوى قسم التواصل. العنوان والنص مؤقتان (من القالب) إلى أن تغيّرهما.
export const CONTACT_TEXT = {
  label: "Contact",
  side: "Inquiry",
  heading: "Say Hello",
  intro:
    "Every connection begins with a conversation. Share your vision with us, and together we'll create something that lasts",
};

// خيارات "الموضوع": نفس أسماء الخدمات، فإن أضفت خدمة في services.ts تظهر هنا تلقائيًا
export const TOPICS = [...SERVICES.map((s) => s.title), "General question"];
