/** @format */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import healthRoutes from "./routes/health.js";

// تطبيق Express: الإعدادات والمسارات (بدون تشغيل الخادم، حتى يمكن اختباره وحده)
const app = express();

// حماية أساسية عبر ترويسات HTTP
app.use(helmet());
// الطلبات تُقبل من الواجهة فقط، مع الكوكيز (لتسجيل دخول الأدمن لاحقًا)
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
// قراءة JSON في الطلبات (حد أقصى صغير: الصور لا تمر من هنا بل تُرفع مباشرة)
app.use(express.json({ limit: "1mb" }));

// ===== المسارات =====
app.use("/api/health", healthRoutes);

// رابط غير موجود، ثم معالجة كل الأخطاء (يجب أن يكونا آخر شيء)
app.use(notFound);
app.use(errorHandler);

export default app;
