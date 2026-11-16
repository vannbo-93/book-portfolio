/** @format */

import { Schema, model } from "mongoose";

// إحصاءات الزوار: وثيقة واحدة لكل يوم (بتوقيت UTC) فيها أرقام مجمّعة فقط.
// لا يُحفظ أي شيء عن الزائر نفسه (لا IP ولا كوكيز ولا معرّف): فقط "+1" على العدادات.
// لذلك يبقى الحجم صغيرًا جدًا (سنة كاملة ≈ بضع مئات KB) ولا يملأ قاعدة البيانات المجانية.
//
// المفاتيح داخل الخرائط (pages, sources ...) مُرمَّزة بـ encodeKey: MongoDB لا يقبل "." في أسماء الحقول.
const counts = { type: Map, of: Number, default: {} };

const dailyStatSchema = new Schema(
  {
    _id: { type: String, required: true }, // اليوم: "2026-11-16"
    // تاريخ اليوم كـ Date: يحذف MongoDB الأيام الأقدم من 400 يوم تلقائيًا (TTL)
    date: { type: Date, required: true, expires: 400 * 24 * 60 * 60 },
    views: { type: Number, default: 0 }, // كل فتح لصفحة
    visits: { type: Number, default: 0 }, // جلسات: فتح الموقع في تبويب جديد
    visitors: { type: Number, default: 0 }, // زوار مختلفون في هذا اليوم (المتصفح يُحسب مرة في اليوم)
    pages: counts, // "/books/slug" → عدد المشاهدات
    sources: counts, // instagram / google / direct ... → عدد الجلسات
    referrers: counts, // المواقع الأخرى التي جاء منها الزوار (example.com) → عدد الجلسات
    devices: counts, // mobile / desktop / tablet → عدد الزوار
  },
  { versionKey: false },
);

export const DailyStat = model("DailyStat", dailyStatSchema);

export const encodeKey = (key: string) => key.replace(/%/g, "%25").replace(/\./g, "%2E").replace(/^\$/, "%24");
export const decodeKey = (key: string) => decodeURIComponent(key);
