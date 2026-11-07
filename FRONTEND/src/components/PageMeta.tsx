/** @format */
import { useLocation } from "react-router";
import { BRAND } from "../data/site";
import { useSiteData } from "../data/siteData";

// عنوان تبويب المتصفح لكل صفحة (مثل "Works — USSAIN").
// React 19 ينقل <title> وحده إلى أعلى الصفحة (<head>)، فيكفي أن نرسمه هنا.
// ملاحظة: بطاقات المعاينة (WhatsApp, Facebook, LinkedIn) لا تشغّل JavaScript فلا ترى هذا.
// لها نسخة HTML ثابتة لكل صفحة وكل كتاب، يكتبها scripts/prerender.mjs بعد البناء
// (عنوان ووصف وصورة لكل رابط). إن غيّرت عنوانًا هنا، غيّره هناك أيضًا.

const TITLES: Record<string, string> = {
  "/work": "Works",
  "/about": "About",
  "/services": "Services",
  "/process": "Process",
  "/contact": "Contact",
};

const PageMeta = () => {
  const { pathname } = useLocation();
  const { books } = useSiteData();
  const book = pathname.startsWith("/books/")
    ? books.find((b) => `/books/${b.slug}` === pathname)
    : undefined;
  const page = book?.title ?? TITLES[pathname];
  // الرئيسية: الاسم والوصف. بقية الصفحات: اسم الصفحة ثم الاسم
  const title = page ? `${page} — ${BRAND}` : `${BRAND} — Book Designer`;
  return <title>{title}</title>;
};

export default PageMeta;
