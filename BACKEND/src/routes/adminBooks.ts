/** @format */

import { Router } from "express";
import {
  create,
  getOne,
  listAll,
  remove,
  reorder,
  update,
} from "../controllers/books.js";
import { requireAuth } from "../middleware/auth.js";

// للأدمن فقط: إدارة الكتب
const router = Router();
router.use(requireAuth);

router.get("/", listAll);
router.post("/", create);
// قبل /:id حتى لا تُفهم "order" كمعرّف
router.put("/order", reorder);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
