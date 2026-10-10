/** @format */

import type { RequestHandler } from "express";
import { z } from "zod";
import { Admin, checkPassword, hashPassword } from "../models/Admin.js";
import { AppError } from "../middleware/error.js";
import { COOKIE_NAME, cookieOptions, signToken } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1),
});

// POST /api/auth/login
export const login: RequestHandler = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const admin = await Admin.findOne({ email }).select("+passwordHash");
  // نفس الرسالة إن كان البريد أو كلمة السر خطأ: لا نكشف أي البريدين موجود
  if (!admin || !(await checkPassword(password, admin.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }
  res.cookie(COOKIE_NAME, signToken(admin.id, admin.email), cookieOptions());
  res.json({ admin: { id: admin.id, email: admin.email } });
};

// POST /api/auth/logout
export const logout: RequestHandler = (_req, res) => {
  const { maxAge: _ignored, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
  res.json({ ok: true });
};

// GET /api/auth/me: من المسجل الآن؟ (الداشبورد يسأل عند فتحه)
export const me: RequestHandler = (req, res) => {
  res.json({ admin: req.admin });
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10, "Password must be at least 10 characters"),
});

// PATCH /api/auth/password: تغيير كلمة السر (يتطلب الحالية)
export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);
  const admin = await Admin.findById(req.admin!.id).select("+passwordHash");
  if (!admin || !(await checkPassword(currentPassword, admin.passwordHash))) {
    throw new AppError(401, "Current password is incorrect");
  }
  admin.passwordHash = await hashPassword(newPassword);
  await admin.save();
  res.json({ ok: true });
};
