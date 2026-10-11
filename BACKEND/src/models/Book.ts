/** @format */

import { Schema, model, type InferSchemaType } from "mongoose";

// صورة محفوظة على Cloudinary (الغلاف أو صفحة مزدوجة)
const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // لحذفها من Cloudinary عند حذفها من الكتاب
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    alt: { type: String, default: "", trim: true }, // وصف الصورة لقارئات الشاشة ومحركات البحث
  },
  { _id: false },
);

export const BOOK_STATUSES = ["draft", "published"] as const;

// كتاب في معرض الأعمال
const bookSchema = new Schema(
  {
    // الجزء الأخير من الرابط: /books/mountains
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    // نبذة عن المشروع: كل عنصر فقرة
    description: { type: [String], default: [] },
    // تفاصيل المشروع (اختيارية): الفارغ لا يظهر في الموقع
    client: { type: String, default: "", trim: true },
    services: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    // المسودة لا تُكتب بالكامل دفعة واحدة، لذلك الغلاف ليس إلزاميًا هنا (يُفحص عند النشر)
    cover: { type: imageSchema, default: null },
    spreads: { type: [imageSchema], default: [] },
    // ترتيب الظهور في الموقع: الأصغر أولًا
    order: { type: Number, default: 0, index: true },
    // draft: يراه الأدمن فقط. published: يظهر للزوار
    status: {
      type: String,
      enum: BOOK_STATUSES,
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

export type BookDoc = InferSchemaType<typeof bookSchema>;
export const Book = model("Book", bookSchema);
