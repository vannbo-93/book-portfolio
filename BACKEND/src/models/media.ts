/** @format */

import { Schema } from "mongoose";

// ملف محفوظ على Cloudinary (صورة أو فيديو)، مشترك بين كل أنواع المحتوى
export const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // لحذفه من Cloudinary
    resourceType: { type: String, enum: ["image", "video"], default: "image" },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    alt: { type: String, default: "", trim: true }, // وصف لقارئات الشاشة ومحركات البحث
  },
  { _id: false },
);
