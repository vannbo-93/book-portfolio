/** @format */
import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

// قسم الوسيط المتمدد:
//   1. في منتصف القسم مربع أسود صغير (مكان مقطع الفيديو لاحقًا)
//   2. حين يستقر القسم في الشاشة (بدايته في أعلاها)، يثبت المشهد
//   3. مع كل تمرير يكبر المربع من المنتصف حتى يغطي الشاشة كاملة
//   4. يبقى مغطيًا قليلًا، ثم يتحرر المشهد ونكمل النزول إلى القسم التالي
//
// لوضع مقطع الفيديو لاحقًا:
//   <MediaExpand>
//     <video src="/videos/reel.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />
//   </MediaExpand>

interface MediaExpandProps {
  // المحتوى داخل المربع (فيديو أو صورة). بدونه: أسود
  children?: ReactNode;
  // طول مسافة التمرير للمشهد، بالشاشات: أكبر = تكبير أبطأ
  screens?: number;
  // العنوان: نصفان يقتربان من الطرفين ويلتقيان في المنتصف. مثلًا left="Show" right="case"
  titleLeft?: string;
  titleRight?: string;
}

// أين يبدأ كل نصف، بالنسبة لنصف عرض الإطار: 1 = عند حافته تمامًا، 1.1 = خارجها قليلًا (مخفي ثم يدخل).
// أصغر (0.8 مثلًا) = يظهر النصفان داخل الإطار من البداية
const TITLE_SPREAD = 1.1;

// حجم المربع في البداية، كنسبة من الشاشة (كما في صورتك: نحو خُمس العرض وربع الارتفاع).
// على الهاتف أكبر، لأن خُمس عرض الهاتف صغير جدًا
const START = { w: 0.22, h: 0.24 };
const START_MOBILE = { w: 0.6, h: 0.22 };

// التكبير يحدث في أول 80% من المشهد، وآخر 20%: المربع يغطي الشاشة قبل أن يتحرر
const GROW_END = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 2); // يبدأ أسرع قليلًا ثم يهدأ عند الاكتمال

const MediaExpand = ({
  children,
  screens = 3,
  titleLeft = "Show",
  titleRight = "case",
}: MediaExpandProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // حجم الشاشة: قيمة متحركة، فيُعاد حساب المربع فورًا حين يتغير حجم النافذة
  const vw = useMotionValue(window.innerWidth);
  const vh = useMotionValue(window.innerHeight);
  useEffect(() => {
    const measure = () => {
      vw.set(window.innerWidth);
      vh.set(window.innerHeight);
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [vw, vh]);

  // المربع طبقة بحجم الشاشة كاملة، نقص منها (clip-path) ما حول المنتصف.
  // التكبير = تقليل القص حتى يصير صفرًا. أخف على المتصفح من تغيير العرض والارتفاع
  // عرض الإطار وارتفاعه الآن بالبكسل (من الصغير إلى الشاشة كاملة)
  const box = () => {
    const w = vw.get();
    const h = vh.get();
    const start = w < 640 ? START_MOBILE : START;
    const t = ease(clamp01(scrollYProgress.get() / GROW_END));
    return {
      w,
      h,
      bw: w * (start.w + (1 - start.w) * t),
      bh: h * (start.h + (1 - start.h) * t),
    };
  };
  const clipPath = useTransform(() => {
    const { w, h, bw, bh } = box();
    const x = Math.round((w - bw) / 2);
    const y = Math.round((h - bh) / 2);
    return `inset(${y}px ${x}px ${y}px ${x}px)`;
  });

  // العنوان: كل نصف يبدأ بعيدًا عن المنتصف (بالقرب من حافتي الشاشة، مخفيًا خارج الإطار الصغير)،
  // ثم يقتربان مع التمرير ويلتقيان في المنتصف لحظة يغطي الإطار الشاشة.
  // الحركة أبطأ من الإطار في البداية ثم تلحق به (t²)، فيدخل النصفان الإطار من حافتيه كما في الصور
  const gap = useTransform(() => {
    const { bw } = box();
    const t = ease(clamp01(scrollYProgress.get() / GROW_END));
    // المسافة نسبة من نصف عرض الإطار: يبدأ كل نصف عند حافة الإطار تمامًا (مقصوصًا)، فيدخل منها
    return Math.round((bw / 2) * TITLE_SPREAD * (1 - t * t));
  });
  const leftX = useTransform(gap, (g) => -g);

  // المحتوى داخله يصغر قليلًا من 1.3 إلى 1 أثناء التكبير، فيبدو أنه يقترب منك لا أنه يُكشف فقط
  const scale = useTransform(scrollYProgress, [0, GROW_END], [1.3, 1]);

  const media = children ?? <div className="h-full w-full bg-black" />;

  // لمن فعّل "تقليل الحركة": المربع بحجم الشاشة مباشرة، بلا تثبيت
  if (reduce) {
    return (
      <section data-nav="dark" className="relative h-screen overflow-hidden">
        {media}
        <h2 className="absolute inset-0 flex items-center justify-center font-sans text-[clamp(2.5rem,3.4vw,4.5rem)] font-medium uppercase leading-none tracking-[-0.05em] text-white">
          {titleLeft}
          {titleRight}
        </h2>
      </section>
    );
  }

  return (
    // الطول الكلي = مسافة التمرير التي يحدث خلالها التكبير
    <section
      ref={ref}
      className="relative"
      style={{ height: `${screens * 100}vh` }}>
      {/* المسرح: يثبت في أعلى الشاشة طوال المشهد، والمربع في منتصفه */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* data-nav="dark": حين يصل المربع تحت الناف بار يصير لونه فاتحًا */}
        <motion.div
          data-nav="dark"
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
          style={{ clipPath }}>
          <motion.div
            className="h-full w-full will-change-transform"
            style={{ scale }}>
            {media}
          </motion.div>
          {/* العنوان فوق المحتوى في منتصف الإطار، أبيض حتى يُقرأ فوق الأسود أو الفيديو.
              النصفان ملتصقان في المنتصف (الأيسر ينتهي عند المنتصف، والأيمن يبدأ منه)، وكل منهما يُزاح بعيدًا */}
          <h2 className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap font-sans text-[clamp(2.5rem,3.4vw,4.5rem)] font-medium uppercase leading-none tracking-[-0.05em] text-white">
            <span className="sr-only">
              {titleLeft}
              {titleRight}
            </span>
            <motion.span
              aria-hidden="true"
              className="flex flex-1 justify-end will-change-transform"
              style={{ x: leftX }}>
              {titleLeft}
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="flex flex-1 justify-start will-change-transform"
              style={{ x: gap }}>
              {titleRight}
            </motion.span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default MediaExpand;
