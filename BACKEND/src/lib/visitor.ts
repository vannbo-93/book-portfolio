/** @format */

// تصنيف الزيارة من بيانات المتصفح، دون حفظ أي شيء عن الزائر

// البرامج الآلية (محركات البحث، معاينة الروابط، أدوات الفحص) لا تُحسب زوارًا
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|whatsapp|telegram|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\//i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export const deviceOf = (ua: string) =>
  /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";

// مصادر معروفة: اسم الموقع الذي جاء منه الزائر → اسم المصدر
const SOURCES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.me|fb\.com)$/, "facebook"],
  [/(^|\.)(google\.[a-z.]+)$/, "google"],
  [/(^|\.)(bing\.com|duckduckgo\.com|yahoo\.com|yandex\.[a-z]+|ecosia\.org|baidu\.com)$/, "other search"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x"],
  [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, "pinterest"],
  [/(^|\.)behance\.net$/, "behance"],
  [/(^|\.)(threads\.net|threads\.com)$/, "threads"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, "ai assistants"],
];

const KNOWN_UTM = new Set(["instagram", "facebook", "google", "linkedin", "x", "pinterest", "behance", "threads", "tiktok", "email", "whatsapp"]);

// من أين جاء الزائر:
//   1) ?utm_source=... في الرابط (مثل رابط في البايو أو في بريد)
//   2) المتصفح الداخلي لإنستغرام/فيسبوك (لا يرسل عادة اسم الموقع السابق، لكن يعرّف نفسه)
//   3) الموقع السابق (referrer)
//   4) لا شيء = direct (كتب الرابط، أو من WhatsApp، أو من المفضلة)
export const sourceOf = (ua: string, refHost: string, utm: string, ownHosts: string[]) => {
  const u = utm.toLowerCase().trim();
  if (u === "ig") return { source: "instagram" };
  if (KNOWN_UTM.has(u)) return { source: u };
  if (/Instagram/i.test(ua)) return { source: "instagram" };
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return { source: "facebook" };
  const host = refHost.toLowerCase().replace(/^www\./, "");
  if (!host || ownHosts.some((h) => host === h || host.endsWith(`.${h}`))) return { source: "direct" };
  if (host === "android-app" || host.startsWith("com.")) return { source: "direct" };
  for (const [re, name] of SOURCES) if (re.test(host)) return { source: name };
  return { source: "other websites", referrer: host };
};
