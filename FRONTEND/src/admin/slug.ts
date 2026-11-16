/** @format */

// رابط الكتاب (slug) أثناء الكتابة: يُحوَّل مباشرة إلى الشكل المقبول، فلا تظهر رسالة الخطأ.
// "The Tiny Guide" → "the-tiny-guide" · "Résumé" → "resume" · المسافة والرموز → "-"
// (الشرطة الأخيرة تبقى أثناء الكتابة حتى يمكن كتابة الكلمة التالية، وتُحذف عند الحفظ: slugFinal)
export const slugTyping = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 80);

export const slugFinal = (text: string) => slugTyping(text).replace(/-+$/, "");
