/** @format */

import { Router } from "express";
import {
  create,
  listAll,
  remove,
  reorder,
  update,
} from "../controllers/content.js";
import {
  getPublic as getSettings,
  update as updateSettings,
} from "../controllers/settings.js";
import { requireAuth } from "../middleware/auth.js";

// للأدمن فقط: إدارة المحتوى والإعدادات
const router = Router();
router.use(requireAuth);

router.get("/settings", getSettings);
router.patch("/settings", updateSettings);

router.get("/content/:type", listAll);
router.post("/content/:type", create);
// قبل /:id حتى لا تُفهم "order" كمعرّف
router.put("/content/:type/order", reorder);
router.patch("/content/:type/:id", update);
router.delete("/content/:type/:id", remove);

export default router;
