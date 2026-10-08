/** @format */
import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { SITE } from "../layout";
import StatusDot from "./StatusDot";
import {
  AVAILABILITY,
  BRAND,
  CONTACT_URL,
  EMAIL,
  LOCATION,
  NAV_LINKS,
  RESPONSE_TIME,
  SOCIALS,
} from "../data/site";

// الفوتر: آخر فرصة لتحويل الزائر إلى عميل، فيبدأ بالتواصل لا بالروابط.
//   أعلى: سؤال للعميل + البريد بخط كبير + الحالة + زر بدء مشروع
//   وسط:  ثلاثة أعمدة: الصفحات، حسابات التواصل، معلومات العمل
//   أسفل:      حقوق النشر وزر العودة للأعلى
// بلون الصفحة نفسه (فاتح)، ومفصول عن قسم الصور الأسود بمسافة فوقه وخط رفيع

const LABEL =
  "mb-5 font-mono text-[11px] uppercase tracking-widest text-black/40";
const ITEM =
  "rounded-sm text-[15px] text-black/70 transition-colors hover:text-black " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black";

const ArrowIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

// زر العودة للأعلى: يلفت الانتباه بتأثيرين يبدآن فقط حين يظهر الزر على الشاشة:
//   1. ضوء يمر على النص من اليسار إلى اليمين كل بضع ثوان (لمعة)
//   2. السهم يقفز للأعلى قليلًا، فيوحي باتجاه الحركة
// ويتوقفان لمن فعّل "تقليل الحركة" في جهازه
const BackToTop = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const play = inView && !reduce;

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toTop}
      className="group relative inline-flex items-center gap-2 self-start rounded-full border border-black/15 px-4 py-2 uppercase text-black transition-colors duration-300 hover:border-black hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:self-auto">
      {/* النص بتدرج: رمادي ثم أسود ثم رمادي، والتدرج يتحرك فيبدو كضوء يمر عليه.
          عند المرور بالماوس يصبح النص أبيض عاديًا */}
      <motion.span
        className="bg-[linear-gradient(110deg,rgba(0,0,0,0.35)_35%,#000_50%,rgba(0,0,0,0.35)_65%)] bg-[length:250%_100%] bg-clip-text text-transparent group-hover:bg-none group-hover:text-white"
        initial={{ backgroundPosition: "100% 0" }}
        animate={
          play
            ? { backgroundPosition: ["100% 0", "0% 0"] }
            : { backgroundPosition: "100% 0" }
        }
        transition={
          play
            ? {
                duration: 0.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1,
              }
            : { duration: 0 }
        }>
        Back to top
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="inline-block"
        animate={play ? { y: [0, -4, 0] } : { y: 0 }}
        transition={
          play
            ? {
                duration: 0.9,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.6,
              }
            : { duration: 0 }
        }>
        ↑
      </motion.span>
    </button>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 text-black">
      <div className={`${SITE} pb-8 pt-24 sm:pt-32`}>
        <div className="grid gap-20">
          {/* التواصل */}
          <div>
            <p className={LABEL}>Have a manuscript?</p>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 rounded-sm text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold leading-none tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] motion-reduce:transition-none">
                {EMAIL}
              </span>
              <ArrowIcon className="size-[0.6em] shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none" />
            </a>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link
                to={CONTACT_URL}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black motion-reduce:transition-none">
                Start a project
                <ArrowIcon />
              </Link>
              <p className="flex items-center gap-2 text-sm text-black/60">
                <StatusDot />
                {AVAILABILITY}
              </p>
            </div>
          </div>

          {/* الأعمدة الثلاثة */}
          <div className="grid grid-cols-2 gap-10 border-t border-black/10 pt-12 sm:grid-cols-3">
            <nav aria-label="Footer">
              <p className={LABEL}>Pages</p>
              <ul className="grid gap-3">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={ITEM}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={CONTACT_URL} className={ITEM}>
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <p className={LABEL}>Follow</p>
              <ul className="grid gap-3">
                {SOCIALS.map((item) => (
                  <li key={item.label}>
                    {/* روابط خارجية: تفتح في تبويب جديد، وnoopener يمنع الموقع الآخر من التحكم في هذا التبويب */}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${ITEM} inline-flex items-center gap-1.5`}>
                      {item.label}
                      <ArrowIcon className="size-3 opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className={LABEL}>Studio</p>
              <ul className="grid gap-3 text-[15px] text-black/70">
                <li>{LOCATION}</li>
                <li>Working with authors &amp; publishers worldwide</li>
                <li>{RESPONSE_TIME}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* السطر الأخير */}
        <div className="mt-20 flex flex-col-reverse gap-4 border-t border-black/10 pt-6 font-mono text-[11px] uppercase tracking-widest text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
