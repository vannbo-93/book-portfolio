/** @format */
// الاتصال بالخادم (BACKEND).
// رابطه من متغير VITE_API_URL في ملف FRONTEND/.env (وعلى الاستضافة: في إعدادات المشروع).
// بدونه أثناء التطوير: الخادم على جهازك، المنفذ 4000.
export const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// طلب JSON. credentials: الكوكي (جلسة الأدمن) تُرسل مع الطلب، يحتاجها الداشبورد فقط
export const api = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      // نص JSON فقط (الملفات المرفوعة FormData: المتصفح يضع نوعها بنفسه)
      ...(typeof init?.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok)
    // أخطاء الفحص: أول حقل خاطئ برسالته (مثل "Invalid email") بدل "Invalid data" العامة
    throw new ApiError(
      res.status,
      data?.details?.[0]?.message ??
        data?.message ??
        `Request failed (${res.status})`,
    );
  return data as T;
};
