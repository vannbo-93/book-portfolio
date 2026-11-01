/** @format */

import { Router } from "express";
import {
  create,
  getOne,
  listAll,
  listTrash,
  remove,
  removeForever,
  reorder,
  restore,
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
router.get("/trash", listTrash);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/:id/restore", restore);
router.delete("/:id/permanent", removeForever);

export default router;
