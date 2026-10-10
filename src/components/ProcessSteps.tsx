/** @format */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { MONO } from "../hooks/useClock";
import type { ProcessStep } from "../data/process";

// مراحل العمل: على الشاشات الكبيرة رقم ضخم يثبت يسارًا ويتبدل مع كل مرحلة (يدور كالعداد)،
// وتحته شريط يمتلئ بقدر ما قطعت من المراحل. المراحل يمينًا: الحالية واضحة والباقي باهت.
// على الهاتف: الرقم صغير داخل كل مرحلة.

const pad2 = (n: number) => String(n).padStart(2, "0");

// مرحلة واحدة: تخبر الأب حين تصل إلى منتصف الشاشة
const Step = ({
  step,
  index,
  active,
  onActive,
}: {
  step: ProcessStep;
  index: number;
  active: boolean;
  onActive: (i: number) => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  // "نشطة" حين يكون منتصفها في الشريط الأوسط من الشاشة
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li
      ref={ref}
      className={`border-b border-black py-10 transition-opacity duration-500 first:pt-0 lg:min-h-[55vh] lg:py-16 ${
        active ? "opacity-100" : "lg:opacity-25"
      }`}>
      <div className={`${MONO} flex justify-between gap-6 font-medium`}>
        <span>
          <span className="lg:hidden">[{pad2(index + 1)}] </span>
          {step.duration}
        </span>
        <span>Step {pad2(index + 1)}</span>
      </div>
      <h3 className="mt-6 font-sans text-[clamp(2rem,4vw,4.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]">
        {step.title}
      </h3>
      <p className="mt-6 max-w-md font-sans text-[15px] font-medium normal-case leading-snug tracking-normal">
        {step.text}
      </p>
    </li>
  );
};

const ProcessSteps = ({ steps }: { steps: ProcessStep[] }) => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  // الاتجاه: 1 = نزول (الرقم الجديد يأتي من الأسفل)، -1 = صعود
  const [dir, setDir] = useState(1);
  const activeRef = useRef(0);
  const onActive = useCallback((i: number) => {
    if (i === activeRef.current) return;
    setDir(i > activeRef.current ? 1 : -1);
    activeRef.current = i;
    setActive(i);
  }, []);

  return (
    <div className="grid gap-x-6 lg:grid-cols-2">
      {/* اليسار: الرقم الضخم الثابت + شريط التقدم (الشاشات الكبيرة فقط) */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="relative h-[clamp(8rem,17vw,18rem)] overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <motion.span
                key={active}
                custom={dir}
                aria-hidden="true"
                className="absolute left-0 top-0 font-sans text-[clamp(8rem,17vw,18rem)] font-medium leading-[0.85] tracking-[-0.07em]"
                initial={reduce ? { opacity: 0 } : { y: `${dir * 100}%` }}
                animate={{ y: "0%", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: `${dir * -100}%` }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
                {pad2(active + 1)}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* شريط التقدم: يمتلئ بقدر ما قطعت من المراحل */}
          <div className="mt-6 h-px w-full max-w-sm bg-black/15">
            <motion.div
              className="h-px origin-left bg-black"
              animate={{ scaleX: (active + 1) / steps.length }}
              transition={{
                duration: reduce ? 0 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <p className={`${MONO} mt-3 font-medium`}>
            {pad2(active + 1)} / {pad2(steps.length)} — {steps[active].title}
          </p>
        </div>
      </div>

      {/* اليمين: المراحل */}
      <ol className="list-none">
        {steps.map((s, i) => (
          <Step
            key={s.title}
            step={s}
            index={i}
            active={i === active}
            onActive={onActive}
          />
        ))}
      </ol>
    </div>
  );
};

export default ProcessSteps;
