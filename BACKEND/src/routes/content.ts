/** @format */

import { Router } from "express";
import { getAllPublic, listPublic } from "../controllers/content.js";
import { getPublic as getSettings } from "../controllers/settings.js";

// للزوار: المحتوى الظاهر فقط، والإعدادات
const router = Router();
router.get("/content", getAllPublic);
router.get("/content/:type", listPublic);
router.get("/settings", getSettings);

export default router;
