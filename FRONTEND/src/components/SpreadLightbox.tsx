/** @format */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { startScroll, stopScroll } from "../lib/scroll";
import { MONO } from "../hooks/useClock";
import type { Img } from "../types";

// عرض الصفحات المزدوجة بملء الشاشة (Lightbox) في صفحة الكتاب.
// الضغط على صفحة يفتحها كبيرة على خلفية داكنة، ومنها:
//   - السابق / التالي: بالأزرار، أو بأسهم لوحة المفاتيح، أو بالسحب يمينًا ويسارًا على الهاتف
//   - الإغلاق: زر ×، أو Esc، أو الضغط على الخلفية
// على الهاتف يمكن التكبير بإصبعين (تكبير المتصفح العادي)، فتظهر تفاصيل الخطوط.
// الصورة نفسها المعروضة في الصفحة (محمّلة مسبقًا)، فتظهر فورًا.
// يُرسم مباشرة داخل <body> (createPortal): الصفحة نفسها تتحرك بـ transform أثناء الانتقالات،
// وأي عنصر fixed داخل عنصر متحرك يُحسب موضعه منه لا من الشاشة.

interface SpreadLightboxProps {
  spreads: Img[];
  title: string;
  // رقم الصفحة المفتوحة، أو null = مغلق
  index: number | null;
  onIndex: (index: number | null) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
// مسافة السحب (بكسل) التي تكفي للانتقال للصفحة التالية على الهاتف
const SWIPE = 60;

const SpreadLightbox = ({
  spreads,
  title,
  index,
  onIndex,
}: SpreadLightboxProps) => {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const count = spreads.length;

  const go = (step: number) => {
    if (index === null) return;
    onIndex((index + step + count) % count);
  };

  // أثناء الفتح: إيقاف تمرير الصفحة، والتركيز على زر الإغلاق.
  // عند الإغلاق: يعود التركيز للصفحة التي فُتحت (حتى لا يضيع مستخدم لوحة المفاتيح)
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    stopScroll();
    closeRef.current?.focus();
    return () => {
      startScroll();
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // لوحة المفاتيح: Esc يغلق، والأسهم تنتقل
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex]);

  // تحميل الصفحتين المجاورتين مسبقًا: الانتقال يكون فوريًا
  useEffect(() => {
    if (index === null || count < 2) return;
    for (const i of [index + 1, index - 1]) {
      const img = new Image();
      img.src = spreads[(i + count) % count].src;
    }
  }, [index, count, spreads]);

  const spread = index !== null ? spreads[index] : null;

  return createPortal(
    <AnimatePresence>
      {spread && index !== null && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, spread ${index + 1} of ${count}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={() => onIndex(null)}
          // pinch-zoom: التكبير بإصبعين مسموح، أما سحب الصفحة خلف العارض فممنوع
          style={{ touchAction: "pinch-zoom" }}
          className="fixed inset-0 z-[100] flex flex-col overscroll-contain bg-neutral-950 text-white">
          {/* الشريط العلوي: الرقم والعنوان، وزر الإغلاق */}
          <div
            className={`${MONO} flex items-center justify-between gap-4 px-4 py-3 sm:px-6`}
            onClick={(e) => e.stopPropagation()}>
            <span className="truncate text-white/70">
              {pad(index + 1)} / {pad(count)} — {title}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => onIndex(null)}
              aria-label="Close"
              className="shrink-0 px-2 py-1 text-white/80 hover:text-white focus-visible:outline-1 focus-visible:outline-white">
              Close ✕
            </button>
          </div>

          {/* الصورة: بأكبر حجم يتسع للشاشة دون قص. السحب أفقيًا ينتقل بين الصفحات */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16 sm:pb-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={spread.src}
                src={spread.src}
                alt={spread.alt || `${title}, spread ${index + 1}`}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE) go(1);
                  else if (info.offset.x > SWIPE) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
                style={{ touchAction: "pinch-zoom" }}
                className="max-h-full max-w-full select-none rounded-[3px] object-contain shadow-2xl"
              />
            </AnimatePresence>

            {/* السابق / التالي: على الشاشات الكبيرة فقط (على الهاتف السحب أسهل) */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous spread"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className={`${MONO} absolute left-2 top-1/2 hidden -translate-y-1/2 px-3 py-6 text-white/70 hover:text-white focus-visible:outline-1 focus-visible:outline-white sm:block`}>
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next spread"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className={`${MONO} absolute right-2 top-1/2 hidden -translate-y-1/2 px-3 py-6 text-white/70 hover:text-white focus-visible:outline-1 focus-visible:outline-white sm:block`}>
                  →
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <p className={`${MONO} pb-4 text-center text-white/40 sm:hidden`}>
              Swipe to browse · Pinch to zoom
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SpreadLightbox;
