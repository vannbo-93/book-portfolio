/** @format */
// الخدمات: شكل الخدمة هنا، والخدمات نفسها تُضاف وتُعدّل من لوحة التحكم.
// tag: الكلمة الصغيرة أسفل يسار كل خدمة

export interface Service {
  title: string;
  tag: string;
  description: string;
  // 4 صور: الثالثة تظهر أعرض من الباقي
  images: string[];
}

// القائمة نفسها تأتي من الخادم (لوحة التحكم): useSiteData().services

// قسم "ماذا أفعل"
export const WHAT_I_DO =
  "I design books, journals, planners, and workbooks for authors and brands. From the first cover impression to the smallest detail inside, I give every project a consistent look and prepare the files for print and digital use.";
