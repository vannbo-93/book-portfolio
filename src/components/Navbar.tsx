/** @format */
import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
} from "motion/react";

// شريط واحد داكن شبه شفاف بحواف مستديرة قليلًا، في منتصف الشاشة:
// الاسم يسارًا، والروابط وزر الدخول يمينًا (بأسلوب صفحات React Bits)

type NavItem = { href: string; label: string };

const LINKS: NavItem[] = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
const LOGIN: NavItem = { href: "/login", label: "Login" };

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

const Navbar = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const close = () => setOpen(false);

  // Work يبقى نشطًا في صفحات الكتب أيضًا، لأنها جزء من الأعمال
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/books")
      : pathname.startsWith(href);

  return (
    // reducedMotion="user": من فعّل تقليل الحركة في نظامه لا يرى حركات التحريك
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-[640px] overflow-hidden rounded-xl border border-white/10 bg-[#16131c]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <nav
            aria-label="Main"
            className="flex h-12 items-center justify-between pl-4 pr-2">
            <Link
              to="/"
              onClick={close}
              className="rounded-md text-sm font-medium tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Designer Name
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {/* خلفية الـ hover تنزلق بين الروابط بدل أن تختفي وتظهر (layoutId) */}
              <ul
                className="flex items-center"
                onMouseLeave={() => setHovered(null)}>
                {LINKS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="relative">
                      <AnimatePresence>
                        {hovered === item.href && (
                          <motion.span
                            layoutId="nav-hover"
                            aria-hidden="true"
                            className="absolute inset-0 rounded-md bg-white/[0.07]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 40,
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <Link
                        to={item.href}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHovered(item.href)}
                        onFocus={() => setHovered(item.href)}
                        onBlur={() => setHovered(null)}
                        className={`relative block rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                          active
                            ? "text-white"
                            : "text-neutral-400 hover:text-white"
                        }`}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                to={LOGIN.href}
                aria-current={isActive(LOGIN.href) ? "page" : undefined}
                className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-[#120f17] transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                {LOGIN.label}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-lg text-white md:hidden">
              <motion.span
                animate={{ rotate: open ? 45 : 0, y: open ? 3 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="h-0.5 w-4 rounded bg-white"
              />
              <motion.span
                animate={{ rotate: open ? -45 : 0, y: open ? -3 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="h-0.5 w-4 rounded bg-white"
              />
            </button>
          </nav>

          {/* على الهاتف: القائمة تنفتح داخل نفس الشريط، فيطول بدل أن تظهر بطاقة منفصلة */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="md:hidden">
                <ul className="flex flex-col gap-1 border-t border-white/10 p-2">
                  {LINKS.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={close}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive(item.href)
                            ? "bg-white/[0.07] text-white"
                            : "text-neutral-400 hover:text-white"
                        }`}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-1">
                    <Link
                      to={LOGIN.href}
                      onClick={close}
                      className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-[#120f17]">
                      {LOGIN.label}
                    </Link>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </MotionConfig>
  );
};

export default Navbar;
