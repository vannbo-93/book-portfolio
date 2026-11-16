/** @format */
// ===== صفحات HTML ثابتة لكل رابط (للمعاينة في WhatsApp وفيسبوك ولينكدإن، ولمحركات البحث) =====
//
// المشكلة: الموقع تطبيق React واحد. الخادم يرسل نفس index.html لكل رابط، والمحتوى يُرسم بـ JavaScript.
// بطاقات المعاينة (WhatsApp, Facebook, LinkedIn, X) لا تشغّل JavaScript، فكانت كل الروابط
// (حتى /books/اسم-الكتاب) تظهر بنفس العنوان والوصف والصورة.
//
// الحل: بعد `vite build` ينسخ هذا الملف dist/index.html إلى نسخة لكل صفحة
// (dist/work/index.html، dist/books/<slug>/index.html ...) مع عنوانها ووصفها وصورتها.
// Render يقدّم الملف الموجود قبل قاعدة /* → /index.html، فيرى كل رابط نسخته الخاصة.
// التطبيق نفسه لا يتغير: نفس السكربت يُحمَّل ويرسم الصفحة كالمعتاد.
//
// ويكتب أيضًا sitemap.xml (خريطة الروابط لمحركات البحث) و robots.txt.
//
// الكتب تُجلب من الخادم وقت البناء: كتاب جديد أو معدّل يظهر في المعاينة بعد البناء التالي للواجهة
// (الخادم يطلب البناء تلقائيًا عبر Deploy Hook إن ضُبط SITE_DEPLOY_HOOK في الخادم).
// إن تعذّر الوصول إلى الخادم، تُبنى الصفحات الثابتة فقط ولا يفشل البناء.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const SITE_URL = (process.env.SITE_URL || "https://ussainisawi.com").replace(
  /\/$/,
  "",
);
const API_URL = (process.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  "",
);
const BRAND = "USSAIN";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

// الصفحات الثابتة: العنوان (مثل تبويب المتصفح في PageMeta.tsx) والوصف
const PAGES = [
  {
    path: "/work",
    title: `Works — ${BRAND}`,
    description:
      "Selected book design work by USSAIN: covers, interiors and complete book layouts for authors and brands.",
  },
  {
    path: "/services",
    title: `Services — ${BRAND}`,
    description:
      "Book design services: cover design, interior layout, journals, planners, workbooks and ebooks, ready for print and digital.",
  },
  {
    path: "/process",
    title: `Process — ${BRAND}`,
    description:
      "How a book design project with USSAIN works, from the first brief to print-ready files.",
  },
  {
    path: "/about",
    title: `About — ${BRAND}`,
    description:
      "About USSAIN, a book designer creating covers and interiors for authors, coaches and brands.",
  },
  {
    path: "/contact",
    title: `Contact — ${BRAND}`,
    description:
      "Start a book design project with USSAIN: covers, interiors, journals and more.",
  },
];

// ===== أدوات =====

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// وصف قصير (حدود ما تعرضه Google والبطاقات تقريبًا): يقص عند آخر كلمة كاملة
const clip = (text, max = 160) => {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:—-]+$/, "")}…`;
};

// نفس رابط الصورة الذي تطلبه الواجهة (src/lib/image.ts → sized): يجب أن يتطابق حرفيًا،
// وإلا ينزّل المتصفح الصورة مرتين
const sized = (url, width) =>
  url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`)
    : url;

// نفس المقاسات في src/lib/image.ts (FAN_* و COVER_*): التحميل المسبق يجب أن يطابق srcset و sizes
// في الصفحة حرفيًا، فيختار المتصفح النسخة نفسها ولا ينزّل الصورة مرتين
const FAN_WIDTHS = [250, 375, 500];
const FAN_SIZES = "clamp(120px, 20vw, 250px)";
const COVER_WIDTHS = [400, 600, 900];
const COVER_SIZES = "(min-width: 768px) 448px, calc(100vw - 32px)";

// وسم التحميل المسبق لصورة متجاوبة: href للمتصفحات القديمة، و imagesrcset/imagesizes للحديثة
const responsive = (url, widths, sizes) => ({
  href: sized(url, widths[widths.length - 1]),
  srcset: widths.map((w) => `${sized(url, w)} ${w}w`).join(", "),
  sizes,
});

// غلاف الكتاب كصورة معاينة 1200×630: الغلاف كاملًا في المنتصف على خلفية سوداء (لا يُقص)
const ogCover = (url) =>
  url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace(
        "/upload/",
        "/upload/c_pad,w_1200,h_630,b_black,f_jpg,q_auto/",
      )
    : url;

// يستبدل قيمة content لوسم <meta> موجود. يفشل البناء إن لم يجد الوسم (تغيّر index.html):
// أفضل من نشر صفحات بمعاينة خاطئة دون أن ينتبه أحد
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(
    `(<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"\\s+content=")[^"]*(")`,
    "s",
  );
  if (!re.test(html))
    throw new Error(
      `prerender: <meta ${attr}="${key}"> not found in dist/index.html`,
    );
  return html.replace(re, `$1${escapeHtml(value)}$2`);
};

const render = (
  template,
  { path, title, description, image, imageAlt, type = "website", preload = [] },
) => {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  let html = template
    .replace(/\s*<link rel="canonical"[^>]*>/g, "") // إن شُغّل الملف مرتين على نفس dist
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:type", type);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "og:image:alt", imageAlt);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", image);
  // التحميل المسبق لأكبر صورة في أول شاشة (LCP): رابطها مكتوب في الصفحة نفسها،
  // فيبدأ المتصفح تنزيلها فورًا بدل انتظار السكربت ثم طلبات الخادم
  const preloads = preload
    .map(
      ({ href, srcset, sizes }) =>
        `    <link rel="preload" as="image" href="${escapeHtml(href)}" imagesrcset="${escapeHtml(srcset)}" imagesizes="${escapeHtml(sizes)}" fetchpriority="high" />\n`,
    )
    .join("");
  // الرابط الرسمي: /books/x و /books/x/ صفحة واحدة عند محركات البحث
  return html
    .replace(/\s*<link rel="preload" as="image"[^>]*>/g, "")
    .replace(
      "</head>",
      `${preloads}    <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`,
    );
};

const write = async (path, html) => {
  const file =
    path === "/" ? join(DIST, "index.html") : join(DIST, path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
};

// ===== الكتب من الخادم =====

const fetchJson = async (path) => {
  const res = await fetch(`${API_URL}${path}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const fetchBooks = async () => {
  try {
    const { books } = await fetchJson("/api/books");
    return Array.isArray(books) ? books : [];
  } catch (err) {
    console.warn(
      `⚠ prerender: could not load books from ${API_URL} (${err.message}). Book pages skipped.`,
    );
    return null;
  }
};

// الإعدادات: فقط لمعرفة أغلفة الكتاب الدوّار المختارة. إن تعذّر جلبها: بلا تحميل مسبق للرئيسية
const fetchSettings = async () => {
  try {
    const { settings } = await fetchJson("/api/settings");
    return settings ?? null;
  } catch {
    return null;
  }
};

// أول صورتين في الكتاب الدوّار، بنفس منطق الواجهة (pages/Home.tsx → fanItems):
// الأغلفة المختارة له في لوحة التحكم إن وُجدت، وإلا أغلفة الكتب بترتيبها
const fanPreload = (books, settings) => {
  const chosen = (settings?.fanPages ?? []).map((m) => m?.url).filter(Boolean);
  const urls = chosen.length
    ? chosen
    : (books ?? []).map((b) => b.cover?.url).filter(Boolean);
  return urls
    .slice(0, 2)
    .map((url) => responsive(url, FAN_WIDTHS, FAN_SIZES));
};

const bookPage = (book) => {
  const firstParagraph = (book.description ?? []).find((p) => p.trim());
  const details = [book.client && `for ${book.client}`, book.year]
    .filter(Boolean)
    .join(", ");
  const description = clip(
    firstParagraph ??
      `Book design by USSAIN: cover and interior of “${book.title}”${details ? ` (${details})` : ""}.`,
  );
  return {
    path: `/books/${book.slug}`,
    title: `${book.title} — ${BRAND}`,
    description,
    image: book.cover?.url ? ogCover(book.cover.url) : DEFAULT_IMAGE,
    imageAlt: book.cover?.alt || `${book.title}, book design by USSAIN`,
    type: "article",
    preload: book.cover?.url
      ? [responsive(book.cover.url, COVER_WIDTHS, COVER_SIZES)]
      : [],
  };
};

// ===== التنفيذ =====

const template = await readFile(join(DIST, "index.html"), "utf8");
const home = {
  path: "/",
  title: `${BRAND} — Book Designer`,
  description:
    "Book designer for authors and brands: covers, interiors, journals, planners, workbooks and ebooks, ready for print and digital.",
  image: DEFAULT_IMAGE,
  imageAlt: "USSAIN — Book designer portfolio",
};

const [books, settings] = await Promise.all([fetchBooks(), fetchSettings()]);
home.preload = fanPreload(books, settings);
const pages = [
  home,
  ...PAGES.map((p) => ({
    ...p,
    image: DEFAULT_IMAGE,
    imageAlt: home.imageAlt,
  })),
  ...(books ?? []).filter((b) => b.slug && b.title).map(bookPage),
];

// كل الصفحات من نفس القالب الأصلي (الرئيسية تُكتب في الأخير فوق القالب نفسه)
for (const page of [...pages.slice(1), pages[0]])
  await write(page.path, render(template, page));

// خريطة الموقع: الرئيسية والصفحات الثابتة والكتب (مع تاريخ آخر تعديل لكل كتاب)
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ...[home, ...PAGES].map((p) => ({
    loc: `${SITE_URL}${p.path === "/" ? "/" : p.path}`,
    lastmod: today,
  })),
  ...(books ?? [])
    .filter((b) => b.slug)
    .map((b) => ({
      loc: `${SITE_URL}/books/${b.slug}`,
      lastmod: (b.updatedAt ?? "").slice(0, 10) || today,
    })),
];
await writeFile(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url><loc>${escapeHtml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`,
    )
    .join("\n")}\n</urlset>\n`,
);

// لوحة التحكم لا تُفهرس
await writeFile(
  join(DIST, "robots.txt"),
  `User-agent: *\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

console.log(
  `✓ prerender: ${pages.length} pages (${books ? books.length : 0} books, ${home.preload.length} home preloads), sitemap.xml, robots.txt`,
);
