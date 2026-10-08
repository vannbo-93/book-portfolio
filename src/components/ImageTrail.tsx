/** @format */
import { useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";

// أثر صور يلاحق الماوس: كلما تحرك المؤشر مسافة كافية، تظهر صورة عند موضعه
// ثم تصغر وتختفي، فتبدو الصور كأنها تلاحق السهم.
// مبني على فكرة Image Trail (المتغير 1)، مكتوب بـ Motion بدل GSAP.
// يعمل بالماوس، وباللمس عند سحب الإصبع داخل القسم.

interface ImageTrailProps {
  items: string[];
  // المسافة بالبكسل التي يجب أن يقطعها المؤشر قبل ظهور صورة جديدة
  threshold?: number;
  className?: string;
  children?: ReactNode;
}

// منحنيات تقابل power1.out وpower3.out في GSAP
const EASE_MOVE = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_OUT = [0.165, 0.84, 0.44, 1] as const;

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

const ImageTrail = ({
  items,
  threshold = 80,
  className = "",
  children,
}: ImageTrailProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduce) return;

    const images = imageRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (!images.length) return;

    const mouse = { x: 0, y: 0 }; // موضع المؤشر الحالي داخل القسم
    const smooth = { x: 0, y: 0 }; // موضع متأخر قليلًا عنه، تنطلق منه الصورة
    const last = { x: 0, y: 0 }; // موضع آخر صورة ظهرت
    let index = -1;
    let zIndex = 1;
    let active = 0; // عدد الصور الظاهرة الآن
    let rafId = 0;
    let inside = false;
    const running = new Map<HTMLDivElement, AnimationPlaybackControls[]>();

    const localPos = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const showNext = () => {
      // علامة على القسم: الزائر بدأ يرسم الأثر فعلًا (يستعملها النص لإخفاء التعليمة)
      container.dataset.trailing = "";
      index = (index + 1) % images.length;
      const el = images[index];
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      // نوقف أي حركة سابقة على هذه الصورة قبل إعادة استعمالها
      running.get(el)?.forEach((c) => c.stop());
      el.style.zIndex = String(++zIndex);
      active++;

      // الحركة: من الموضع المتأخر إلى موضع المؤشر، أبطأ قليلًا لتنزلق الصورة بنعومة
      const appear = animate(
        el,
        {
          x: [smooth.x - w / 2, mouse.x - w / 2],
          y: [smooth.y - h / 2, mouse.y - h / 2],
        },
        { duration: 0.6, ease: EASE_MOVE },
      );
      // الظهور ثم الاختفاء في حركة واحدة (حركتان منفصلتان على opacity تلغي إحداهما الأخرى):
      // 1. تظهر تدريجيًا وتكبر قليلًا من 85% إلى حجمها، بدل أن تقفز فجأة كاملة
      // 2. تبقى ظاهرة لحظة
      // 3. تتلاشى وتصغر قليلًا فقط (إلى 90%)، بدل أن تنكمش إلى 20% فتبدو كفقاعة تنفجر
      const vanish = animate(
        el,
        { opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 0.9] },
        {
          duration: 1.1,
          times: [0, 0.25, 0.55, 1],
          ease: [EASE_OUT, "linear", "easeIn"],
        },
      );
      running.set(el, [appear, vanish]);
      vanish.finished.then(() => {
        active = Math.max(0, active - 1);
        // حين تختفي كل الصور، يعود ترتيب الطبقات من البداية
        if (active === 0) zIndex = 1;
      });
    };

    const loop = () => {
      rafId = 0;
      smooth.x = lerp(smooth.x, mouse.x, 0.1);
      smooth.y = lerp(smooth.y, mouse.y, 0.1);
      if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > threshold) {
        showNext();
        last.x = mouse.x;
        last.y = mouse.y;
      }
      // الحلقة تعمل فقط والمؤشر داخل القسم، لا طوال الوقت كما في الأصل
      if (inside) rafId = requestAnimationFrame(loop);
    };

    const onEnter = (e: PointerEvent) => {
      const p = localPos(e);
      mouse.x = smooth.x = last.x = p.x;
      mouse.y = smooth.y = last.y = p.y;
      inside = true;
      if (!rafId) rafId = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (!inside) onEnter(e);
      const p = localPos(e);
      mouse.x = p.x;
      mouse.y = p.y;
    };
    const onLeave = () => {
      inside = false;
      delete container.dataset.trailing;
    };

    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointercancel", onLeave);

    return () => {
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointercancel", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      delete container.dataset.trailing;
      running.forEach((list) => list.forEach((c) => c.stop()));
    };
  }, [items, threshold, reduce]);

  return (
    // touch-pan-y: على الهاتف يبقى السحب العمودي لتمرير الصفحة، والسحب الأفقي يرسم الأثر
    <div
      ref={containerRef}
      className={`relative touch-pan-y overflow-hidden ${className}`}>
      {children}
      {items.map((src, i) => (
        <div
          key={i}
          ref={(el) => {
            imageRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 aspect-[2/3] w-[150px] overflow-hidden rounded-[15px] opacity-0 will-change-transform max-sm:w-[100px]">
          <img
            src={src}
            alt=""
            decoding="async"
            className="absolute -left-2.5 -top-2.5 h-[calc(100%+20px)] w-[calc(100%+20px)] max-w-none object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageTrail;
