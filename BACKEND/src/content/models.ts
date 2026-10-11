/** @format */

import { Schema, model } from "mongoose";
import { mediaSchema } from "../models/media.js";

// قوائم المحتوى القابلة للتعديل من لوحة التحكم.
// كل عنصر له: order (ترتيب الظهور، الأصغر أولًا) و visible (إخفاء دون حذف)
const base = {
  order: { type: Number, default: 0, index: true },
  visible: { type: Boolean, default: true },
};
const opts = { timestamps: true };

// الأغلفة الحصرية (الشريط المتحرك)
export const Cover = model(
  "Cover",
  new Schema(
    {
      ...base,
      title: { type: String, default: "", trim: true },
      image: { type: mediaSchema, required: true },
    },
    opts,
  ),
);

// آراء العملاء. consent: هل وافق صاحبها على النشر؟ بدونها لا تظهر في الموقع أبدًا
export const Testimonial = model(
  "Testimonial",
  new Schema(
    {
      ...base,
      quote: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
      role: { type: String, default: "", trim: true },
      photo: { type: mediaSchema, default: null },
      consent: { type: Boolean, default: false },
    },
    opts,
  ),
);

// الأسئلة الشائعة
export const Faq = model(
  "Faq",
  new Schema(
    {
      ...base,
      question: { type: String, required: true, trim: true },
      tag: { type: String, default: "", trim: true },
      answer: { type: String, required: true, trim: true },
    },
    opts,
  ),
);

// الخدمات (4 صور لكل خدمة: الثالثة تظهر أعرض)
export const Service = model(
  "Service",
  new Schema(
    {
      ...base,
      title: { type: String, required: true, trim: true },
      tag: { type: String, default: "", trim: true },
      description: { type: String, default: "", trim: true },
      images: { type: [mediaSchema], default: [] },
    },
    opts,
  ),
);

// الأرقام (THE ADVANTAGE): value يعدّ من 0 إليه، و suffix بعده (+ أو %)
export const Stat = model(
  "Stat",
  new Schema(
    {
      ...base,
      value: { type: Number, required: true },
      suffix: { type: String, default: "", trim: true },
      label: { type: String, required: true, trim: true },
    },
    opts,
  ),
);

// سجل الخبرة (صفحة About)
export const Experience = model(
  "Experience",
  new Schema(
    {
      ...base,
      role: { type: String, required: true, trim: true },
      type: { type: String, default: "", trim: true }, // Freelance / Full-time
      place: { type: String, required: true, trim: true },
      years: { type: String, default: "", trim: true }, // مثل: ('22–'24)
    },
    opts,
  ),
);
