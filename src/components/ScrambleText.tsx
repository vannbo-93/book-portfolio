/** @format */
import { motion, useReducedMotion } from "motion/react";

// نص تدور أحرفه كالعداد: كل حرف ينزلق إلى الأعلى ويعود نفس الحرف من الأسفل،
// حرفًا بعد حرف من اليسار. الأحرف لا تتغير أبدًا، تدور فقط.
// يتكرر وحده كل ثانيتين تقريبًا، دون الحاجة لمرور الماوس.
//
// الاستعمال: <ScrambleText text="[ View all ]" />
// الأقواس [ ] والمسافات تبقى ثابتة كإطار للنص.

interface ScrambleTextProps {
  text: string;
  // الوقت بين كل دورة والتي بعدها، بالثواني
  every?: number;
  className?: string;
}

const FIXED = new Set([" ", "[", "]"]);
const ROLL = 0.45; // مدة دوران الحرف الواحد بالثواني
const STAGGER = 0.035; // التأخير بين حرف والذي يليه

const ScrambleText = ({
  text,
  every = 2,
  className = "",
}: ScrambleTextProps) => {
  const reduce = useReducedMotion();
  const letters = [...text];

  // لمن فعّل "تقليل الحركة": النص ثابت
  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {/* قارئ الشاشة يقرأ النص مرة واحدة كاملًا */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {letters.map((ch, i) =>
          FIXED.has(ch) ? (
            <span key={i} className="whitespace-pre">
              {ch}
            </span>
          ) : (
            // نافذة بارتفاع سطر واحد، وداخلها الحرف مرتين فوق بعض:
            // ينزلق العمود للأعلى فيختفي الحرف الأول ويظهر الثاني (نفس الحرف) مكانه
            <span
              key={i}
              className="inline-block h-[1lh] overflow-hidden align-top">
              <motion.span
                className="flex flex-col"
                animate={{ y: ["0%", "-50%"] }}
                transition={{
                  duration: ROLL,
                  ease: [0.65, 0, 0.35, 1],
                  delay: i * STAGGER,
                  repeat: Infinity,
                  // كل الأحرف تنتظر نفس المدة، فيبقى التتابع بينها في كل دورة
                  repeatDelay: every,
                }}>
                <span>{ch}</span>
                <span>{ch}</span>
              </motion.span>
            </span>
          ),
        )}
      </span>
    </span>
  );
};

export default ScrambleText;
