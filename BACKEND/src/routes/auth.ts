/** @format */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { changePassword, login, logout, me } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// حماية من تخمين كلمة السر: 10 محاولات دخول كل 15 دقيقة لكل عنوان IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts, try again in 15 minutes" },
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/password", requireAuth, changePassword);

export default router;
