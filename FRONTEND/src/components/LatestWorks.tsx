/** @format */
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { MONO } from "../hooks/useClock";
import ScrambleText from "./ScrambleText";
import { FORMATS, type LatestItem } from "../data/formats";

// قسم "آخر الأعمال": أغلفة بعرض واحد، وارتفاع كل غلاف حسب نسبة مقاس كتابه الحقيقي،
// واقفة على خط واحد كرف مكتبة،
// وتحت كل كتاب رقمه يسارًا واسمه يمينًا.
// عند المرور بالماوس على غلاف:
//   - الغلاف يكبر قليلًا، وبقية الأغلفة تُظلم إلى 45% من سطوعها، فيبرز وحده
//     (لتغيير قوة الإظلام: الرقم في brightness-[0.45]، أصغر = أغمق)
//   - المؤشر يختفي ويظهر مكانه النص [ VIEW ] يتبع الماوس، حتى يعرف الزائر أن عليه الضغط

interface LatestWorksProps {
  items: LatestItem[];
  // الرقم بجانب العنوان: عدد كل الأعمال (لا المعروضة فقط)
  total: number;
  viewAllHref?: string;
  // النص الذي يظهر مكان المؤشر
  cursorLabel?: string;
  // معرّف القسم: يُستعمل للانتقال إليه (مثلًا من زر Scroll down)
  id?: string;
}

const pad3 = (n: number) => String(n).padStart(3, "0");

const LatestWorks = ({
  items,
  total,
  viewAllHref = "/work",
  cursorLabel = "View",
  id,
}: LatestWorksProps) => {
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);

  // موضع النص الذي يتبع الماوس: نابض خفيف حتى يلحق المؤشر بنعومة لا بجمود
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  const onMove = (e: ReactPointerEvent) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };
  // فقط للماوس: على اللمس لا يوجد مؤشر يُستبدل
  const onEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // يقفز النص فورًا إلى مكان المؤشر عند الدخول، ثم يتبعه بنعومة
    x.jump(e.clientX);
    y.jump(e.clientY);
    sx.jump(e.clientX);
    sy.jump(e.clientY);
    setHovering(true);
  };
  const onLeave = () => setHovering(false);

  return (
    // المسافة بين الأقسام: py-12 (هاتف) وpy-16 (أكبر). scroll-mt-6: مسافة إضافية فوق القسم
    // حين ننتقل إليه بزر Scroll down، حتى لا يلتصق العنوان بالناف بار
    <section id={id} className="scroll-mt-6 py-12 sm:py-16">
      {/* العنوان: LATEST كبيرًا مع العدد صغيرًا فوقه، و[ VIEW ALL ] يمينًا */}
      <header className="mb-10 flex items-start justify-between gap-6 sm:mb-14">
        <h2 className="font-sans text-[clamp(2.5rem,6vw,4.5rem)] font-medium uppercase leading-[0.85] tracking-[-0.06em]">
          Latest
          <sup className="ml-1 align-top font-mono text-[0.18em] font-bold tracking-normal">
            [{total}]
          </sup>
        </h2>
        <Link
          to={viewAllHref}
          className={`${MONO} mt-2 whitespace-nowrap underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current`}>
          <ScrambleText text="[ View all ]" />
        </Link>
      </header>

      {/* الشبكة: 2 عمود على الهاتف، 3 على المتوسطة، 5 على الكبيرة.
          items-end: كل صف ملتصق من الأسفل، فتقف الكتب على خط واحد كرف مكتبة.
          group/grid: حين يكون الماوس فوق الشبكة تُظلم كل الأغلفة إلا التي تحته */}
      <ul
        onPointerMove={onMove}
        className="group/grid grid list-none grid-cols-2 items-end gap-x-2.5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, i) => (
          <li key={`${item.href}-${i}`} className="group/item">
            <Link
              to={item.href}
              onPointerEnter={onEnter}
              onPointerLeave={onLeave}
              aria-label={`${item.title}, view project`}
              title={`${item.title} — ${FORMATS[item.format].label}`}
              className="group block [@media(hover:hover)]:cursor-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black">
              {/* كل الأغلفة بعرض العمود نفسه، والارتفاع وحده حسب نسبة مقاس الكتاب:
                  الأفقي قصير، والمربع متوسط، وكتاب الجيب أطول.
                  الإظلام بـ brightness (لا opacity): الغلاف يغمق بدل أن يبهت نحو الأبيض */}
              <div className="overflow-hidden bg-neutral-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)] transition-[filter] duration-500 [@media(hover:hover)]:group-hover/grid:brightness-[0.45] [@media(hover:hover)]:group-hover/item:!brightness-100">
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{
                    aspectRatio: `${FORMATS[item.format].w} / ${FORMATS[item.format].h}`,
                  }}
                  className="w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:transition-none"
                />
              </div>
              {/* رقم يسارًا واسم يمينًا، وتحتهما المقاس. تبهت مع الأغلفة الأخرى.
                  في الأغلفة الضيقة (كتاب الجيب) يُقص الاسم الطويل بـ "…"، والاسم كاملًا يظهر عند المرور (title) */}
              <div
                className={`${MONO} mt-2 flex justify-between gap-2 font-medium transition-opacity duration-500 [@media(hover:hover)]:group-hover/grid:opacity-30 [@media(hover:hover)]:group-hover/item:!opacity-100`}>
                <span className="shrink-0">{pad3(i + 1)}</span>
                <span className="truncate text-right">{item.title}</span>
              </div>
              <p
                className={`${MONO} mt-1 truncate font-medium text-black/40 transition-opacity duration-500 [@media(hover:hover)]:group-hover/grid:opacity-30 [@media(hover:hover)]:group-hover/item:!opacity-100`}>
                {FORMATS[item.format].w}×{FORMATS[item.format].h} in
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {/* النص الذي يحل محل المؤشر: أبيض على خلفية سوداء صغيرة، فيُقرأ فوق أي صورة */}
      <AnimatePresence>
        {hovering && (
          <motion.span
            aria-hidden="true"
            className={`${MONO} pointer-events-none fixed left-0 top-0 z-[60] whitespace-nowrap bg-black px-2 py-1.5 text-white`}
            style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            transition={{ duration: 0.18 }}>
            [ {cursorLabel} ]
          </motion.span>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LatestWorks;
