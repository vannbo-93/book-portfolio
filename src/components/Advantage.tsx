/** @format */
import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import { ADVANTAGE, STATS, type Stat } from "../data/Advantage";

// قسم "THE ADVANTAGE": عنوان كبير، ثم أربعة صفوف أرقام.
// كل رقم يعدّ من 0 إلى قيمته حين يظهر صفه على الشاشة (مرة واحدة).
// خلفيته غير شفافة لأنه يصعد فوق القسم السابق ويغطيه (انظر StackReveal: next).

const pad2 = (n: number) => String(n).padStart(2, "0");

// الرقم الكبير المتحرك
const Counter = ({ value, suffix }: Pick<Stat, "value" | "suffix">) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  // يبدأ العد حين يكون الصف قد دخل الشاشة بوضوح، لا عند حافتها
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1], // سريع ثم يبطئ عند الوصول
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span className="font-sans text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[0.85] tracking-[-0.06em] tabular-nums">
      {/* قارئ الشاشة يقرأ القيمة النهائية مباشرة */}
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        <span ref={ref}>{reduce ? value : 0}</span>
        {suffix}
      </span>
    </span>
  );
};

const Advantage = () => (
  // min-h-screen: القسم لا يقل عن شاشة كاملة حتى يغطي القسم السابق تمامًا (أي فراغ زائد يكون أسفله، لا بين العنوان والأرقام).
  // pt-24/28: مسافة علوية أكبر من بقية الأقسام، لأن القسم يتوقف وبدايته في أعلى الشاشة تحت الناف بار
  <section
    className={`${SITE} flex min-h-screen flex-col pb-12 pt-24 sm:pb-16 sm:pt-28`}>
    {/* الصف العلوي: THE ADVANTAGE يسارًا، والعنوان يبدأ من منتصف الصفحة، وEXECUTION أقصى اليمين */}
    <div className="grid gap-6 lg:grid-cols-2">
      <p className={`${MONO} font-medium`}>{ADVANTAGE.label}</p>
      <div className="flex items-start justify-between gap-6">
        {/* سطران فقط دائمًا: كل سطر لا ينكسر (whitespace-nowrap) */}
        <h2 className="font-sans text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]">
          {ADVANTAGE.heading.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h2>
        <p className={`${MONO} mt-1 shrink-0 font-medium`}>{ADVANTAGE.side}</p>
      </div>
    </div>

    {/* الصفوف: على مسافة ثابتة تحت العنوان (mt-16 / mt-20 / mt-24)، كل صف بخط سفلي أسود.
        على الهاتف: الرقم [01] في عمود ضيق، وعلى الكبيرة: النصف الأيسر كاملًا */}
    <ul className="mt-16 list-none sm:mt-20 lg:mt-24">
      {STATS.map((s, i) => (
        <li
          key={s.label}
          className="grid grid-cols-[3rem_1fr] items-end border-b border-black pb-2 pt-6 lg:grid-cols-2">
          <span className={`${MONO} font-medium`}>[{pad2(i + 1)}]</span>
          <div className="flex items-end justify-between gap-4">
            <Counter value={s.value} suffix={s.suffix} />
            <span className={`${MONO} text-right font-bold`}>{s.label}</span>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default Advantage;
