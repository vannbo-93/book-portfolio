/** @format */

import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { isProd } from "../config/env.js";

// خطأ مقصود برقم HTTP ورسالة (مثل 404 "Book not found")
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// رابط غير موجود في الـ API
export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// كل الأخطاء تصل إلى هنا، وتُرسل للواجهة بنفس الشكل دائمًا: { message, details? }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // بيانات مرسلة غير صحيحة (فحص zod)
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid data",
      details: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }
  // معرّف قاعدة بيانات غير صالح (مثل /books/123)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid ${err.path}` });
    return;
  }
  // قيمة مكررة في حقل فريد (مثل slug موجود مسبقًا)
  if (err?.code === 11000) {
    res
      .status(409)
      .json({
        message: `Already exists: ${Object.keys(err.keyValue ?? {}).join(", ")}`,
      });
    return;
  }
  // مشكلة في الملف المرفوع (حجم كبير، عدد كبير من الملفات...)
  if (err instanceof multer.MulterError) {
    const messages: Partial<Record<multer.ErrorCode, string>> = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_UNEXPECTED_FILE: `Unexpected field: ${err.field}`,
    };
    res
      .status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400)
      .json({ message: messages[err.code] ?? err.message });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  // خطأ غير متوقع: تفاصيله في السجل فقط، والزائر يرى رسالة عامة (لا نكشف تفاصيل الخادم)
  console.error(err);
  res
    .status(500)
    .json({ message: isProd ? "Server error" : (err as Error).message });
};
