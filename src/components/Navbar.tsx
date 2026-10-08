/** @format */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { SITE } from "../layout";
import { books } from "../data/books";
import { BRAND, CITY, EMAIL, NAV_LINKS } from "../data/site";
import { MONO, useClock } from "../hooks/useClock";

// ناف بار بأسلوب صحفي بسيط: بلا خلفية ولا إطار ولا أزرار.
//   عمود 1: الاسم بخط كبير
//   عمود 2 و3: الروابط في عمودين، كل عمود رابطان فوق بعض
//   عمود 4: ساعة صاحب الموقع الآن + مدينته
// الروابط والساعة بخط أحادي المسافة (monospace) عريض وصغير، بأحرف كبيرة.
// على الهاتف: الاسم يسارًا وزر القائمة يمينًا.

const COLUMNS = [
  [
    { href: "/", label: "Home" },
    { href: "/work", label: "Works", count: books.length }, // [3]: عدد الأعمال، يتحدث وحده من books.ts
  ],
  [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
];

// اللون: أسود فوق الصفحة الفاتحة، وفاتح فوق الأقسام الداكنة (data-nav="dark")
const INK = "#000";
const INK_ON_DARK = "#f9fafb";

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const clock = useClock();

  // هل تحت الناف بار الآن قسم داكن؟ نفحص النقطة التي يقع فيها الاسم عند كل تمرير
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const under = document.elementsFromPoint(8, 36);
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
  const ink = onDark ? INK_ON_DARK : INK;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : // صفحات الكتب جزء من الأعمال، فيبقى WORKS مُعلَّمًا داخلها
        pathname.startsWith(href) ||
        (href === "/work" && pathname.startsWith("/books"));

  // رابط: يظهر تحته خط عند المرور، ويبقى الخط تحت رابط الصفحة الحالية
  const LINK =
    "pointer-events-auto w-fit underline-offset-[3px] decoration-1 hover:underline aria-[current=page]:underline " +
    "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current";

  return (
    // الشريط شفاف ولا يلتقط الماوس، وكل عنصر ظاهر يلتقطه بنفسه
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 py-4 transition-colors duration-300"
      style={{ color: ink }}>
      {/* أربعة أعمدة متساوية تقريبًا: الاسم أعرض قليلًا */}
      <nav
        aria-label="Main"
        className={`${SITE} relative flex items-center justify-between md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-start md:gap-6`}>
        <Link
          to="/"
          onClick={close}
          className="pointer-events-auto w-fit font-sans text-[28px] font-medium leading-none tracking-[-0.05em] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current">
          {BRAND}
        </Link>

        {COLUMNS.map((col, i) => (
          <ul key={i} className={`${MONO} hidden list-none flex-col md:flex`}>
            {col.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={LINK}>
                  {item.label}
                  {"count" in item && (
                    <span className="ml-1">[{item.count}]</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ))}

        {/* الساعة: tabular-nums تثبّت عرض الأرقام فلا يهتز النص كل ثانية */}
        <p className={`${MONO} hidden flex-col tabular-nums md:flex`}>
          <time>{clock}</time>
          <span>{CITY}</span>
        </p>

        {/* زر قائمة الهاتف: خطّان يتحولان إلى X */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="pointer-events-auto flex size-11 cursor-pointer flex-col items-center justify-center gap-[5px] focus-visible:outline-1 focus-visible:outline-current md:hidden">
          <span
            className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${
              open ? "translate-y-[3.25px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${
              open ? "-translate-y-[3.25px] -rotate-45" : ""
            }`}
          />
        </button>

        {/* قائمة الهاتف: كل الصفحات + البريد + الساعة */}
        {open && (
          <div
            id="mobile-menu"
            className="pointer-events-auto absolute inset-x-4 top-[calc(100%+12px)] grid gap-6 rounded-2xl border border-black/10 bg-[#fafaf9] p-5 text-black shadow-[0_16px_40px_rgba(0,0,0,0.15)] sm:inset-x-8 md:hidden">
            <ul className="grid list-none gap-3">
              {[
                { href: "/", label: "Home" },
                ...NAV_LINKS,
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={close}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="font-sans text-2xl font-medium tracking-[-0.03em] underline-offset-4 aria-[current=page]:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div
              className={`${MONO} flex items-end justify-between gap-4 border-t border-black/10 pt-4`}>
              <a
                href={`mailto:${EMAIL}`}
                className="normal-case underline underline-offset-[3px]">
                {EMAIL}
              </a>
              <p className="flex flex-col text-right tabular-nums">
                <time>{clock}</time>
                <span>{CITY}</span>
              </p>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
