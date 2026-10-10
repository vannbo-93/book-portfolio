/** @format */

import { Router } from "express";
import { deleteFile, uploadFiles } from "../controllers/uploads.js";
import { requireAuth } from "../middleware/auth.js";
import { MAX_FILES, upload } from "../middleware/upload.js";

// كل مسارات الرفع للأدمن فقط
const router = Router();
router.use(requireAuth);

router.post("/", upload.array("files", MAX_FILES), uploadFiles);
router.delete("/", deleteFile);

export default router;
