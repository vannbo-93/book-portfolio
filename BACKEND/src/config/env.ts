/** @format */

import "dotenv/config";
import { z } from "zod";

// متغيرات البيئة (من ملف .env)، مفحوصة عند تشغيل الخادم:
// إن نقص متغير أو كانت قيمته خاطئة، يتوقف الخادم فورًا برسالة واضحة،
// بدل أن يعمل ثم يفشل لاحقًا في مكان غامض.
const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.url().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // مفتاح توقيع جلسات الأدمن: نص عشوائي طويل وسري (32 حرفًا على الأقل). من يعرفه يستطيع انتحال الأدمن
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  // مدة الجلسة قبل أن يُطلب تسجيل الدخول من جديد (بالأيام)
  SESSION_DAYS: z.coerce.number().int().positive().default(7),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("✗ Invalid environment variables:");
  for (const issue of parsed.error.issues)
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
