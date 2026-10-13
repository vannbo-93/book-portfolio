/** @format */
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router";
import { api } from "../lib/api";
import { BRAND } from "../data/site";
import { useAuth } from "./auth";
import ErrorBoundary from "../components/ErrorBoundary";
import { MONO_SM } from "./ui";

// إطار لوحة التحكم: قائمة الأقسام يسارًا (وفي الأعلى على الهاتف)، والصفحة يمينًا

const LINKS = [
  { to: "/admin/books", label: "Books" },
  { to: "/admin/fan", label: "3D book (home)" },
  { to: "/admin/content/covers", label: "Exclusive covers" },
  { to: "/admin/content/testimonials", label: "Testimonials" },
  { to: "/admin/content/faqs", label: "FAQ" },
  { to: "/admin/content/services", label: "Services" },
  { to: "/admin/content/stats", label: "Numbers" },
  { to: "/admin/content/experience", label: "Experience" },
  { to: "/admin/settings", label: "Settings & videos" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/account", label: "Account" },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { admin, logout } = useAuth();
  const { pathname } = useLocation();
  // عدد الرسائل غير المقروءة (يتحدث عند كل انتقال بين الأقسام)
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    api<{ unread: number }>("/api/admin/messages?status=unread")
      .then((d) => alive && setUnread(d.unread))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-black md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-black/10 bg-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-baseline justify-between px-5 pb-3 pt-5 md:block">
          <p className="text-xl font-medium tracking-[-0.04em]">{BRAND}</p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`${MONO_SM} text-black/50 hover:text-black md:mt-1 md:block`}>
            View site ↗
          </a>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-y-auto md:pb-0">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${MONO_SM} flex shrink-0 items-center justify-between gap-2 rounded-[4px] px-3 py-2 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-black/70 hover:bg-black/5"
                }`
              }>
              {label}
              {to === "/admin/messages" && unread > 0 && (
                <span className="rounded-full bg-emerald-500 px-1.5 text-[10px] leading-4 text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-black/10 p-5 md:block">
          <p className="truncate text-xs text-black/50">{admin.email}</p>
          <button
            type="button"
            onClick={logout}
            className={`${MONO_SM} mt-2 cursor-pointer hover:underline`}>
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-8 md:py-10">
        {/* key: الانتقال إلى قسم آخر يعيد المحاولة بعد أي تعطل */}
        <ErrorBoundary
          key={pathname}
          fallback={
            <p className="text-sm text-red-700">
              This page crashed. Reload the page; if it happens again, send a
              screenshot of the browser console (F12).
            </p>
          }>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Layout;
