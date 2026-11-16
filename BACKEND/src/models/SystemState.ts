/** @format */

import { Schema, model } from "mongoose";

// حالة داخلية للخادم بين مرات إعادة التشغيل، مثل: متى أُرسلت آخر نسخة احتياطية بالبريد.
// خارج النسخة الاحتياطية عمدًا (ليست محتوى الموقع)
const systemStateSchema = new Schema(
  {
    _id: { type: String, required: true }, // اسم الحالة، مثل "autoBackup"
    at: { type: Date, default: null },
    error: { type: String, default: "" }, // آخر خطأ، إن فشلت آخر محاولة
  },
  { timestamps: true },
);

export const SystemState = model("SystemState", systemStateSchema);
