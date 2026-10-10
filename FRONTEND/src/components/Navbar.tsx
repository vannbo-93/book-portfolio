/** @format */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { SITE } from "../layout";
import { books } from "../data/books";
import { BRAND, CITY, EMAIL, NAV_LINKS } from "../data/site";
import { MONO, useClock } from "../hooks/useClock";
import { scrollToTop } from "../lib/scroll";

// ناف بار بأسلوب صحفي بسيط: بلا خلفية ولا إطار ولا أزرار.
//   عمود 1: الاسم بخط كبير
//   عمود 2 و3: الروابط في عمودين، كل عمود رابطان فوق بعض
//   عمود 4: ساعة صاحب الموقع الآن + مدينته
// الروابط والساعة بخط أحادي المسافة (monospace) عريض وصغير، بأحرف كبيرة.
// على الهاتف: الاسم يسارًا وزر القائمة يمينًا.
//
// يختفي للأعلى حين تمرر إلى الأسفل، ويعود فور التمرير إلى الأعلى (وفي أعلى الصفحة يبقى ظاهرًا دائمًا).
// الضغط على الاسم: يعيدك إلى الصفحة الرئيسية من أعلاها (وإن كنت فيها، يصعد بك إلى أعلاها بنعومة).

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

// اللون: أسود فوق الصفحة الفاتحة، وفاتح فوق الأقسام الداكنة (data-nav="dark").
// كل جزء من الناف بار يفحص ما تحته وحده (data-nav-probe)، فيتغير لونه وحده:
// مثلًا حين يغطي لوح أسود نصف الشاشة الأيمن فقط، تصير الساعة فاتحة ويبقى الاسم أسود.
// التلوين عبر data-dark (يضعه الفحص مباشرة على العنصر) وتنسيقات data-dark: في Tailwind
const PROBE = "transition-colors duration-300 data-dark:text-[#f9fafb]";

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const clock = useClock();

  // مخفي؟ (يتغير مع اتجاه التمرير)
  const [hidden, setHidden] = useState(false);

  // عند كل تمرير: لكل جزء من الناف بار، هل تحت منتصفه قسم داكن؟
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      headerRef.current
        ?.querySelectorAll<HTMLElement>("[data-nav-probe]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width) return; // جزء مخفي (مثل أعمدة الروابط على الهاتف)
          const under = document.elementsFromPoint(
            r.left + r.width / 2,
            r.top + r.height / 2,
          );
          // أعلى عنصر تحت النقطة (غير الناف بار نفسه) هو الظاهر فعلًا: إن كان داخل قسم داكن، يصير النص فاتحًا.
          // (لا نفحص كل الطبقات: قسم داكن مغطى بقسم فاتح فوقه لا يُحسب)
          const top = under.find((u) => !headerRef.current?.contains(u));
          el.toggleAttribute("data-dark", !!top?.closest('[data-nav="dark"]'));
        });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    // اتجاه التمرير: لا نتفاعل مع حركات صغيرة جدًا (أقل من 6px) حتى لا يرتعش الناف بار
    let lastY = window.scrollY;
    const direction = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      // في أول 80px من الصفحة: ظاهر دائمًا
      setHidden(delta > 0 && y > 80);
      lastY = y;
    };
    const onScroll = () => {
      schedule();
      direction();
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

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
    // يختفي بالانزلاق للأعلى (لا يختفي والقائمة مفتوحة، ولا حين يصل إليه التركيز بلوحة المفاتيح)
    <header
      ref={headerRef}
      onFocusCapture={() => setHidden(false)}
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 py-4 text-black transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        hidden && !open ? "-translate-y-full" : ""
      }`}>
      {/* أربعة أعمدة متساوية تقريبًا: الاسم أعرض قليلًا */}
      <nav
        aria-label="Main"
        className={`${SITE} relative flex items-center justify-between md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-start md:gap-6`}>
        <Link
          to="/"
          onClick={(e) => {
            close();
            // في الصفحة الرئيسية أصلًا: لا انتقال، بل صعود ناعم إلى أعلاها
            if (pathname === "/") {
              e.preventDefault();
              scrollToTop();
            }
          }}
          aria-label={`${BRAND}, home`}
          data-nav-probe
          className="pointer-events-auto w-fit font-sans text-[28px] transition-colors duration-300 data-dark:text-[#f9fafb] font-medium leading-none tracking-[-0.05em] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current">
          {BRAND}
        </Link>

        {COLUMNS.map((col, i) => (
          <ul
            key={i}
            data-nav-probe
            className={`${MONO} ${PROBE} hidden list-none flex-col md:flex`}>
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
        <p
          data-nav-probe
          className={`${MONO} ${PROBE} hidden flex-col tabular-nums md:flex`}>
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
          data-nav-probe
          className="pointer-events-auto flex size-11 transition-colors duration-300 data-dark:text-[#f9fafb] cursor-pointer flex-col items-center justify-center gap-[5px] focus-visible:outline-1 focus-visible:outline-current md:hidden">
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
