/** @format */
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setLenis } from "../lib/scroll";

// تمرير ناعم للموقع كله (Lenis): عجلة الماوس ولوحة اللمس تحرك الصفحة بانسياب
// وتتباطأ تدريجيًا عند التوقف، بدل القفزات الحادة لتمرير المتصفح العادي.
//
// لا سحب ولا التصاق بالأقسام: التمرير حر تمامًا، فقط أنعم.
// على الهاتف: يبقى تمرير الإصبع الأصلي (أسرع استجابة وأكثر طبيعية من أي محاكاة).
// لمن فعّل "تقليل الحركة" في جهازه: تمرير المتصفح العادي.
//
// يعمل مع كل حركات Motion المرتبطة بالتمرير (useScroll) لأن Lenis يحرك تمرير الصفحة الحقيقي.

// نعومة التمرير: أصغر = أنعم وأطول انزلاقًا (0.1 متوازن، 0.07 ناعم جدًا، 0.15 أقرب للعادي)
const LERP = 0.09;

const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      // سرعة العجلة: 1 = نفس مسافة التمرير العادي
      wheelMultiplier: 1,
      autoRaf: true,
      // روابط # داخل الصفحة تنتقل بنعومة
      anchors: true,
    });
    setLenis(lenis);
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
};

export default SmoothScroll;
