/** @format */
import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { SITE } from "../layout";
import StatusDot from "./StatusDot";
import {
  AVAILABILITY,
  BRAND,
  CONTACT_URL,
  EMAIL,
  NAV_LINKS as LINKS,
} from "../data/site";

// ثلاثة أجزاء مستقلة على عرض الصفحة:
//   يسار: USSAIN، وبجانبه حالة التوفر (هل يقبل مشاريع جديدة الآن)
//   وسط:  ما يبحث عنه العميل: الأعمال، الخدمات، طريقة العمل، من هو
//   يمين: زر "Start a project" يأخذ العميل مباشرة إلى صفحة التواصل
// على الهاتف: الاسم يسارًا وزر القائمة يمينًا، وداخل القائمة الروابط والبريد والزر

// لون الاسم وأيقونة قائمة الهاتف: أسود فوق الصفحة الفاتحة،
// وفاتح فوق الأقسام الداكنة (التي عليها data-nav="dark") حتى لا يختفي
const BRAND_TEXT = "#000";
const BRAND_TEXT_ON_DARK = "#f9fafb";

// ألوان الملف الأصلي
//   paper #f9fafb: النص الفاتح      mut #9ca3af: الروابط غير النشطة
//   ink   #111827: نص الرابط النشط   page #0a0a0f: خلفية قائمة الهاتف
const LINK =
  "block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-[#9ca3af] transition-colors duration-200 " +
  "hover:bg-white/10 hover:text-[#f9fafb] " +
  "aria-[current=page]:bg-white aria-[current=page]:text-[#111827] aria-[current=page]:shadow-[0_1px_4px_rgba(0,0,0,0.25)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// الزر بألوانك كما هي، وتأثير الـ hover: يصغر قليلًا عند المرور عليه
const CTA_BUTTON =
  "items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#9ca3af,#0a0a0f)] text-sm font-semibold text-white " +
  "shadow-[0_2px_8px_rgba(99,102,241,0.45)] transition-transform duration-150 hover:scale-[0.97] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a0a0f] " +
  "motion-reduce:transition-none motion-reduce:hover:scale-100";

// سهم مائل (↗)، يأخذ لون النص
const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // هل تحت الناف بار الآن قسم داكن؟ نفحص النقطة التي يقع فيها الاسم عند كل تمرير
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const under = document.elementsFromPoint(8, 42);
      setOnDark(under.some((el) => el.closest('[data-nav="dark"]')));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);
  const brandColor = onDark ? BRAND_TEXT_ON_DARK : BRAND_TEXT;

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
        {/* يسار: الاسم، وحالة التوفر بجانبه على الشاشات الكبيرة */}
        <div className="flex items-center gap-4 justify-self-start">
          <Link
            to="/"
            onClick={close}
            style={{ color: brandColor }}
            className="pointer-events-auto rounded-md text-[15px] transition-colors duration-300 font-bold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
            {BRAND}
          </Link>
          <p
            className={`hidden items-center gap-2 text-xs font-medium transition-colors duration-300 lg:flex ${
              onDark ? "text-neutral-400" : "text-neutral-500"
            }`}>
            <StatusDot />
            {AVAILABILITY}
          </p>
        </div>

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

        {/* يمين: زر بدء مشروع */}
        <div className="flex items-center justify-self-end">
          <Link
            to={CONTACT_URL}
            className={`${CTA_BUTTON} pointer-events-auto hidden px-4 py-2 md:inline-flex`}>
            Start a project
            <ArrowIcon />
          </Link>

          {/* زر قائمة الهاتف: ثلاثة خطوط تتحول إلى X */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ "--brand": brandColor } as CSSProperties}
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

        {/* قائمة الهاتف: تُغلق عند الضغط على أي رابط.
            فيها كل ما يحتاجه العميل: الروابط، حالة التوفر، البريد، وزر بدء مشروع */}
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
            <div className="mx-4 my-2 h-px bg-white/10" />
            <p className="flex items-center gap-2 px-4 py-1 text-xs font-medium text-[#9ca3af]">
              <StatusDot />
              {AVAILABILITY}
            </p>
            {/* البريد: الضغط عليه يفتح تطبيق البريد في الهاتف مباشرة */}
            <a
              href={`mailto:${EMAIL}`}
              onClick={close}
              className="flex min-h-11 items-center rounded-full px-4 text-[15px] font-medium text-[#f9fafb] transition-colors hover:bg-white/[0.08]">
              {EMAIL}
            </a>
            <Link
              to={CONTACT_URL}
              onClick={close}
              className={`${CTA_BUTTON} mt-1 flex min-h-11`}>
              Start a project
              <ArrowIcon />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
