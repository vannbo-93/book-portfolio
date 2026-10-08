/** @format */
import { useCallback, useLayoutEffect, useRef } from "react";
import {
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

// شبكة صور تتحرك مع التمرير: "let's scroll" من Jhey Tompkins، بنسخة Motion التي أرسلتها،
// محوّلة إلى مكوّن React بنفس الأرقام والمنحنيات:
//   - الصورة الوسطى تبدأ بمقاس الشاشة، ويصغر عرضها وارتفاعها (كلٌّ بمنحناه) حتى مقاس خانتها
//   - ثلاث طبقات حولها: كل طبقة تكبر من 0 بعد 30% من مداها، وتظهر بعد 55% منه،
//     والطبقات الداخلية تنتهي أبكر قليلًا من الخارجية
//
// الشبكة 5 أعمدة × 3 صفوف. على الشاشات حتى 600px: 3 أعمدة، وتختفي الطبقة الخارجية
// ويزاح الباقي عمودًا لليسار (--offset: -1)، كما في الـ CSS الأصلي

export interface GridImage {
  src: string;
  alt: string;
}

interface ScrollGridProps {
  outer: GridImage[]; // 6
  inner: GridImage[]; // 6
  center: GridImage[]; // 2
  hero: GridImage;
  className?: string;
}

// القسم بارتفاع 240vh كما في الأصل (min-height: 240vh)، فمسافة التمرير = 140vh
const SECTION_VH = 240;
const SCROLL_VH = SECTION_VH - 100;
// أين تنتهي حركة على مقياس التمرير من 0 إلى 1،
// إذا كانت تنتهي حين تصل نسبة `fraction` من القسم إلى أسفل الشاشة
const endAt = (fraction: number) => (fraction * SECTION_VH - 100) / SCROLL_VH;

// الصورة الوسطى: offset ['start start', '80% end'] في الأصل
const HERO_END = endAt(0.8);
// كل طبقة: offset ['start start', `${1 - index * 0.05} end`]
const LAYER_END = [endAt(1), endAt(0.95), endAt(0.9)];

// المنحنيات كما في الأصل (مقابلاتها في GSAP بين قوسين)
// منحنى واحد للعرض والارتفاع معًا، فتبقى نسبة الغلاف 2:3 ثابتة طوال التصغير
const EASE_HERO = cubicBezier(0.65, 0, 0.35, 1); // power2.inOut

// الغلاف في البداية: أكبر غلاف بنسبة 2:3 يتسع في الشاشة تحت الـ navbar
const COVER_RATIO = 2 / 3; // العرض ÷ الارتفاع
const NAV_SPACE = 100; // المسافة المحجوزة أعلى الشاشة للـ navbar (px)
const SIDE_SPACE = 32; // أقل هامش جانبي على الشاشات الضيقة (px)
const EASE_FADE = cubicBezier(0.61, 1, 0.88, 1); // sine.out
const EASE_SCALE = [
  cubicBezier(0.42, 0, 0.58, 1), // الطبقة 1: power1.inOut
  cubicBezier(0.76, 0, 0.24, 1), // الطبقة 2: power3.inOut
  cubicBezier(0.87, 0, 0.13, 1), // الطبقة 3: power4.inOut
];
// موضع p داخل المقطع [from, to] كنسبة محصورة بين 0 و1
const segment = (p: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (p - from) / (to - from)));

// مواضع الصور: [العمود, الصف]. الأعمدة بصيغة CSS لأنها تعتمد على --offset
// (الأرقام السالبة تُعدّ من اليمين: -2 هو العمود الأخير)
const OUTER_POS: [string, number][] = [
  ["1", 1],
  ["-2", 1],
  ["1", 2],
  ["-2", 2],
  ["1", 3],
  ["-2", 3],
];
const INNER_POS: [string, number][] = [
  ["calc(2 + var(--offset))", 1],
  ["calc(-3 - var(--offset))", 1],
  ["calc(2 + var(--offset))", 2],
  ["calc(-3 - var(--offset))", 2],
  ["calc(2 + var(--offset))", 3],
  ["calc(-3 - var(--offset))", 3],
];
const CENTER_POS: [string, number][] = [
  ["calc(3 + var(--offset))", 1],
  ["calc(3 + var(--offset))", -1],
];

const IMG = "block aspect-[2/3] w-full rounded-2xl object-cover bg-neutral-200";

const Layer = ({
  images,
  positions,
  progress,
  index,
  reduce,
  className = "",
}: {
  images: GridImage[];
  positions: [string, number][];
  progress: MotionValue<number>;
  index: number;
  reduce: boolean;
  className?: string;
}) => {
  const end = LAYER_END[index];
  // الحساب يدوي مع حصر صريح بين 0 و1: في Motion 12 لا تُحصر القيم بعد نهاية المدى
  // مع منحنيات مخصصة، فتبقى الطبقات التي ينتهي مداها قبل نهاية القسم مخفية
  // opacity: [0, 0, 1] عند [0, 55%, 100%] من مدى الطبقة
  const opacity = useTransform(progress, (p) =>
    EASE_FADE(segment(p, end * 0.55, end)),
  );
  // scale: [0, 0, 1] عند [0, 30%, 100%] من مدى الطبقة
  const scale = useTransform(progress, (p) =>
    EASE_SCALE[index](segment(p, end * 0.3, end)),
  );
  return (
    <motion.div
      className={`col-span-full row-span-full grid grid-cols-subgrid grid-rows-subgrid ${className}`}
      style={reduce ? undefined : { opacity, scale }}>
      {images.slice(0, positions.length).map((img, i) => (
        <div
          key={i}
          style={{ gridColumn: positions[i][0], gridRow: positions[i][1] }}>
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            decoding="async"
            className={IMG}
          />
        </div>
      ))}
    </motion.div>
  );
};

const ScrollGrid = ({
  outer,
  inner,
  center,
  hero,
  className = "",
}: ScrollGridProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ---- الصورة الوسطى: غلاف كبير بنسبة 2:3 يصغر إلى مقاس الخانة ----
  const size = useRef({ vw: 0, vh: 0, w: 0, h: 0 });
  const heroW = useMotionValue<number | string>("100%");
  const heroH = useMotionValue<number | string>("100%");

  const updateHero = useCallback(() => {
    const { vw, vh, w, h } = size.current;
    if (!w || !h) return;
    const t = EASE_HERO(
      Math.min(1, Math.max(0, scrollYProgress.get() / HERO_END)),
    );
    // مقاس البداية: مركز الخانة أسفل منتصف الشاشة بـ 2.5rem (40px)، فالمساحة المتاحة
    // فوقه حتى الـ navbar = vh/2 + 40 − NAV_SPACE، ونفسها تحته حتى أسفل الشاشة
    let startH = vh - 2 * (NAV_SPACE - 40);
    let startW = startH * COVER_RATIO;
    // على الشاشات الضيقة (الهاتف) يحدّه العرض لا الارتفاع
    if (startW > vw - SIDE_SPACE) {
      startW = vw - SIDE_SPACE;
      startH = startW / COVER_RATIO;
    }
    heroW.set(startW + (w - startW) * t);
    heroH.set(startH + (h - startH) * t);
  }, [scrollYProgress, heroW, heroH]);
  useMotionValueEvent(scrollYProgress, "change", updateHero);

  // نقيس مقاس الخانة ومقاس الشاشة، ونعيد القياس عند تغيّر الحجم (الأصل يقيس مرة واحدة فقط)
  useLayoutEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    const cell = cellRef.current;
    if (!stage || !cell) return;
    const measure = () => {
      size.current = {
        vw: stage.clientWidth,
        vh: stage.clientHeight,
        w: cell.offsetWidth,
        h: cell.offsetHeight,
      };
      updateHero();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(cell);
    return () => ro.disconnect();
  }, [reduce, updateHero]);

  return (
    <section
      ref={sectionRef}
      className={`relative ${className}`}
      style={{ minHeight: reduce ? undefined : `${SECTION_VH}vh` }}>
      <div
        ref={stageRef}
        className={`${reduce ? "relative min-h-screen" : "sticky top-0 h-screen"} overflow-hidden`}>
        {/* الشبكة كاملة داخل الشاشة في نهاية المشهد:
            العرض هو الأصغر بين: عرض حدود الموقع (SITE في App)، والعرض الذي يجعل الصفوف الثلاثة
            تتسع في ارتفاع الشاشة ناقص مساحة الـ navbar (9rem).
            حساب الارتفاع: الصورة 2:3 (نسبة غلاف الكتاب)، فارتفاع الشبكة = 0.9 × العرض − 1.6 × الفاصل (5 أعمدة)
                                                    = 1.5 × العرض − الفاصل (3 أعمدة على الهاتف)
            وتُوضع في منتصف المساحة تحت الـ navbar (top: 50% + 2.5rem) */}
        <div className="absolute left-1/2 top-[calc(50%_+_2.5rem)] grid w-[min(100%,calc((100svh_-_9rem_+_var(--gap)*1.6)/0.9))] -translate-x-1/2 -translate-y-1/2 grid-cols-5 grid-rows-[repeat(3,auto)] content-center gap-[var(--gap)] [--gap:clamp(10px,2vw,32px)] [--offset:0] max-[600px]:w-[min(100%,calc((100svh_-_9rem_+_var(--gap))/1.5))] max-[600px]:grid-cols-3 max-[600px]:[--offset:-1]">
          {/* الطبقة الخارجية تختفي على الشاشات الصغيرة */}
          <Layer
            images={outer}
            positions={OUTER_POS}
            progress={scrollYProgress}
            index={0}
            reduce={reduce}
            className="max-[600px]:hidden"
          />
          <Layer
            images={inner}
            positions={INNER_POS}
            progress={scrollYProgress}
            index={1}
            reduce={reduce}
          />
          <Layer
            images={center}
            positions={CENTER_POS}
            progress={scrollYProgress}
            index={2}
            reduce={reduce}
          />

          {/* الصورة الوسطى: فوق الطبقات، في منتصف خانتها، وتمتد خارجها في البداية */}
          <div
            ref={cellRef}
            className="relative z-[2]"
            style={{ gridColumn: "calc(3 + var(--offset))", gridRow: 2 }}>
            <motion.img
              src={hero.src}
              alt={hero.alt}
              decoding="async"
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rounded-2xl object-cover bg-neutral-200"
              style={{
                width: reduce ? "100%" : heroW,
                height: reduce ? "100%" : heroH,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollGrid;
