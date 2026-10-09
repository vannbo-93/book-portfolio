/** @format */
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { FORMATS, type LatestItem } from "../data/formats";

// شريط الأغلفة المتحرك: كل الأغلفة بنفس العرض، وارتفاع كل غلاف حسب مقاس كتابه الحقيقي،
// مصطفة من الأعلى على خط مستقيم، تمر من اليمين إلى اليسار بسرعة ثابتة دون توقف.
// القائمة تتكرر خلف نفسها، فلا تظهر نهاية ولا قفزة.
// عند مرور الماوس فوق أي غلاف: يبطئ الشريط تدريجيًا، وحين يبتعد الماوس يعود تدريجيًا إلى سرعته.

interface CoverMarqueeProps {
  items: LatestItem[];
  // السرعة بالبكسل في الثانية: أكبر = أسرع
  speed?: number;
}

// عرض كل غلاف: 18% من الشاشة (كما في صورتك)، لا أقل من 144px ولا أكثر من 352px
const COVER = "w-[clamp(9rem,18vw,22rem)]";
// المسافة بين الأغلفة
const GAP = "gap-1.5";

// السرعة أثناء مرور الماوس، كنسبة من السرعة العادية (0.15 = 15%). 0 = يتوقف تمامًا
const HOVER_SPEED = 0.15;
// سرعة الانتقال بين السرعتين: أكبر = يبطئ ويعود أسرع
const EASE_RATE = 4;

interface CoversProps {
  items: LatestItem[];
  hidden?: boolean;
  onHover?: (on: boolean) => void;
}

const Covers = ({ items, hidden, onHover }: CoversProps) => (
  // pr-1.5: نفس المسافة بعد آخر غلاف، حتى يكون الفاصل بين النسختين مثل الفاصل بين الأغلفة
  <ul
    aria-hidden={hidden}
    className={`flex shrink-0 list-none items-start pr-1.5 ${GAP}`}>
    {items.map((item, i) => (
      <li
        key={`${item.href}-${i}`}
        className={`${COVER} shrink-0`}
        // فقط للماوس: على اللمس لا يوجد "مرور"
        onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onHover?.(false)}>
        <Link
          to={item.href}
          tabIndex={hidden ? -1 : undefined}
          className="block bg-neutral-900">
          <img
            src={item.src}
            alt={hidden ? "" : item.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{
              aspectRatio: `${FORMATS[item.format].w} / ${FORMATS[item.format].h}`,
            }}
            className="block w-full object-cover"
          />
        </Link>
      </li>
    ))}
  </ul>
);

const CoverMarquee = ({ items, speed = 60 }: CoverMarqueeProps) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  // لا نحرك الشريط وهو خارج الشاشة (توفير للمعالج)
  const inView = useInView(ref, { margin: "200px 0px" });

  const x = useMotionValue(0);
  // عرض نسخة واحدة من القائمة، وعدد النسخ اللازمة لملء الشاشة دائمًا
  const setW = useRef(0);
  const [copies, setCopies] = useState(2);

  // نسبة السرعة الحالية (1 = عادية)، وما نتجه إليه: تتغير تدريجيًا لا دفعة واحدة
  const factor = useRef(1);
  const target = useRef(1);
  const onHover = (on: boolean) => (target.current = on ? HOVER_SPEED : 1);

  useLayoutEffect(() => {
    const el = firstRef.current;
    if (!el) return;
    const measure = () => {
      setW.current = el.offsetWidth;
      // نسخ كافية حتى لا يظهر فراغ على اليمين حتى في الشاشات العريضة، + نسخة احتياط
      if (setW.current)
        setCopies(Math.max(2, Math.ceil(window.innerWidth / setW.current) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || !setW.current) return;
    const dt = delta / 1000;
    // تقترب النسبة الحالية من الهدف بنعومة (تباطؤ ثم عودة دون قفزة)
    factor.current +=
      (target.current - factor.current) * Math.min(1, dt * EASE_RATE);
    let v = x.get() - speed * factor.current * dt;
    // حين تخرج نسخة كاملة من اليسار، نعيد الشريط بمقدار عرضها: الصورة على الشاشة متطابقة فلا تُرى القفزة
    if (v <= -setW.current) v += setW.current;
    x.set(v);
  });

  // لمن فعّل "تقليل الحركة": صف ثابت يُمرَّر باليد
  if (reduce) {
    return (
      <section
        ref={ref}
        aria-label="Exclusive covers"
        className="overflow-x-auto py-12 sm:py-16">
        <Covers items={items} />
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Exclusive covers"
      className="overflow-hidden py-12 sm:py-16">
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        <div ref={firstRef} className="flex shrink-0">
          <Covers items={items} onHover={onHover} />
        </div>
        {Array.from({ length: copies - 1 }, (_, i) => (
          <Covers key={i} items={items} hidden onHover={onHover} />
        ))}
      </motion.div>
    </section>
  );
};

export default CoverMarquee;
