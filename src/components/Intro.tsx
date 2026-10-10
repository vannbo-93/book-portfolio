/** @format */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BRAND } from "../data/site";
import { COVERS } from "../data/covers";
import { FORMATS } from "../data/formats";
import { startScroll, stopScroll } from "../lib/scroll";

// شاشة الدخول: صفحة سوداء في منتصفها اسم الموقع بحجم نص عادي. المدة الكاملة 2.5 ثانية:
//   0.0 – 0.6 ث: يظهر الاسم بالتلاشي (من شفاف إلى واضح)
//   1.0 – 1.45 ث: يمر على الاسم تأثير غليتش
//                (ارتجاف ونسختان حمراء وزرقاء تنزاحان وتتقطعان، كخلل في الشاشة)
//   1.55 – 2.0 ث: يختفي الاسم بالتلاشي، والشاشة ما زالت سوداء
//   2.0 – 2.5 ث: تتلاشى الشاشة السوداء ويظهر الموقع من خلفها
// تظهر عند كل فتح أو تحديث (Refresh) للموقع، لا عند الانتقال بين صفحاته.
// في أسفل منتصف الشاشة: شريط صغير من أغلفة الموقع يمر بسرعة، ويختفي مع الاسم.

const FADE_IN = 0.6; // ظهور الاسم (ث)
const TEXT_OUT_AT = 1550; // متى يبدأ الاسم بالاختفاء (ms)
const TEXT_OUT = 0.45; // اختفاء الاسم (ث)
const SCREEN_OUT_AT = 2000; // متى تبدأ الشاشة بالاختفاء (ms) = بعد أن يختفي الاسم
const SCREEN_OUT = 0.5; // اختفاء الشاشة (ث) → المجموع 2.5 ثانية

// الغليتش: متى يبدأ (بعد ظهور الاسم) وكم يستمر (ث)
const GLITCH_AT = 1.0;
const GLITCH = 0.45;

// إطارات الغليتش: كل قيمة لقطة، والانتقال بينها سريع جدًا فيبدو متقطعًا
const N = 12;
const SLICES = [
  "inset(0 0 100% 0)",
  "inset(10% 0 60% 0)",
  "inset(55% 0 15% 0)",
  "inset(0 0 75% 0)",
  "inset(70% 0 5% 0)",
  "inset(30% 0 45% 0)",
  "inset(5% 0 80% 0)",
  "inset(45% 0 30% 0)",
  "inset(80% 0 0 0)",
  "inset(20% 0 55% 0)",
  "inset(60% 0 25% 0)",
  "inset(0 0 100% 0)",
];
const shuffle = (a: string[], k: number) =>
  a.map((_, i) => a[(i * k) % a.length]);
const glitchTransition = {
  delay: GLITCH_AT,
  duration: GLITCH,
  ease: "linear" as const,
};

const EASE = [0.45, 0, 0.55, 1] as const;

// شريط الأغلفة: متى يظهر (ث)، وسرعة مروره (ثوانٍ لكل دورة كاملة: أصغر = أسرع)
const STRIP_IN = 0.3;
const STRIP_LOOP = 1.4;

// الأغلفة الصغيرة: نفس الارتفاع، والعرض حسب مقاس كل كتاب. القائمة مكررة مرتين
// والشريط يتحرك نصف طوله ثم يعود، فتبدو حركة متصلة بلا نهاية
const CoverStrip = ({ reduce }: { reduce: boolean }) => {
  const row = (hidden?: boolean) =>
    COVERS.map((c, i) => (
      <img
        key={`${hidden ? "b" : "a"}-${i}`}
        src={c.src}
        alt=""
        draggable={false}
        style={{
          aspectRatio: `${FORMATS[c.format].w} / ${FORMATS[c.format].h}`,
        }}
        className="h-14 w-auto shrink-0 object-cover sm:h-16"
      />
    ));
  return (
    // قناع متدرج على الطرفين: الأغلفة تدخل وتخرج بنعومة لا بحافة حادة
    <div className="absolute bottom-10 left-1/2 w-[min(70vw,28rem)] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
      <motion.div
        className="flex w-max items-end gap-1.5"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: STRIP_LOOP, ease: "linear", repeat: Infinity }}>
        {row()}
        {row(true)}
      </motion.div>
    </div>
  );
};

// الاسم مع الغليتش: النص الأصلي يرتجف، وفوقه نسختان (حمراء وزرقاء) تظهران في شرائح متقطعة
// وتنزاحان يمينًا ويسارًا لنصف ثانية، ثم يعود الاسم سليمًا
const Glitch = ({ text, reduce }: { text: string; reduce: boolean }) => {
  if (reduce) return <>{text}</>;
  const layer = (color: string, dir: 1 | -1, k: number) => (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-screen"
      style={{ color }}
      initial={{ opacity: 0, x: 0, clipPath: SLICES[0] }}
      animate={{
        opacity: [0, ...Array(N - 2).fill(1), 0],
        x: Array.from({ length: N }, (_, i) =>
          i === 0 || i === N - 1 ? 0 : dir * (((i * 7) % 5) - 1) * 2,
        ),
        clipPath: shuffle(SLICES, k),
      }}
      transition={glitchTransition}>
      {text}
    </motion.span>
  );
  return (
    <>
      <motion.span
        className="relative inline-block"
        animate={{
          x: [0, 1, -2, 0, 2, -1, 0, 1, -1, 2, 0, 0],
          skewX: [0, 0, 8, 0, -6, 0, 0, 4, 0, -3, 0, 0],
        }}
        transition={glitchTransition}>
        {text}
      </motion.span>
      {layer("#ff2d55", 1, 5)}
      {layer("#00e5ff", -1, 7)}
    </>
  );
};

const Intro = () => {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    if (!show) return;
    // منع التمرير أثناء ظهور الشاشة
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    stopScroll(); // وإيقاف التمرير الناعم أيضًا
    // لمن فعّل "تقليل الحركة": أقصر بكثير
    const k = reduce ? 0.3 : 1;
    const t1 = window.setTimeout(() => setShowText(false), TEXT_OUT_AT * k);
    const t2 = window.setTimeout(() => setShow(false), SCREEN_OUT_AT * k);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.documentElement.style.overflow = prev;
      startScroll();
    };
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white"
          exit={{ opacity: 0 }}
          transition={{ duration: SCREEN_OUT, ease: EASE }}>
          {/* شريط الأغلفة في أسفل المنتصف: يظهر بعد لحظة، ويختفي مع الاسم */}
          <AnimatePresence>
            {showText && (
              <motion.div
                key="strip"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: STRIP_IN, duration: 0.5, ease: EASE },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: TEXT_OUT, ease: EASE },
                }}>
                <CoverStrip reduce={!!reduce} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* الاسم: يظهر ويختفي بنفس التلاشي الذي تختفي به الشاشة */}
          <AnimatePresence>
            {showText && (
              <motion.p
                key="name"
                className="relative font-sans text-base font-medium leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: TEXT_OUT, ease: EASE },
                }}
                transition={{ duration: FADE_IN, ease: EASE }}>
                <Glitch text={BRAND} reduce={!!reduce} />
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Intro;
