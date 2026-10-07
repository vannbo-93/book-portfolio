/** @format */
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";

const LINKS = [
  { to: "/", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// طبقة الزجاج: شفافية خفيفة + تضبيب خفيف تظهر النقاط من خلاله + حد فاتح + لمعة داخلية في الأعلى + ظل
// مستعملة في الـ navbar وقائمة الهاتف معًا، فيبقى شكلهما واحدًا
const GLASS =
  "border border-white/10 bg-white/[0.03] backdrop-blur-[3px] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]";

// في أعلى الصفحة: شفاف تمامًا. الحد يبقى موجودًا بلون شفاف حتى لا يتحرك المحتوى عند التبديل
const TRANSPARENT = "border border-transparent bg-transparent";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm transition-colors ${
    isActive ? "bg-white/10 text-white" : "text-neutral-300 hover:text-white"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  // يظهر الزجاج بمجرد أن يبدأ الزائر بالتمرير
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      {/* على الشاشة الكبيرة: ثلاثة أعمدة 1fr | auto | 1fr، فتبقى الروابط في المنتصف تمامًا
          مهما اختلف عرض الاسم وزر الدخول */}
      <nav
        aria-label="Main"
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full px-5 transition-all duration-300 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] ${
          scrolled || open ? GLASS : TRANSPARENT
        }`}>
        <Link
          to="/"
          onClick={close}
          className="justify-self-start text-base font-semibold tracking-tight text-white">
          Designer Name
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end">
          <Link
            to="/login"
            className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white hover:text-[#120f17] md:inline-block">
            Login
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 p-2 text-white md:hidden">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className={`mx-auto mt-2 max-w-5xl rounded-2xl p-3 md:hidden ${GLASS}`}>
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-base ${
                      isActive ? "bg-white/10 text-white" : "text-neutral-300"
                    }`
                  }>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="px-3 pt-2">
              <Link
                to="/login"
                onClick={close}
                className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white">
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
