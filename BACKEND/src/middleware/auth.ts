import type { CookieOptions, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";
import { AppError } from "./error.js";
import { Admin } from "../models/Admin.js";

// الجلسة: رمز JWT موقّع يُحفظ في كوكي httpOnly.
// httpOnly: كود JavaScript في المتصفح لا يستطيع قراءته، فلا يسرقه أي سكربت خبيث (XSS)
export const COOKIE_NAME = "admin_token";

interface TokenPayload {
  sub: string; // معرّف الأدمن
  email: string;
  v?: number; // رقم نسخة الجلسات (sessionVersion) لحظة الدخول. الجلسات القديمة بلا رقم = 0
}

const maxAge = () => env.SESSION_DAYS * 24 * 60 * 60 * 1000;

export const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  // على الإنترنت: الواجهة (ussainisawi.com) والخادم (api.ussainisawi.com) على نفس الموقع،
  // فيكفي lax، وهو أأمن من none ولا يحجبه Safari. secure: عبر HTTPS فقط.
  secure: isProd,
  sameSite: "lax",
  maxAge: maxAge(),
  path: "/",
});

export const signToken = (id: string, email: string, sessionVersion: number) =>
  jwt.sign({ sub: id, email, v: sessionVersion } satisfies TokenPayload, env.JWT_SECRET, {
    expiresIn: `${env.SESSION_DAYS}d`,
  });

// يحمي المسارات: بدون جلسة صالحة → 401
// الجلسة صالحة إن كان توقيعها سليمًا، والأدمن ما زال موجودًا،
// ورقم نسختها يطابق رقمه الحالي (أي لم تتغير كلمة السر بعد الدخول)
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError(401, "Not authenticated");
  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new AppError(401, "Session expired, please log in again");
  }
  const admin = await Admin.findById(payload.sub).select("email sessionVersion").lean();
  if (!admin || (admin.sessionVersion ?? 0) !== (payload.v ?? 0)) {
    throw new AppError(401, "Session expired, please log in again");
  }
  req.admin = { id: payload.sub, email: admin.email };
  next();
};
