/** @format */

import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import { track } from "../controllers/analytics.js";

// للزوار: تسجيل فتح صفحة (إحصاءات مجمّعة، انظر controllers/analytics.ts).
// الحد: 120 طلبًا في الدقيقة لكل IP، أي أكثر بكثير من أي زائر حقيقي؛ ما زاد يُتجاهل بصمت
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: false,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(204).end();
  },
});

const router = Router();
// الجسم نص قصير (sendBeacon يرسل text/plain)
router.post("/", trackLimiter, express.text({ type: "*/*", limit: "2kb" }), track);

export default router;
