// /** @format */
// import { useEffect } from "react";
// import { useLocation } from "react-router";
// import Lenis from "lenis";
// import Snap from "lenis/snap";
// import "lenis/dist/lenis.css";
// import { getLenis, setLenis } from "../lib/scroll";

// // تمرير ناعم للموقع كله + "سحب" نحو بداية الأقسام.
// //
// //   1. Lenis: التمرير لا يقف فجأة، بل ينساب ويتباطأ تدريجيًا
// //   2. Snap: حين تتوقف قريبًا من بداية قسم (أقل من 40% من الشاشة)، يسحبك إليه بقوة ثم يتباطأ عند الوصول.
// //      البعيد عن أي بداية لا يُسحب، فالأقسام الطويلة (الكتاب، الشبكة، الممر) تبقى حرة من الداخل.
// //
// // نقاط السحب: أي عنصر عليه data-snap. ضعه على الأقسام التي تريدها فقط.
// // لمن فعّل "تقليل الحركة" في جهازه: تمرير المتصفح العادي، بلا نعومة ولا سحب.

// // منحنى السحب: انطلاقة قوية جدًا (أغلب المسافة في أول لحظات)، ثم تباطؤ طويل عند الوصول.
// // expo أقوى من quart: في ربع المدة الأول يقطع حوالي 80% من المسافة
// const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// const SmoothScroll = () => {
//   const { pathname } = useLocation();

//   // إنشاء Lenis مرة واحدة للموقع كله
//   useEffect(() => {
//     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
//     const lenis = new Lenis({
//       lerp: 0.09, // كلما صغر الرقم، كان التمرير أنعم وأبطأ في التوقف
//       smoothWheel: true,
//       autoRaf: true,
//       anchors: true, // روابط # داخل الصفحة تُمرَّر بنعومة أيضًا
//     });
//     setLenis(lenis);
//     return () => {
//       lenis.destroy();
//       setLenis(null);
//     };
//   }, []);

//   // عند كل صفحة جديدة: نبدأ من أعلاها، ونعيد جمع نقاط السحب الموجودة فيها
//   useEffect(() => {
//     const lenis = getLenis();
//     if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
//     else window.scrollTo(0, 0);
//     if (!lenis) return;

//     const snap = new Snap(lenis, {
//       type: "proximity",
//       distanceThreshold: "40%", // يسحبك إن توقفت على بعد 40% من الشاشة أو أقل من بداية القسم
//       debounce: 120, // يبدأ السحب بسرعة بعد توقفك (0.12 ثانية)، فيبدو كأن شيئًا التقطك
//       duration: 1.4, // مدة أطول للتباطؤ في النهاية، لا للانطلاقة
//       easing: easeOutExpo,
//     });
//     // ننتظر إطارًا حتى تُرسم الصفحة الجديدة قبل البحث عن الأقسام
//     let remove = () => {};
//     const id = requestAnimationFrame(() => {
//       const targets = Array.from(
//         document.querySelectorAll<HTMLElement>("[data-snap]"),
//       );
//       remove = snap.addElements(targets, { align: "start" });
//     });
//     return () => {
//       cancelAnimationFrame(id);
//       remove();
//       snap.destroy();
//     };
//   }, [pathname]);

//   return null;
// };

// export default SmoothScroll;
