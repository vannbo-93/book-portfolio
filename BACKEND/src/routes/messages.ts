/** @format */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { send } from "../controllers/messages.js";

// للزوار: إرسال رسالة. الحد: 5 رسائل ناجحة في الساعة لكل عنوان IP (حماية من الإزعاج).
// المحاولات المرفوضة (بريد خاطئ مثلًا) لا تُحسب: لا يُعاقب زائر حقيقي أخطأ في الكتابة
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  skipFailedRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many messages, please try again later or email directly",
  },
});

const router = Router();
router.post("/", contactLimiter, send);

export default router;
