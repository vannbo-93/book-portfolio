/** @format */
// مقاسات الكتب ونوع عناصر قسم "آخر الأعمال".
// في ملف مستقل لا داخل LatestWorks.tsx، لأن Vite يشترط أن يصدّر ملف المكون مكونات فقط
// (وإلا يتوقف التحديث الفوري Fast Refresh لذلك الملف).

// مقاسات كتب حقيقية بالإنش (العرض × الارتفاع). نسبتها تحدد شكل الغلاف:
// كتاب الجيب طويل، والمربع مربع، وكتاب الصور الأفقي عريض...
export const FORMATS = {
  pocket: { w: 4.25, h: 6.87, label: "Pocket" }, // كتاب جيب (mass-market)
  novel: { w: 5.5, h: 8.5, label: "Novel" }, // رواية (trade paperback)
  standard: { w: 6, h: 9, label: "Standard" }, // المقاس الأكثر شيوعًا
  a5: { w: 5.83, h: 8.27, label: "A5" },
  workbook: { w: 8, h: 10, label: "Workbook" }, // كتب تعليمية ودفاتر
  square: { w: 8.5, h: 8.5, label: "Square" }, // كتب أطفال وصور
  landscape: { w: 11, h: 8.5, label: "Landscape" }, // كتاب صور أفقي (coffee table)
} as const;
export type FormatKey = keyof typeof FORMATS;

export interface LatestItem {
  src: string;
  title: string;
  href: string;
  format: FormatKey;
}
