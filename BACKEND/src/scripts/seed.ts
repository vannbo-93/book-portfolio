import { readFileSync } from "node:fs";
import mongoose, { type Model } from "mongoose";
import { connectDB } from "../config/db.js";
import { isProd } from "../config/env.js";
import { Book } from "../models/Book.js";
import { Experience, Faq, Service, Stat, Testimonial } from "../content/models.js";

// محتوى مؤقت للتطوير فقط: نفس الكتب وصور الطبيعة والنصوص التي كانت في ملفات الواجهة،
// حتى يظهر الموقع كاملًا على جهازك قبل أن تُضاف الأعمال الحقيقية من لوحة التحكم.
//
//   npm run seed            يضيف المحتوى المؤقت (فقط للأقسام الفارغة: لا يلمس محتوى حقيقيًا أبدًا)
//   npm run seed -- --clear يحذف المحتوى المؤقت وحده (قبل إضافة المحتوى الحقيقي)
//
// الشهادات المؤقتة تُضاف بلا موافقة (consent: false)، فلا تظهر في الموقع أبدًا: أسماؤها وهمية.

if (isProd) {
  console.error("✗ Seed is for development only (NODE_ENV=production)");
  process.exit(1);
}

type Doc = Record<string, unknown>;
const data = JSON.parse(readFileSync(new URL("./seedData.json", import.meta.url), "utf8")) as Record<string, Doc[]>;

// لكل قسم: نموذجه، والحقول التي تميّز عناصره المؤقتة (لحذفها وحدها عند --clear)
const SECTIONS: [string, Model<any>, string[]][] = [
  ["books", Book, ["slug"]],
  ["faqs", Faq, ["question"]],
  ["services", Service, ["title"]],
  ["testimonials", Testimonial, ["name", "quote"]],
  ["stats", Stat, ["label"]],
  ["experience", Experience, ["role", "place"]],
];

const clear = process.argv.includes("--clear");
await connectDB();

for (const [name, model, keys] of SECTIONS) {
  const items = data[name] ?? [];
  if (clear) {
    const filter = { $or: items.map((it) => Object.fromEntries(keys.map((k) => [k, it[k]]))) };
    const { deletedCount } = await model.deleteMany(filter);
    console.log(`✓ ${name}: removed ${deletedCount} placeholder item(s)`);
  } else if (await model.countDocuments()) {
    console.log(`• ${name}: already has content, skipped`);
  } else {
    await model.insertMany(items);
    console.log(`✓ ${name}: added ${items.length} placeholder item(s)`);
  }
}

await mongoose.disconnect();
