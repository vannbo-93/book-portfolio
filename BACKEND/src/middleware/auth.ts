import type { CookieOptions, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";
import { AppError } from "./error.js";

// الجلسة: رمز JWT موقّع يُحفظ في كوكي httpOnly.
// httpOnly: كود JavaScript في المتصفح لا يستطيع قراءته، فلا يسرقه أي سكربت خبيث (XSS)
export const COOKIE_NAME = "admin_token";

interface TokenPayload {
  sub: string; // معرّف الأدمن
  email: string;
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

export const signToken = (id: string, email: string) =>
  jwt.sign({ sub: id, email } satisfies TokenPayload, env.JWT_SECRET, { expiresIn: `${env.SESSION_DAYS}d` });

// يحمي المسارات: بدون جلسة صالحة → 401
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next(new AppError(401, "Not authenticated"));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError(401, "Session expired, please log in again"));
  }
};
