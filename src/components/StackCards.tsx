/** @format */
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

// بطاقات صور تتراكم كمجموعة أوراق مع التمرير:
//   - كل بطاقة تلتصق في منتصف الشاشة، أسفل التي قبلها ببضعة بكسلات، فتظهر حافات البطاقات السابقة
//   - كلما وصلت بطاقة جديدة، تصغر البطاقات تحتها درجة وتغمق قليلًا وتميل ميلًا خفيفًا
//   - الصورة داخل كل بطاقة تتقارب (zoom) بهدوء وهي تدخل الشاشة

export interface StackImage {
  src: string;
  alt: string;
}

// كم تصغر كل بطاقة عن التي فوقها في نهاية القسم
const SCALE_STEP = 0.05;
// الإزاحة بين البطاقات المتراكمة، فتظهر حافة كل بطاقة فوق التالية
const PEEK_PX = 22;
// أقصى تعتيم لأقدم بطاقة، وأقصى ميل بالدرجات
const MAX_DIM = 0.45;
const MAX_TILT = 2.5;

// موضع p داخل المقطع [from, to] كنسبة محصورة بين 0 و1
const segment = (p: number, from: number, to: number) =>
  to <= from
    ? p >= to
      ? 1
      : 0
    : Math.min(1, Math.max(0, (p - from) / (to - from)));

const Card = ({
  image,
  index,
  total,
  progress,
  reduce,
}: {
  image: StackImage;
  index: number;
  total: number;
  progress: MotionValue<number>; // تقدّم التمرير في القسم كله، من 0 إلى 1
  reduce: boolean;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // تقدّم دخول هذه البطاقة: من ظهورها أسفل الشاشة حتى وصولها إلى أعلاها
  const { scrollYProgress: enter } = useScroll({
    target: wrapperRef,
    offset: ["start end", "start start"],
  });
  // الصورة تبدأ مكبّرة قليلًا ثم تستقر
  const imageScale = useTransform(
    enter,
    (t) => 1.18 - 0.18 * Math.min(1, Math.max(0, t)),
  );

  // بعد أن تستقر البطاقة، كل بطاقة تصل بعدها تضغطها أكثر
  const below = total - 1 - index; // عدد البطاقات التي ستأتي فوقها
  const from = index / total;
  const scale = useTransform(
    progress,
    (p) => 1 - below * SCALE_STEP * segment(p, from, 1),
  );
  const dim = useTransform(
    progress,
    (p) => (below / Math.max(1, total - 1)) * MAX_DIM * segment(p, from, 1),
  );
  // ميل خفيف بالتناوب: يمين، يسار، يمين...
  const tiltDir = index % 2 === 0 ? 1 : -1;
  const rotate = useTransform(
    progress,
    (p) => tiltDir * MAX_TILT * (below > 0 ? 1 : 0) * segment(p, from, 1),
  );

  const number = (n: number) => String(n).padStart(2, "0");

  return (
    // كل بطاقة في غلاف بارتفاع الشاشة يلتصق بأعلاها، فتتراكم البطاقات واحدة فوق الأخرى
    <div
      ref={wrapperRef}
      className="sticky top-0 flex h-screen items-center justify-center">
      <motion.article
        className="relative aspect-[2/3] w-[min(100%,calc(68vh*2/3))] origin-top overflow-hidden rounded-3xl bg-neutral-200 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
        style={{
          // كل بطاقة أسفل التي قبلها بـ PEEK_PX، مع رفع الجميع قليلًا فتبقى المجموعة في الوسط
          top: `calc(-4vh + ${index * PEEK_PX}px)`,
          ...(reduce ? {} : { scale, rotate }),
        }}>
        <motion.img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={reduce ? undefined : { scale: imageScale }}
        />
        {/* تعتيم البطاقات السفلى */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: reduce ? 0 : dim }}
        />
        <span className="absolute bottom-5 left-6 font-mono text-xs tracking-widest text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
          {number(index + 1)} / {number(total)}
        </span>
      </motion.article>
    </div>
  );
};

const StackCards = ({
  images,
  className = "",
}: {
  images: StackImage[];
  className?: string;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    // overflow-x-clip: زوايا البطاقات المائلة لا تتجاوز حدود الموقع ولا تسبب تمريرًا أفقيًا
    // (clip لا hidden، لأن hidden يعطّل الالتصاق sticky)
    <section
      ref={sectionRef}
      className={`relative w-full overflow-x-clip ${className}`}>
      {images.map((image, i) => (
        <Card
          key={i}
          image={image}
          index={i}
          total={images.length}
          progress={scrollYProgress}
          reduce={reduce}
        />
      ))}
    </section>
  );
};

export default StackCards;
