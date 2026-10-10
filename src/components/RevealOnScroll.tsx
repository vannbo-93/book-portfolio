/** @format */
import { useEffect } from "react";
import { useLocation } from "react-router";
import "../reveal.css";

// يُظهر كل عناوين الصفحة (h1 وh2) بحركة صعود من خلف قناع حين تدخل الشاشة، مرة واحدة.
// يعمل وحده على كل الصفحات: لا حاجة لتعديل أي قسم. وأي عنصر آخر تريده أن يظهر بنفس الطريقة:
// أضف له data-reveal (مثال: <p data-reveal>...</p>).
//
// لا يمس:
//   - العناوين داخل المشاهد المثبتة (sticky)، لأن لها حركاتها الخاصة مع التمرير
//   - أي عنصر عليه data-reveal-skip
//   - من فعّل "تقليل الحركة" في جهازه
// وعند فتح الموقع ينتظر انتهاء شاشة الدخول، حتى لا تحدث الحركة خلفها دون أن تُرى.

const SELECTOR = "main h1, main h2, main [data-reveal]";
// التأخير بين عناوين تظهر في نفس اللحظة (ms)
const STAGGER = 80;

const RevealOnScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    ).filter(
      (el) =>
        !el.closest(".sticky, [data-reveal-skip]") &&
        !el.classList.contains("sr-only"),
    );
    els.forEach((el) => el.setAttribute("data-reveal", "hidden"));

    const io = new IntersectionObserver(
      (entries) => {
        let n = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${n++ * STAGGER}ms`;
          el.setAttribute("data-reveal", "shown");
          // بعد انتهاء الحركة: نلغي القناع نهائيًا
          const done = (ev: TransitionEvent) => {
            if (ev.target !== el || ev.propertyName !== "clip-path") return;
            el.setAttribute("data-reveal", "done");
            el.style.transitionDelay = "";
            el.removeEventListener("transitionend", done);
          };
          el.addEventListener("transitionend", done);
          io.unobserve(el);
        });
      },
      // يظهر العنوان حين يدخل الشاشة بـ 10% من ارتفاعها، لا عند حافتها تمامًا
      { rootMargin: "0px 0px -10% 0px" },
    );

    // شاشة الدخول ظاهرة؟ ننتظر حتى تختفي، ثم نبدأ المراقبة
    let mo: MutationObserver | null = null;
    const start = () => els.forEach((el) => io.observe(el));
    if (document.querySelector("[data-intro]")) {
      mo = new MutationObserver(() => {
        if (!document.querySelector("[data-intro]")) {
          mo?.disconnect();
          start();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } else start();

    return () => {
      io.disconnect();
      mo?.disconnect();
      // عند مغادرة الصفحة: نعيد العناوين كما كانت
      els.forEach((el) => {
        el.removeAttribute("data-reveal");
        el.style.transitionDelay = "";
      });
    };
  }, [pathname]);

  return null;
};

export default RevealOnScroll;
