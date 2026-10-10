/** @format */
import type Lenis from "lenis";

// نسخة Lenis (التمرير الناعم) المشتركة في الموقع كله، وأدوات تستعملها المكونات الأخرى.
// في ملف .ts مستقل (لا في SmoothScroll.tsx) لأن Vite يشترط أن يصدّر ملف المكون مكونات فقط.
// كل أداة تعمل حتى بدون Lenis (لمن فعّل "تقليل الحركة"): ترجع إلى تمرير المتصفح العادي.

let lenis: Lenis | null = null;
// التمرير موقوف؟ (شاشة الدخول، الانتقال بين الصفحات...)
let blocked = false;

// انطلاقة سريعة ثم تباطؤ طويل عند الوصول
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

// إيقاف التمرير وتشغيله.
// لا نستعمل lenis.stop() ولا overflow: hidden: كلاهما يخفي شريط التمرير على Windows،
// فيتسع عرض الصفحة فجأة ثم يضيق، وهذا هو "الاهتزاز" قبل الانتقال.
// بدلًا من ذلك نتجاهل حركة العجلة فقط (SmoothScroll يسأل isScrollBlocked)
export const stopScroll = () => {
  blocked = true;
};
export const startScroll = () => {
  blocked = false;
};
export const isScrollBlocked = () => blocked;

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

// مسارات تفتح صفحة نازلة إلى قسم منها: /services = صفحة ABOUT عند بطاقات الخدمات
export const SECTION_ROUTES: Record<string, string> = {
  "/services": "services-list",
};

// موضع العنصر في الصفحة حسب مكانه الأصلي، دون حركات التمرير (transform) التي قد تزيحه مؤقتًا
export const layoutTop = (el: HTMLElement) => {
  let top = 0;
  for (
    let n: HTMLElement | null = el;
    n;
    n = n.offsetParent as HTMLElement | null
  )
    top += n.offsetTop;
  return top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
};

// أين يجب أن تبدأ الصفحة: أعلاها، أو القسم المطلوب (# في الرابط أو SECTION_ROUTES)
export const startPosition = (pathname: string, hash: string) => {
  const id = hash ? hash.slice(1) : SECTION_ROUTES[pathname];
  const target = id ? document.getElementById(id) : null;
  return target ? layoutTop(target) : 0;
};

// إشارة: الصفحة القديمة أنهت خروجها (يرسلها App، تستقبلها الصفحة الجديدة)
export const PAGE_EXITED = "page-exited";
