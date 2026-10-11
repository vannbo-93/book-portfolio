/** @format */

import { Router } from "express";
import { getPublished, listPublished } from "../controllers/books.js";

// للزوار: الكتب المنشورة فقط
const router = Router();
router.get("/", listPublished);
router.get("/:slug", getPublished);

export default router;
