/** @format */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, isProd } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";

// تطبيق Express: الإعدادات والمسارات (بدون تشغيل الخادم، حتى يمكن اختباره وحده)
const app = express();

// على الإنترنت يكون الخادم خلف وسيط (Render, Railway...): نثق بعنوان الزائر الذي يمرره،
// وإلا يرى حد محاولات الدخول كل الزوار كأنهم زائر واحد
if (isProd) app.set("trust proxy", 1);

// حماية أساسية عبر ترويسات HTTP
app.use(helmet());
// الطلبات تُقبل من الواجهة فقط، مع الكوكيز (جلسة الأدمن)
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
// قراءة JSON في الطلبات (حد أقصى صغير: الصور لا تمر من هنا بل تُرفع مباشرة)
app.use(express.json({ limit: "1mb" }));
// قراءة الكوكيز (جلسة الأدمن)
app.use(cookieParser());

// ===== المسارات =====
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// رابط غير موجود، ثم معالجة كل الأخطاء (يجب أن يكونا آخر شيء)
app.use(notFound);
app.use(errorHandler);

export default app;
