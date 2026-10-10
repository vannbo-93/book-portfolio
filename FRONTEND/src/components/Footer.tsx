/** @format */
import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { scrollToTop } from "../lib/scroll";
import { SITE } from "../layout";
import StatusDot from "./StatusDot";
import { books } from "../data/books";
import {
  AVAILABILITY,
  BRAND,
  CITY,
  CONTACT_URL,
  EMAIL,
  NAV_LINKS,
  RESPONSE_TIME,
  SOCIALS,
} from "../data/site";
import { MONO, useClock } from "../hooks/useClock";

// الفوتر بنفس أسلوب الناف بار: بلا إطارات ولا خلفيات، نفس الأعمدة الأربعة ونفس الخطين.
//   عمود 1: سؤال للعميل + البريد بخط كبير (خط الاسم في الناف بار)
//   عمود 2: الصفحات      عمود 3: حسابات التواصل      عمود 4: الساعة والمدينة والحالة
//   أسفل:  اسم الموقع بخط ضخم بعرض الصفحة، ثم حقوق النشر وزر العودة للأعلى

// رابط: خط تحته عند المرور، كما في الناف بار
const LINK =
  "w-fit underline-offset-[3px] decoration-1 hover:underline " +
  "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current";
// عنوان صغير فوق كل عمود: نفس الخط لكن باهت
const LABEL = `${MONO} mb-3 text-black/40`;

// زر العودة للأعلى: يلفت الانتباه بتأثيرين يبدآن فقط حين يظهر الزر على الشاشة:
//   1. ضوء يمر على النص من اليسار إلى اليمين كل بضع ثوان (لمعة)
//   2. السهم يقفز للأعلى قليلًا، فيوحي باتجاه الحركة
// ويتوقفان لمن فعّل "تقليل الحركة" في جهازه
const BackToTop = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const play = inView && !reduce;

  // العودة للأعلى بنفس نعومة تمرير الموقع
  const toTop = () => scrollToTop();

  return (
    <button
      ref={ref}
      type="button"
      onClick={toTop}
      className={`${MONO} group relative inline-flex w-fit items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 text-black transition-colors duration-300 hover:border-black hover:bg-black hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black`}>
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
                duration: 1.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.2,
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
  const clock = useClock();
  const pages = [
    { href: "/", label: "Home" },
    { href: "/work", label: "Works", count: books.length },
    ...NAV_LINKS.filter((l) => l.href !== "/work"),
    { href: CONTACT_URL, label: "Contact" },
  ];

  return (
    <footer className="border-t border-black/10 text-black">
      <div className={`${SITE} pb-6 pt-16 sm:pt-24`}>
        {/* نفس شبكة الناف بار: 2fr | 1fr | 1fr | 1fr */}
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-6">
          <div>
            <p className={LABEL}>Have a manuscript?</p>
            <a
              href={`mailto:${EMAIL}`}
              className="font-sans text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium leading-none tracking-[-0.05em] underline-offset-[6px] decoration-2 hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black">
              {EMAIL}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
            <nav aria-label="Footer">
              <p className={LABEL}>Pages</p>
              <ul className={`${MONO} flex list-none flex-col`}>
                {pages.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={LINK}>
                      {item.label}
                      {"count" in item && (
                        <span className="ml-1">[{item.count}]</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className={LABEL}>Follow</p>
              <ul className={`${MONO} flex list-none flex-col`}>
                {SOCIALS.map((item) => (
                  <li key={item.label}>
                    {/* روابط خارجية: تفتح في تبويب جديد، وnoopener يمنع الموقع الآخر من التحكم في هذا التبويب */}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK}>
                      {item.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className={LABEL}>Studio</p>
            <div className={`${MONO} flex flex-col tabular-nums`}>
              <time>{clock}</time>
              <span>{CITY}</span>
              <span className="mt-3 flex items-center gap-2">
                <StatusDot />
                {AVAILABILITY}
              </span>
              <span className="text-black/40">{RESPONSE_TIME}</span>
            </div>
          </div>
        </div>

        {/* اسم الموقع ضخمًا بعرض الصفحة: نفس خط الاسم في الناف بار */}
        <p
          aria-hidden="true"
          className="mt-20 select-none text-center font-sans text-[clamp(4rem,21vw,19rem)] font-medium leading-[0.8] tracking-[-0.07em]">
          {BRAND}
        </p>

        <div
          className={`${MONO} mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="text-black/40">
            © {year} {BRAND}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
