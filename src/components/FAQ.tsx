/** @format */
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import { FAQ_TEXT, FAQS, type Faq } from "../data/faq";

// قسم الأسئلة الشائعة: عنوان كبير، ثم قائمة أسئلة.
// عند المرور بالماوس على سؤال: ينطلق شريط أسود من اليسار إلى أقصى اليمين، والنص تحته يصير أبيض.
// عند الضغط: تنفتح الإجابة تحته بحركة ناعمة ويدور السهم. سؤال واحد مفتوح فقط في كل مرة.

const pad2 = (n: number) => String(n).padStart(2, "0");

// أعمدة الصف: الرقم في النصف الأيسر، والسؤال والكلمة والسهم في الأيمن (على الهاتف: رقم، سؤال، سهم)
const ROW =
  "grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-5 lg:grid-cols-2";

// محتوى صف السؤال، يُرسم مرتين: عادي، ونسخة بيضاء على أسود تظهر مع الشريط
const RowContent = ({
  num,
  faq,
  isOpen,
  reduce,
}: {
  num: number;
  faq: Faq;
  isOpen: boolean;
  reduce: boolean;
}) => (
  <>
    <span className="pl-0.5">[{pad2(num)}]</span>
    <span className="contents lg:grid lg:grid-cols-[3fr_2fr_auto] lg:items-center lg:gap-x-4">
      <span>{faq.question}</span>
      {/* الكلمة القصيرة تختفي على الهاتف لضيق المساحة */}
      <span className="hidden lg:block">{faq.tag}</span>
      <motion.span
        aria-hidden="true"
        className="pr-0.5 text-[13px] leading-none"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
        ▼
      </motion.span>
    </span>
  </>
);

const FAQ = () => {
  const reduce = useReducedMotion();
  const id = useId();
  // رقم السؤال المفتوح (null = كلها مغلقة)
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={`${SITE} py-12 sm:py-16`}>
      {/* الصف العلوي بنفس ترتيب قسم ADVANTAGE: عنوان القسم يسارًا، والعنوان الكبير من منتصف الصفحة، والكلمة أقصى اليمين */}
      <div className="grid gap-6 lg:grid-cols-2">
        <p className={`${MONO} font-medium`}>{FAQ_TEXT.label}</p>
        <div className="flex items-start justify-between gap-6">
          <h2 className="font-sans text-[clamp(1.75rem,3.6vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]">
            {FAQ_TEXT.heading.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p className={`${MONO} mt-1 shrink-0 font-medium`}>{FAQ_TEXT.side}</p>
        </div>
      </div>

      <ul className="mt-12 list-none sm:mt-16">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          const panelId = `${id}-answer-${i}`;
          return (
            <li key={f.question} className="border-b border-black">
              {/* السؤال: زر بعرض الصف كله. نفس أعمدة القسم: الرقم في النصف الأيسر، والسؤال والكلمة والسهم في الأيمن */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`${MONO} ${ROW} group/row relative w-full cursor-pointer text-left focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-black`}>
                {/* محتوى الصف بالأسود (الحالة العادية) */}
                <RowContent
                  num={i + 1}
                  faq={f}
                  isOpen={isOpen}
                  reduce={!!reduce}
                />

                {/* نسخة ثانية من الصف: خلفية سوداء ونص أبيض، مقصوصة بالكامل في البداية (clip-path).
                    عند المرور ينفتح القص من اليسار إلى أقصى اليمين كقذيفة (سريع جدًا ثم يتوقف بنعومة)،
                    فيتحول كل حرف إلى الأبيض لحظة يمر الشريط فوقه بالضبط.
                    عند إبعاد الماوس ينغلق عائدًا إلى اليسار، أسرع قليلًا */}
                <span
                  aria-hidden="true"
                  className={`${ROW} pointer-events-none absolute inset-0 bg-black text-white [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-[cubic-bezier(0.7,0,0.84,0)] [@media(hover:hover)]:group-hover/row:[clip-path:inset(0_0_0_0)] [@media(hover:hover)]:group-hover/row:duration-500 [@media(hover:hover)]:group-hover/row:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none`}>
                  <RowContent
                    num={i + 1}
                    faq={f}
                    isOpen={isOpen}
                    reduce={!!reduce}
                  />
                </span>
              </button>

              {/* الإجابة: تنفتح بارتفاع متدرج من 0 إلى ارتفاعها الطبيعي */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduce ? 0 : 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden">
                    <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 pb-5 lg:grid-cols-2">
                      <span />
                      <p className="max-w-xl font-sans text-[15px] normal-case leading-snug tracking-normal">
                        {f.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FAQ;
