/** @format */
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import ScrambleText from "./ScrambleText";
import { scrollToElement } from "../lib/scroll";
import { FORMATS, type LatestItem } from "../data/formats";

// القسم الأول في صفحة الخدمات: خلفية سوداء، عنوان في المنتصف.
// مع حركة الماوس تظهر أغلفة الموقع خلفه واحدًا بعد الآخر على طريق الماوس، بمقاساتها المختلفة،
// كل غلاف يظهر بنعومة ثم يبهت ويتلاشى بضبابية.
// [ Scroll down ] في الأسفل ينقل إلى القسم التالي.

interface ServicesHeroProps {
  covers: LatestItem[];
  heading: string;
  left: string;
  right: string;
  // معرّف القسم التالي الذي ينقل إليه زر Scroll down
  nextId: string;
}

// المسافة التي يقطعها الماوس (بالبكسل) قبل أن يظهر غلاف جديد: أصغر = أغلفة أكثر
const SPACING = 90;
// كم يبقى كل غلاف قبل أن يبدأ بالتلاشي (ms)
const LIFE = 900;
// أقصى عدد أغلفة على الشاشة معًا
const MAX = 10;

interface Trail {
  id: number;
  x: number;
  y: number;
  item: LatestItem;
}

const ServicesHero = ({
  covers,
  heading,
  left,
  right,
  nextId,
}: ServicesHeroProps) => {
  const reduce = useReducedMotion();
  const [trail, setTrail] = useState<Trail[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  // تحميل الصور مسبقًا حتى لا يظهر الغلاف فارغًا ثم تقفز الصورة فيه
  useEffect(() => {
    covers.forEach((c) => {
      const img = new Image();
      img.src = c.src;
    });
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [covers]);

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse" || !covers.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    // غلاف جديد فقط بعد أن يتحرك الماوس مسافة كافية
    if (
      last.current &&
      Math.hypot(x - last.current.x, y - last.current.y) < SPACING
    )
      return;
    last.current = { x, y };

    const id = counter.current++;
    const item = covers[id % covers.length];
    setTrail((t) => [...t.slice(-(MAX - 1)), { id, x, y, item }]);
    timers.current.push(
      window.setTimeout(
        () => setTrail((t) => t.filter((p) => p.id !== id)),
        LIFE,
      ),
    );
  };

  const scrollDown = () => scrollToElement(document.getElementById(nextId));

  return (
    <section
      data-nav="dark"
      onPointerMove={onMove}
      onPointerLeave={() => (last.current = null)}
      className="relative h-screen min-h-[32rem] overflow-hidden bg-black text-white">
      {/* الأغلفة: خلف النص، لا تلتقط الماوس */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {trail.map((p) => (
            <motion.img
              key={p.id}
              src={p.item.src}
              alt=""
              draggable={false}
              // كل الأغلفة بنفس العرض، والارتفاع حسب مقاس الكتاب
              style={{
                left: p.x,
                top: p.y,
                // مركز الغلاف على مكان الماوس
                x: "-50%",
                y: "-50%",
                aspectRatio: `${FORMATS[p.item.format].w} / ${FORMATS[p.item.format].h}`,
              }}
              className="absolute w-[clamp(7rem,10vw,12rem)] object-cover"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* النصوص فوق الأغلفة */}
      <div
        className={`${SITE} pointer-events-none relative flex h-full flex-col justify-center`}>
        <div className="grid grid-cols-[1fr_auto] items-start gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <p className={`${MONO} font-medium`}>{left}</p>
          <p className={`${MONO} text-right font-medium lg:order-last`}>
            {right}
          </p>
          <h1 className="col-span-2 mx-auto max-w-[18ch] text-center font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.95] tracking-[-0.06em] lg:col-span-1">
            {heading}
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollDown}
        className={`${MONO} absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white`}>
        <ScrambleText text="[ Scroll down ]" />
      </button>
    </section>
  );
};

export default ServicesHero;
