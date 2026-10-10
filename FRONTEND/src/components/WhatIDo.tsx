/** @format */
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { MONO } from "../hooks/useClock";
import { WHAT_I_DO } from "../data/services";

// قسم "ماذا أفعل": جملة كبيرة تتلوّن كلمة بعد كلمة من الرمادي إلى الأسود مع التمرير،
// كأنها تُقرأ أثناء النزول.

const Word = ({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) => {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
};

const WhatIDo = ({ text = WHAT_I_DO }: { text?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  // يبدأ التلوين حين تصل الفقرة إلى 90% من الشاشة، وينتهي حين يصل آخرها إلى 65% منها
  // (لا إلى المنتصف: القسم قريب من آخر الصفحة، وقد لا يتسع التمرير لرفعه أكثر فتبقى آخر الكلمات رمادية)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.65"],
  });
  const words = text.split(" ");

  return (
    <section className="py-12 sm:py-16">
      <div
        className={`${MONO} mb-10 flex justify-between font-medium sm:mb-14`}>
        <p>What I do</p>
        <p>A selected approach</p>
      </div>
      <p
        ref={ref}
        className="max-w-4xl font-sans text-[clamp(1.375rem,2.8vw,2.5rem)] font-medium uppercase leading-[0.98] tracking-[-0.04em]">
        {reduce
          ? text
          : words.map((w, i) => (
              <Word
                key={i}
                word={w}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              />
            ))}
      </p>
    </section>
  );
};

export default WhatIDo;
