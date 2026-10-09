/** @format */
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import {
  TESTIMONIALS,
  TESTIMONIALS_TEXT,
  type Testimonial,
} from "../data/testimonials";

// قسم آراء العملاء: خلفية سوداء، عنوان كبير في المنتصف، وتحته تعليق واحد في كل مرة
// (التعليق، ثم صورة العميل، ثم اسمه وصفته).
// التنقل: نصف القسم الأيسر = التعليق السابق، والأيمن = التالي.
// عند تحريك الماوس فوق القسم: يختفي المؤشر ويظهر مكانه [ PREVIOUS ] في النصف الأيسر و[ NEXT ] في الأيمن.
// على الهاتف: نفس الشيء باللمس (اضغط يسار القسم أو يمينه).

const pad2 = (n: number) => String(n).padStart(2, "0");

// الأحرف الأولى من الاسم، مكان الصورة إلى أن تتوفر
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Avatar = ({ t }: { t: Testimonial }) =>
  t.photo ? (
    <img
      src={t.photo}
      alt=""
      className="h-12 w-12 rounded-full object-cover grayscale"
    />
  ) : (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-sans text-base font-medium tracking-[-0.02em]">
      {initials(t.name)}
    </span>
  );

const Testimonials = () => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  // اتجاه آخر تنقل: 1 = التالي، -1 = السابق (يحدد من أين يدخل التعليق الجديد)
  const [dir, setDir] = useState(1);
  const [side, setSide] = useState<"prev" | "next" | null>(null);

  const count = TESTIMONIALS.length;
  const go = (d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + count) % count);
  };
  const t = TESTIMONIALS[index];

  // النص الذي يتبع الماوس
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX);
    y.set(e.clientY);
    if (!side) {
      // أول دخول: يقفز النص إلى مكان المؤشر فورًا
      sx.jump(e.clientX);
      sy.jump(e.clientY);
    }
    setSide(e.clientX < r.left + r.width / 2 ? "prev" : "next");
  };

  return (
    // data-nav="dark": الناف بار يصير أبيض فوق هذا القسم
    <section
      data-nav="dark"
      onPointerMove={onMove}
      onPointerLeave={() => setSide(null)}
      className="relative bg-black py-24 text-white sm:py-32 [@media(hover:hover)]:cursor-none">
      {/* نصفا القسم: زران حقيقيان (يعملان بالماوس واللمس ولوحة المفاتيح)، خلف المحتوى */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous testimonial"
        className="absolute inset-y-0 left-0 w-1/2 [@media(hover:hover)]:cursor-none focus-visible:outline-1 focus-visible:-outline-offset-8 focus-visible:outline-white"
      />
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next testimonial"
        className="absolute inset-y-0 right-0 w-1/2 [@media(hover:hover)]:cursor-none focus-visible:outline-1 focus-visible:-outline-offset-8 focus-visible:outline-white"
      />

      {/* المحتوى فوق الزرين، لكنه لا يلتقط الضغط (pointer-events-none) فيصل الضغط إلى الزر تحته */}
      <div className={`${SITE} pointer-events-none relative`}>
        {/* TRUST يسارًا، والعنوان في المنتصف، وTESTIMONIAL يمينًا */}
        <div className="grid grid-cols-[1fr_auto] items-start gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <p className={`${MONO} font-medium`}>{TESTIMONIALS_TEXT.left}</p>
          <p className={`${MONO} font-medium text-right lg:order-last`}>
            {TESTIMONIALS_TEXT.right}
          </p>
          <h2 className="col-span-2 text-center font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em] lg:col-span-1">
            {TESTIMONIALS_TEXT.heading}
          </h2>
        </div>

        {/* التعليق الحالي: يخرج القديم ويدخل الجديد من جهة التنقل */}
        <div className="mx-auto mt-16 flex min-h-[18rem] max-w-md flex-col items-center text-center sm:mt-20">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.figure
              key={index}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
              aria-live="polite">
              <blockquote className="font-sans text-[clamp(1rem,1.1vw,1.125rem)] font-medium normal-case leading-snug tracking-[-0.01em]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-12 flex flex-col items-center">
                <Avatar t={t} />
                <span className={`${MONO} mt-6`}>{t.name}</span>
                <span className={`${MONO} mt-1.5 font-medium text-white/55`}>
                  {t.role}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* العداد: أي تعليق من كم */}
        <p className={`${MONO} mt-10 text-center font-medium text-white/55`}>
          {pad2(index + 1)} / {pad2(count)}
        </p>
      </div>

      {/* النص الذي يحل محل المؤشر: أسود على خلفية بيضاء صغيرة */}
      <AnimatePresence>
        {side && (
          <motion.span
            aria-hidden="true"
            className={`${MONO} pointer-events-none fixed left-0 top-0 z-[60] whitespace-nowrap bg-white px-2 py-1.5 text-black`}
            style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
            transition={{ duration: 0.18 }}>
            [ {side === "prev" ? "Previous" : "Next"} ]
          </motion.span>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Testimonials;
