/** @format */

import { Schema, model } from "mongoose";

// رسالة من نموذج التواصل في الموقع
const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    // تفاصيل المشروع (اختيارية في النموذج): تساعد المصممة على الرد بعرض مناسب من أول رسالة
    format: { type: String, default: "", trim: true }, // طباعة / إلكتروني / الاثنان
    length: { type: String, default: "", trim: true }, // عدد الصفحات تقريبًا
    timeline: { type: String, default: "", trim: true }, // متى يحتاجه
    // هل قرأها الأدمن؟ (لعداد الرسائل الجديدة في لوحة التحكم)
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Message = model("Message", messageSchema);
