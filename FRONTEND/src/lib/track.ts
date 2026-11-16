/** @format */
// إحصاءات الزوار: عند فتح كل صفحة يُرسل للخادم سطر قصير، والخادم يضيف +1 على عدادات اليوم.
// لا كوكيز ولا معرّف للزائر: فقط علامتان في المتصفح نفسه
//   - آخر يوم زار فيه الموقع (localStorage): ليُحسب "زائرًا" مرة واحدة في اليوم
//   - بداية الجلسة (sessionStorage): ليُحسب مصدر الزيارة (Instagram، Google ...) مرة واحدة لكل زيارة
// زيارات الأدمن نفسه لا تُحسب: تسجيل الدخول إلى لوحة التحكم يضع علامة NO_TRACK في هذا المتصفح.
import { API_URL } from "./api";

const SEEN = "ussain-seen-day";
const SESSION = "ussain-session";
export const NO_TRACK = "ussain-no-track";

const get = (store: Storage | undefined, key: string) => {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const put = (store: Storage | undefined, key: string, value: string) => {
  try {
    store?.setItem(key, value);
  } catch {
    // التخزين ممنوع (تصفح خاص مثلًا): تُحسب الزيارة دون العلامتين
  }
};

// لا يتجاهل الأدمن إلا إن وُجدت العلامة
export const markAsAdmin = () => put(window.localStorage, NO_TRACK, "1");

let lastPath = "";

export const trackPageView = (path: string) => {
  if (typeof window === "undefined") return;
  // نفس الصفحة مرتين متتاليتين (مثل StrictMode أثناء التطوير): تُحسب مرة
  if (path === lastPath) return;
  lastPath = path;
  if (get(window.localStorage, NO_TRACK)) return;

  const today = new Date().toISOString().slice(0, 10);
  const newVisitor = get(window.localStorage, SEEN) !== today;
  if (newVisitor) put(window.localStorage, SEEN, today);
  const newSession = !get(window.sessionStorage, SESSION);
  if (newSession) put(window.sessionStorage, SESSION, "1");

  const body = JSON.stringify({
    p: path,
    v: newVisitor || undefined,
    s: newSession || undefined,
    // الموقع السابق ومصدر الحملة: في أول صفحة من الزيارة فقط
    r: newSession ? document.referrer || undefined : undefined,
    u: newSession
      ? new URLSearchParams(window.location.search).get("utm_source")?.slice(0, 60) || undefined
      : undefined,
  });
  const url = `${API_URL}/api/track`;
  try {
    // sendBeacon: يُرسل في الخلفية دون أن يؤخر الصفحة، حتى لو أُغلقت
    if (navigator.sendBeacon?.(url, body)) return;
  } catch {
    // نجرب fetch
  }
  void fetch(url, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => {});
};
