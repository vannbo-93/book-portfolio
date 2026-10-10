/** @format */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Location } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import {
  jumpTo,
  PAGE_EXITED,
  startPosition,
  startScroll,
  stopScroll,
} from "../lib/scroll";

// الانتقال بين الصفحات: الصفحتان تتحركان معًا كورقتين متجاورتين،
// القديمة تنزلق إلى اليسار والجديدة تدخل ملتصقة بها من اليمين، بلا أي فراغ بينهما.
//
// كيف: الصفحة الجديدة تدخل كطبقة ثابتة فوق الشاشة (fixed) تعرض الجزء الذي ستبدأ منه
// (أعلاها، أو القسم المطلوب مثل بطاقات الخدمات)، بينما القديمة تخرج من موضعها الحالي.
// حين تختفي القديمة، تعود الجديدة صفحة عادية وينتقل التمرير إلى نفس الموضع، فلا يُرى أي فرق.

const EASE = [0.76, 0, 0.24, 1] as const;
const DURATION = 0.8; // مدة الانزلاق (ث)

// أول صفحة عند فتح الموقع لا تنزلق (شاشة الدخول تكفي)
let firstPage = true;

// location يأتي من App (لا من useLocation): الصفحة الخارجة تحتفظ بموقعها القديم،
// فلا تتفاعل مع رابط الصفحة الجديدة أثناء خروجها
const PageSlide = ({
  children,
  location,
}: {
  children: ReactNode;
  location: Location;
}) => {
  const { pathname, hash } = location;
  const reduce = useReducedMotion();
  // هل تدخل هذه الصفحة بانزلاق؟ (لا عند أول فتح، ولا لمن فعّل "تقليل الحركة")
  const [entering, setEntering] = useState(() => !firstPage && !reduce);
  // الموضع الذي تبدأ منه الصفحة (ref لا state: يُحسب من الصفحة بعد ظهورها، ولا يحتاج إعادة رسم)
  const startY = useRef(0);
  const inner = useRef<HTMLDivElement>(null);
  const wasEntering = useRef(entering);

  // عند ظهور الصفحة: نحسب من أين تبدأ
  useLayoutEffect(() => {
    firstPage = false;
    const y = startPosition(pathname, hash);
    startY.current = y;
    if (entering) {
      stopScroll(); // لا تمرير أثناء الانزلاق
      // الطبقة تعرض نفس الجزء الذي ستبدأ منه الصفحة
      if (inner.current) inner.current.style.transform = `translateY(${-y}px)`;
    } else jumpTo(y);
    // مرة واحدة عند ظهور الصفحة فقط
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حين تنتهي الصفحة القديمة من الخروج: تصبح الجديدة صفحة عادية
  useEffect(() => {
    if (!entering) return;
    const done = () => setEntering(false);
    window.addEventListener(PAGE_EXITED, done);
    return () => window.removeEventListener(PAGE_EXITED, done);
  }, [entering]);

  // ...وينتقل التمرير إلى نفس الموضع الذي كانت تعرضه (قبل أن يرسم المتصفح، فلا قفزة)
  useLayoutEffect(() => {
    if (wasEntering.current && !entering) {
      if (inner.current) inner.current.style.transform = "";
      jumpTo(startY.current);
      startScroll();
    }
    wasEntering.current = entering;
  }, [entering]);

  // تغيّر # فقط في نفس الصفحة (مثل /about → /about#services-list)
  const firstHash = useRef(true);
  useLayoutEffect(() => {
    if (firstHash.current) {
      firstHash.current = false;
      return;
    }
    jumpTo(startPosition(pathname, hash));
  }, [hash, pathname]);

  return (
    <motion.div
      initial={entering ? { x: "100%" } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { x: "-100%" }}
      transition={{ duration: reduce ? 0.2 : DURATION, ease: EASE }}
      // أثناء الدخول: طبقة ثابتة بحجم الشاشة فوق الصفحة القديمة
      style={
        entering
          ? { position: "fixed", inset: 0, overflow: "hidden", zIndex: 20 }
          : undefined
      }>
      <div ref={inner}>{children}</div>
    </motion.div>
  );
};

export default PageSlide;
