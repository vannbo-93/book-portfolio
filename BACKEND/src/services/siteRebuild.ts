import { env } from "../config/env.js";

// إعادة بناء الواجهة بعد تغيير الكتب (لتحديث صفحات المعاينة وخريطة الموقع، انظر FRONTEND/scripts/prerender.mjs).
// ننتظر دقيقتين بعد آخر تغيير: المصمم يحفظ عادة عدة مرات متتالية، فيكفي بناء واحد في الأخير
// بدل بناء لكل ضغطة Save.
const DELAY_MS = 2 * 60 * 1000;
let timer: NodeJS.Timeout | undefined;

export const scheduleSiteRebuild = () => {
  if (!env.SITE_DEPLOY_HOOK) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const res = await fetch(env.SITE_DEPLOY_HOOK!, { method: "POST", signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log("✓ Site rebuild requested");
    } catch (err) {
      // لا يؤثر على الكتاب المحفوظ: فقط المعاينة تبقى قديمة حتى البناء التالي
      console.error("✗ Site rebuild request failed:", err instanceof Error ? err.message : err);
    }
  }, DELAY_MS);
  // لا يمنع إيقاف الخادم أثناء الانتظار
  timer.unref();
};
