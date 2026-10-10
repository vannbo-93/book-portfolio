/** @format */
import { useLocation } from "react-router";
import { BRAND } from "../data/site";
import { books } from "../data/books";

// عنوان تبويب المتصفح لكل صفحة (مثل "Works — USSAIN").
// React 19 ينقل <title> وحده إلى أعلى الصفحة (<head>)، فيكفي أن نرسمه هنا.
// ملاحظة: بطاقة المعاينة في فيسبوك ولينكدإن لا تقرأ هذا (لا تشغّل JavaScript)،
// بل تقرأ الوسوم الثابتة في index.html، وهي واحدة للموقع كله.

const TITLES: Record<string, string> = {
  "/work": "Works",
  "/about": "About",
  "/services": "Services",
  "/process": "Process",
  "/contact": "Contact",
};

const PageMeta = () => {
  const { pathname } = useLocation();
  const book = pathname.startsWith("/books/")
    ? books.find((b) => `/books/${b.slug}` === pathname)
    : undefined;
  const page = book?.title ?? TITLES[pathname];
  // الرئيسية: الاسم والوصف. بقية الصفحات: اسم الصفحة ثم الاسم
  const title = page ? `${page} — ${BRAND}` : `${BRAND} — Book Designer`;
  return <title>{title}</title>;
};

export default PageMeta;
