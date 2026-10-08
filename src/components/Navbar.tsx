/** @format */
import { useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { SITE } from "../layout";

// ثلاثة أجزاء مستقلة على عرض الصفحة:
//   يسار: USSAIN كنص فقط، بلا إطار
//   وسط:  الروابط داخل الكبسولة الزجاجية ("Pill Highlight Navigation Bar" من CodeFronts)
//   يمين: زر Download CV وحده، بلا إطار حوله
// على الهاتف: الاسم يسارًا وزر القائمة يمينًا، والروابط والزر داخل القائمة

type NavItem = { href: string; label: string };

const LINKS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

// ملف السيرة الذاتية: ضعه في مجلد public باسم cv.pdf
const CV_URL = "/cv.pdf";
const CV_FILENAME = "Ussain-CV.pdf";

// لون الاسم وأيقونة قائمة الهاتف. اخترت أنت #000 للاسم، أي أن الصفحة فاتحة،
// فأيقونة القائمة بنفس اللون حتى لا تختفي. إن جعلت الصفحة داكنة، غيّره إلى #f9fafb
const BRAND_TEXT = "#000";

// ألوان الملف الأصلي
//   paper #f9fafb: النص الفاتح      mut #9ca3af: الروابط غير النشطة
//   ink   #111827: نص الرابط النشط   page #0a0a0f: خلفية قائمة الهاتف
const LINK =
  "block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-[#9ca3af] transition-colors duration-200 " +
  "hover:bg-white/10 hover:text-[#f9fafb] " +
  "aria-[current=page]:bg-white aria-[current=page]:text-[#111827] aria-[current=page]:shadow-[0_1px_4px_rgba(0,0,0,0.25)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// الزر بألوانك كما هي، وتأثير الـ hover: يصغر قليلًا عند المرور عليه
const CV_BUTTON =
  "items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#9ca3af,#0a0a0f)] text-sm font-semibold text-white " +
  "shadow-[0_2px_8px_rgba(99,102,241,0.45)] transition-transform duration-150 hover:scale-[0.97] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a0a0f] " +
  "motion-reduce:transition-none motion-reduce:hover:scale-100";

// أيقونة مستخدم بسيطة (رأس وكتفان)، تأخذ لون النص
const UserIcon = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const current = (href: string) => (isActive(href) ? "page" : undefined);

  return (
    // الشريط المحيط شفاف ولا يلتقط الماوس (pointer-events-none)، حتى لا يعيق ما تحته.
    // كل عنصر ظاهر يلتقطه بنفسه (pointer-events-auto)
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 py-5">
      {/* على الشاشة الكبيرة: ثلاثة أعمدة 1fr | auto | 1fr،
          فيلتصق الاسم باليسار والزر باليمين، وتبقى الكبسولة في المنتصف تمامًا */}
      <nav
        aria-label="Main"
        className={`${SITE} relative flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]`}>
        {/* يسار: الاسم فقط */}
        <Link
          to="/"
          onClick={close}
          style={{ color: BRAND_TEXT }}
          className="pointer-events-auto justify-self-start rounded-md text-[15px] font-bold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
          USSAIN
        </Link>

        {/* وسط: الروابط داخل الكبسولة الزجاجية */}
        <ul className="pointer-events-auto hidden list-none items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md md:flex">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                aria-current={current(item.href)}
                className={LINK}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* يمين: الزر وحده */}
        <div className="flex items-center justify-self-end">
          {/* <a download> لا <Link>: الملف يُحمَّل ولا يُعامَل كصفحة داخل الموقع */}
          <a
            href={CV_URL}
            download={CV_FILENAME}
            className={`${CV_BUTTON} pointer-events-auto hidden px-4 py-2 md:inline-flex`}>
            <UserIcon />
            Download CV
          </a>

          {/* زر قائمة الهاتف: ثلاثة خطوط تتحول إلى X */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ "--brand": BRAND_TEXT } as CSSProperties}
            className="pointer-events-auto flex size-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-current md:hidden">
            <span
              className={`block h-px w-5 rounded-sm bg-[var(--brand)] transition-transform duration-300 motion-reduce:transition-none ${
                open ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 rounded-sm bg-[var(--brand)] transition-opacity duration-300 motion-reduce:transition-none ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-5 rounded-sm bg-[var(--brand)] transition-transform duration-300 motion-reduce:transition-none ${
                open ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* قائمة الهاتف: تُغلق عند الضغط على أي رابط، وفيها زر السيرة الذاتية أيضًا */}
        {open && (
          <div
            id="mobile-menu"
            className="pointer-events-auto absolute inset-x-4 top-[calc(100%+10px)] sm:inset-x-8 grid rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md md:hidden">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={close}
                aria-current={current(item.href)}
                className="flex min-h-11 items-center rounded-full px-4 text-[15px] font-medium text-[#9ca3af] transition-colors hover:bg-white/[0.08] hover:text-[#f9fafb] aria-[current=page]:text-[#f9fafb]">
                {item.label}
              </Link>
            ))}
            <a
              href={CV_URL}
              download={CV_FILENAME}
              onClick={close}
              className={`${CV_BUTTON} mt-1 flex min-h-11`}>
              <UserIcon />
              Download CV
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
