/** @format */
import type Lenis from "lenis";

// نسخة Lenis (التمرير الناعم) المشتركة في الموقع كله، وأدوات تستعملها المكونات الأخرى.
// في ملف .ts مستقل (لا في SmoothScroll.tsx) لأن Vite يشترط أن يصدّر ملف المكون مكونات فقط.
// كل أداة تعمل حتى بدون Lenis (لمن فعّل "تقليل الحركة"): ترجع إلى تمرير المتصفح العادي.

let lenis: Lenis | null = null;
// طلب إيقاف وصل قبل أن يجهز Lenis (مثل شاشة الدخول): يُطبَّق لحظة تجهيزه
let stopped = false;

// انطلاقة سريعة ثم تباطؤ طويل عند الوصول
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
  if (lenis && stopped) lenis.stop();
};

// إيقاف التمرير وتشغيله (شاشة الدخول، النوافذ المنبثقة...)
export const stopScroll = () => {
  stopped = true;
  lenis?.stop();
};
export const startScroll = () => {
  stopped = false;
  lenis?.start();
};

// القفز فورًا إلى موضع (عند الانتقال بين الصفحات): بلا حركة
export const jumpTo = (y: number) => {
  window.scrollTo(0, y);
  lenis?.scrollTo(y, { immediate: true, force: true });
};

// الانتقال بنعومة إلى عنصر (قسم).
// المسافة فوقه للناف بار تُضبط على العنصر نفسه بـ scroll-mt، لا هنا
export const scrollToElement = (el: HTMLElement | null) => {
  if (!el) return;
  // Lenis يحترم scroll-mt بنفسه
  if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: easeOutExpo });
  else el.scrollIntoView();
};

// العودة إلى أعلى الصفحة بنعومة
export const scrollToTop = () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: easeOutExpo });
  else window.scrollTo(0, 0);
};
