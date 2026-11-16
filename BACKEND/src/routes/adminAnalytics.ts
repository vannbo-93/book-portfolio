/** @format */

import { Router } from "express";
import { report } from "../controllers/analytics.js";
import { requireAuth } from "../middleware/auth.js";

// للأدمن فقط: تقرير الزيارات
const router = Router();
router.use(requireAuth);
router.get("/", report);

export default router;
