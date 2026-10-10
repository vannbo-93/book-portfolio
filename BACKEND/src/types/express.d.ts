/** @format */

// نضيف إلى طلب Express حقل admin: يضعه requireAuth بعد التحقق من الجلسة
declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; email: string };
    }
  }
}

export {};
