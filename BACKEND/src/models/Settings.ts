import { Schema, model } from "mongoose";
import { mediaSchema } from "./media.js";

// إعدادات الموقع: مستند واحد فقط في قاعدة البيانات (ليست قائمة)
const socialSchema = new Schema(
  { label: { type: String, required: true, trim: true }, href: { type: String, required: true, trim: true } },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    // معلومات التواصل (الناف بار، الفوتر، صفحة Contact)
    email: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true }, // مثل: Based in — Kenitra, Morocco
    responseTime: { type: String, default: "", trim: true }, // مثل: Replies within 48 hours
    // الساعة في الناف بار
    city: { type: String, default: "", trim: true },
    timezone: { type: String, default: "UTC", trim: true }, // مثل: Africa/Casablanca
    // حالة التوفر: نقطة خضراء أو رمادية
    available: { type: Boolean, default: true },
    availableText: { type: String, default: "Available for new projects", trim: true },
    busyText: { type: String, default: "Booked — join the waitlist", trim: true },
    socials: { type: [socialSchema], default: [] },
    // الفيديوهات: MediaExpand في الرئيسية، ولوحتا StackReveal (يسار ويمين)
    videos: {
      reel: { type: mediaSchema, default: null },
      stackLeft: { type: mediaSchema, default: null },
      stackRight: { type: mediaSchema, default: null },
    },
    // صفحات الكتاب الدوّار في أول الرئيسية: أغلفة يختارها المصمم (حتى 12)، مستقلة عن الكتب.
    // فارغة = يأخذ الكتاب أغلفة الكتب المنشورة كما كان
    fanPages: { type: [mediaSchema], default: [] },
  },
  { timestamps: true },
);

export const Settings = model("Settings", settingsSchema);
