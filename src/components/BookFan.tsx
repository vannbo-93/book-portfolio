/** @format */
import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

// كتاب ثلاثي الأبعاد بتحويلات CSS فقط (بلا WebGL ولا Three.js):
// كل صفحة عنصر مسطح يدور حول حافته اليسرى، وكل الحواف تلتقي في محور واحد هو كعب الكتاب.
// عند التحميل ينفتح الكتاب من صفحات مكدسة إلى مروحة كاملة،
// القسم بارتفاع شاشة واحدة فقط: التمرير لا يدير الكتاب، بل ينتقل مباشرة إلى القسم التالي.
// بالماوس: السحب يدير الكتاب (مع اندفاع عند الإفلات)، وحركة المؤشر تميله قليلًا.
// وفوق كل ذلك يدور الكتاب حول نفسه ببطء وبلا توقف (autoSpin).

export interface FanItem {
  src: string;
  alt: string;
  // إن وُجد، تصبح الصفحة رابطًا (مثلًا إلى صفحة الكتاب)
  href?: string;
}

interface BookFanProps {
  items: FanItem[];
  // ميل محور الكتاب: يجعل المشهد يبدو ثلاثي الأبعاد بدل دوران مسطح
  tiltX?: number;
  tiltZ?: number;
  // دوران تلقائي مستمر حول الكعب، بالدرجات في الثانية (0 = بلا دوران تلقائي)
  autoSpin?: number;
  // نصوص فوق المشهد (مثل زر Scroll down)
  children?: ReactNode;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// المسافة بين حافة كل صفحة ومحور الدوران (كعب الكتاب)، بالبكسل
const SPINE_GAP = 2;

// وجه صفحة: مخفي حين يكون ظهره للكاميرا، هو وكل ما بداخله (مع بادئة -webkit- لـ Safari)
const FACE =
  "absolute inset-0 overflow-hidden rounded-[3px] " +
  "[backface-visibility:hidden] [-webkit-backface-visibility:hidden] " +
  "[&_*]:[backface-visibility:hidden] [&_*]:[-webkit-backface-visibility:hidden]";

const Page = ({
  item,
  index,
  count,
  rotation,
  openness,
}: {
  item: FanItem;
  index: number;
  count: number;
  rotation: MotionValue<number>;
  openness: MotionValue<number>;
}) => {
  // زاوية الصفحة = دوران الكتاب كله + نصيبها من المروحة.
  // openness من 0 (صفحات مكدسة) إلى 1 (مروحة كاملة 360 درجة)
  // + index * 0.4: فرق صغير ثابت بين الصفحات، فلا تتطابق أبدًا في المستوى نفسه
  // (مثلًا عند بداية الانفتاح حين تكون كلها مكدسة)، وإلا تتنازع على البكسلات وتومض
  const rotateY = useTransform(
    () => rotation.get() + index * ((360 / count) * openness.get() + 0.4),
  );

  const front = (
    <img
      src={item.src}
      alt={item.alt}
      draggable={false}
      loading={index < 4 ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full select-none object-cover"
    />
  );

  return (
    // الصفحة تبدأ على بُعد SPINE_GAP من محور الدوران بدل أن تلمسه.
    // لو التقت حواف كل الصفحات على خط واحد تمامًا، لا يعرف كرت الشاشة أيها في الأمام
    // على ذلك الخط، فيقسم بعض الصفحات ويرسم جزءًا منها خلف جارتها: تبدو "مقسومة"
    <motion.div
      className="absolute top-1/2 h-[var(--page-h)] w-[var(--page-w)]"
      style={{
        left: `calc(50% + ${SPINE_GAP}px)`,
        rotateY,
        y: "-50%",
        transformOrigin: `${-SPINE_GAP}px 50%`,
        transformStyle: "preserve-3d",
      }}>
      {/* الوجهان الأمامي والخلفي يفصل بينهما 1px في العمق (translateZ).
          لو كانا في المستوى نفسه تمامًا، يتنازعان على البكسلات نفسها (z-fighting)
          فتبدو الصفحة مقسومة إلى قطع من وجهين مختلفين.
          وإخفاء الظهر مطبَّق على الصور داخلها أيضًا، لأن Chrome قد يرسم الصورة في طبقة مستقلة
          لا ترث الإخفاء من الحاوية */}
      <div
        className={`${FACE} bg-neutral-200 shadow-[0_10px_30px_rgba(0,0,0,0.25)] [transform:translateZ(0.5px)]`}>
        {item.href ? (
          <Link
            to={item.href}
            className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
            {front}
          </Link>
        ) : (
          front
        )}
      </div>
      {/* الوجه الخلفي: نفس الصورة أغمق قليلًا، فتبدو الصفحات المقلوبة في الظل */}
      <div
        aria-hidden="true"
        className={`${FACE} bg-neutral-300 [transform:rotateY(180deg)_translateZ(0.5px)]`}>
        <img
          src={item.src}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full select-none object-cover brightness-75"
        />
      </div>
    </motion.div>
  );
};

const BookFan = ({
  items,
  tiltX = 10,
  tiltZ = -14,
  autoSpin = 15,
  children,
  className = "",
}: BookFanProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // ---- الدوران = السحب باليد + الدوران التلقائي، يعملان معًا ----
  const dragRotation = useMotionValue(0);
  const autoRotation = useMotionValue(0);
  const rotation = useTransform(() => dragRotation.get() + autoRotation.get());

  const drag = useRef({
    active: false,
    moved: false,
    lastX: 0,
    lastT: 0,
    velocity: 0, // درجات في الثانية
    pointerId: -1,
  });
  const inertia = useRef<ReturnType<typeof animate> | null>(null);
  const startX = useRef(0);

  // كم درجة يدور الكتاب لكل بكسل سحب
  const DEG_PER_PX = 0.35;
  // بعد هذه المسافة يُعتبر سحبًا لا ضغطة، فلا يُفتح الرابط عند الإفلات
  const CLICK_TOLERANCE = 6;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    inertia.current?.stop();
    drag.current = {
      active: true,
      moved: false,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      pointerId: e.pointerId,
    };
    startX.current = e.clientX;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;

    if (!d.moved && Math.abs(e.clientX - startX.current) > CLICK_TOLERANCE) {
      d.moved = true;
      // نلتقط المؤشر فيستمر السحب حتى لو خرج الماوس من الكتاب
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;

    const now = performance.now();
    const dx = e.clientX - d.lastX;
    const dt = Math.max(1, now - d.lastT);
    dragRotation.set(dragRotation.get() + dx * DEG_PER_PX);
    // سرعة مُنعّمة، تُستعمل للاندفاع بعد الإفلات
    d.velocity = d.velocity * 0.6 + ((dx * DEG_PER_PX) / dt) * 1000 * 0.4;
    d.lastX = e.clientX;
    d.lastT = now;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // اندفاع: يكمل الكتاب دورانه ويتباطأ تدريجيًا، كأنه دُفع باليد
    if (!reduceMotion && d.moved && Math.abs(d.velocity) > 20) {
      const distance = Math.max(-540, Math.min(540, d.velocity * 0.35));
      inertia.current = animate(dragRotation, dragRotation.get() + distance, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      });
    }
  };

  // ---- الدوران التلقائي: 360 درجة كل (360 ÷ autoSpin) ثانية ----
  // يتوقف أثناء السحب باليد، وحين يخرج الكتاب من الشاشة، ولمن فعّل "تقليل الحركة"
  const inView = useInView(sectionRef);
  useAnimationFrame((_, delta) => {
    if (!autoSpin || reduceMotion || !inView || drag.current.active) return;
    autoRotation.set(autoRotation.get() - (autoSpin * delta) / 1000);
  });

  // ضغطة بعد سحب لا تفتح صفحة الكتاب
  const onClickCapture = (e: ReactMouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  // ---- ميل خفيف يتبع الماوس ----
  const pointerX = useMotionValue(0); // من -0.5 إلى 0.5
  const pointerY = useMotionValue(0);
  const springCfg = { stiffness: 80, damping: 20, mass: 0.8 };
  const followX = useSpring(pointerX, springCfg);
  const followY = useSpring(pointerY, springCfg);
  const stageRotateX = useTransform(followY, (v) => tiltX - v * 14);
  const stageRotateY = useTransform(followX, (v) => v * 18);

  useEffect(() => {
    // الماوس فقط: على الشاشات اللمسية لا يوجد مؤشر يتبعه الكتاب
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion || !fine.matches) return;
    const onMove = (e: PointerEvent) => {
      pointerX.set(e.clientX / window.innerWidth - 0.5);
      pointerY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY, reduceMotion]);

  useEffect(() => () => inertia.current?.stop(), []);

  // انفتاح الكتاب عند التحميل
  const openness = useMotionValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      openness.set(1);
      return;
    }
    const controls = animate(openness, 1, {
      duration: 1.8,
      ease: EASE,
      delay: 0.2,
    });
    return () => controls.stop();
  }, [openness, reduceMotion]);

  return (
    // شاشة واحدة: لا مسافة تمرير إضافية ولا تثبيت (sticky)
    <section ref={sectionRef} className={`relative h-screen ${className}`}>
      <div className="flex h-full items-center justify-center overflow-hidden">
        {/* المسرح: perspective تعطي العمق، والميل يُظهر المروحة من زاوية.
            touch-action: pan-y يترك التمرير العمودي للمتصفح، والسحب الأفقي للكتاب */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className="relative h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing [--page-h:calc(var(--page-w)*1.5)] [--page-w:clamp(120px,20vw,250px)]"
          style={{ perspective: "1600px" }}>
          <motion.div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              rotateX: stageRotateX,
              rotateY: stageRotateY,
              rotateZ: tiltZ,
            }}>
            {items.map((item, i) => (
              <Page
                key={`${item.src}-${i}`}
                item={item}
                index={i}
                count={items.length}
                rotation={rotation}
                openness={openness}
              />
            ))}
          </motion.div>
        </div>
        {children && (
          <div className="pointer-events-none absolute inset-0 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default BookFan;
