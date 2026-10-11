/** @format */

// تحويل العنوان إلى slug صالح للرابط: "The Silent Sea!" → "the-silent-sea"
// الأحرف غير اللاتينية (مثل العربية) تُحذف، فإن بقي الناتج فارغًا يجب كتابة slug يدويًا
export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // é → e
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
