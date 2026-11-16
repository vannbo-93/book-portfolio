/** @format */

// تصنيفات الكتب: فلتر صفحة Works، وخانات الاختيار في صفحة الكتاب بلوحة التحكم.
// key: يُحفظ مع الكتاب ويظهر في الرابط (/work?category=business). لا تغيّره بعد الاستعمال،
//      وإلا تفقد الكتب تصنيفها (غيّر label فقط إن أردت اسمًا آخر).
// label: الاسم الظاهر للزوار.
// لإضافة تصنيف: سطر جديد هنا فقط (حروف إنجليزية صغيرة وشرطات في key)، ثم اختره للكتب في لوحة التحكم.
// التصنيف الذي لا يحتوي كتابًا منشورًا لا يظهر في الفلتر.
// مبنية على نوع الكتاب (ما يحتاج العميل تصميمه)، لا على موضوعه.
export const BOOK_CATEGORIES = [
  { key: "journals", label: "Journals" },
  { key: "workbooks", label: "Workbooks" },
  { key: "guides-ebooks", label: "Guides & Ebooks" },
  { key: "nonfiction", label: "Nonfiction Books" },
] as const;
