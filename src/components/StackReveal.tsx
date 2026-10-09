/** @format */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { SITE } from "../layout";

// تراكب الأقسام (Scrollytelling):
//   1. القسم السابق (children، مثل WHAT I DO) يثبت حين تصل بدايته إلى أعلى الشاشة
//   2. اللوح الأيمن يبدأ بالظهور من أسفل الشاشة قبل التثبيت بقليل (حين يقترب نص WHAT I DO من نهايته)،
//      ويصعد حتى يغطي النصف الأيمن ("A selected approach")
//   3. حين يكون الأيمن قد صعد 60% من طريقه، يبدأ الأيسر بالصعود، ويغطي النصف الأيسر ("What I do")
//   4. حين يغطيانه بالكامل:
//      - بدون next: يتحرر المشهد ويصعد اللوحان معًا مع بقية الصفحة
//      - مع next: يبقى المشهد ثابتًا، ويصعد القسم التالي فوقه كستارة حتى يغطيه كاملًا، ثم نكمل النزول
//
// اللوحان الآن بخلفية سوداء. لوضع مقطع أنميشن مكان أي منهما:
//   right={<video src="/videos/right.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />}

interface StackRevealProps {
  // ما يثبت ثم يُغطّى
  children: ReactNode;
  // محتوى اللوحين (فيديو مثلًا). بدونه: أسود
  left?: ReactNode;
  right?: ReactNode;
  // طول مسافة التمرير للمشهد كله، بالشاشات: أكبر = حركة أبطأ
  screens?: number;
  // القسم الذي يصعد فوق المشهد بعد انتهائه (اختياري). يأخذ خلفية ورقية غير شفافة
  next?: ReactNode;
}

// متى يتحرك كل لوح، من 0 (بداية المشهد) إلى 1 (نهايته):
// الأيمن من 0 إلى 0.5، والأيسر يبدأ حين يكون الأيمن قد قطع 60% (عند 0.3) وينتهي عند 0.8،
// ثم من 0.8 إلى 1 يبقى المشهد مغطى قليلًا
const RIGHT: [number, number] = [0, 0.5];
const LEFT: [number, number] = [0.3, 0.8];

// بداية المشهد: قبل أن يثبت القسم، حين تكون بدايته على بعد 25% من أعلى الشاشة
// (وهي اللحظة التي يقترب فيها النص من آخره). أكبر = يظهر اللوح الأيمن أبكر
const LEAD = 0.41;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const StackReveal = ({
  children,
  left,
  right,
  screens = 3,
  next,
}: StackRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // موضع بداية المشهد في الصفحة وارتفاع الشاشة، يُقاسان عند التحميل وعند تغيير حجم النافذة
  const geo = useRef({ top: 0, vh: 1 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      geo.current = {
        top: el.getBoundingClientRect().top + window.scrollY,
        vh: window.innerHeight,
      };
      scrollY.set(window.scrollY); // لإعادة حساب موضع اللوحين فورًا
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scrollY]);

  // موضع اللوح بالبكسل داخل المسرح. نحسب أين يجب أن تكون حافته العليا على الشاشة
  // (من أسفلها إلى أعلاها، بسرعة ثابتة)، ثم نطرح منها مكان المسرح الذي ما زال يصعد قبل التثبيت
  const panelY =
    ([from, to]: [number, number]) =>
    (s: number) => {
      const { top, vh } = geo.current;
      const start = top - LEAD * vh; // بداية المشهد
      const end = top + (screens - 1) * vh; // نهايته (آخر لحظة يكون فيها المسرح مثبتًا قبل next)
      const p = clamp01((s - start) / (end - start));
      const onScreen = 1 - clamp01((p - from) / (to - from)); // 1 = تحت الشاشة، 0 = في مكانه
      const stageTop = Math.max(0, top - s); // أين المسرح على الشاشة (0 بعد التثبيت)
      // بكسل كامل (لا كسور): الحواف بكسور البكسل تُرسم رمادية باهتة، وقد تترك أثرًا على الشاشة
      return Math.round(onScreen * vh - stageTop);
    };
  const rightY = useTransform(scrollY, panelY(RIGHT));
  const leftY = useTransform(scrollY, panelY(LEFT));

  const panel = (content: ReactNode) =>
    content ?? <div className="h-full w-full bg-black" />;

  // لمن فعّل "تقليل الحركة": القسم كما هو، ثم اللوحان تحته بلا حركة، ثم القسم التالي
  if (reduce) {
    return (
      <>
        <div className={SITE}>{children}</div>
        <div className="grid h-screen grid-cols-2" data-nav="dark">
          <div className="overflow-hidden">{panel(left)}</div>
          <div className="overflow-hidden">{panel(right)}</div>
        </div>
        {next}
      </>
    );
  }

  return (
    <>
      {/* الطول الكلي = مسافة المشهد، + شاشة إضافية إن وُجد قسم تالٍ (يبقى المسرح ثابتًا خلالها وهو يُغطّى) */}
      <div
        ref={ref}
        className="relative"
        style={{ height: `${(screens + (next ? 1 : 0)) * 100}vh` }}>
        {/* المسرح: يثبت في أعلى الشاشة طوال المشهد */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className={`${SITE} pt-8`}>{children}</div>

          {/* اللوحان فوق القسم، كل منهما نصف عرض الشاشة.
              will-change-transform: كل لوح في طبقة مستقلة يحركها كرت الشاشة دون إعادة رسم الصفحة،
              فلا تبقى خطوط أفقية (آثار حافة اللوح) مكان مواضعه السابقة.
              data-nav="dark": حين يكونان تحت الناف بار يصير لونه فاتحًا */}
          <motion.div
            data-nav="dark"
            className="absolute inset-y-0 left-0 w-1/2 overflow-hidden will-change-transform [backface-visibility:hidden]"
            style={{ y: leftY }}>
            {panel(left)}
          </motion.div>
          <motion.div
            data-nav="dark"
            className="absolute inset-y-0 right-0 w-1/2 overflow-hidden will-change-transform [backface-visibility:hidden]"
            style={{ y: rightY }}>
            {panel(right)}
          </motion.div>
        </div>
      </div>

      {/* القسم التالي: يُسحب شاشة كاملة للأعلى (-mt-[100vh]) فيبدأ صعوده والمسرح ما زال ثابتًا،
          وz-10 يضعه فوقه. bg-white: خلفية بيضاء غير شفافة (نفس لون الصفحة) حتى لا يظهر المسرح الأسود من خلاله.
          إن غيّرت لون خلفية الموقع، غيّره هنا أيضًا */}
      {next && <div className="relative z-10 -mt-[100vh] bg-white">{next}</div>}
    </>
  );
};

export default StackReveal;
