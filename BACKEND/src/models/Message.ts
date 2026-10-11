/** @format */

import { Schema, model } from "mongoose";

// رسالة من نموذج التواصل في الموقع
const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    // هل قرأها الأدمن؟ (لعداد الرسائل الجديدة في لوحة التحكم)
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Message = model("Message", messageSchema);
