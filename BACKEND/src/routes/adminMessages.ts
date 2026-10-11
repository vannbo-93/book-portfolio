/** @format */

import { Router } from "express";
import { list, markRead, remove } from "../controllers/messages.js";
import { requireAuth } from "../middleware/auth.js";

// للأدمن فقط: صندوق الرسائل
const router = Router();
router.use(requireAuth);

router.get("/", list);
router.patch("/:id", markRead);
router.delete("/:id", remove);

export default router;
