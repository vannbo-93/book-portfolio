/** @format */
import BookFan, { type FanItem } from "../components/BookFan";
import LatestWorks from "../components/LatestWorks";
import ScrambleText from "../components/ScrambleText";
import Services from "../components/services";
import WhatIDo from "../components/WhatIDo";
import StackReveal from "../components/StackReveal";
import Advantage from "../components/Advantage";
import MediaExpand from "../components/MediaExpand";
import FAQ from "../components/FAQ";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import CoverMarquee from "../components/CoverMarquee";
import type { FormatKey, LatestItem } from "../data/formats";
import { books } from "../data/books";
import { SITE } from "../layout";

// صفحات الكتاب: كوفر كل كتاب (رابط إلى صفحته) ثم أول صفحاته المزدوجة.
// الكوفر وحده رابط، حتى لا يمر مستخدم لوحة المفاتيح على 12 رابطًا مكررًا
const PAGES_PER_BOOK = 4;
const items: FanItem[] = books.flatMap((book) => [
  {
    src: book.cover.src,
    alt: book.cover.alt || book.title,
    href: `/books/${book.slug}`,
  },
  ...book.spreads
    .slice(0, PAGES_PER_BOOK - 1)
    .map((s) => ({ src: s.src, alt: "" })),
]);

// آخر الأعمال: أغلفة بمقاسات كتب حقيقية مختلفة (جيب، رواية، مربع، أفقي...).
// مؤقتًا: الصور من books.ts (غلاف كل كتاب ثم صفحاته بالتناوب) والمقاسات موزعة بالتناوب.
// حين تصل الأعمال الحقيقية: ضع لكل عمل صورة غلافه ومقاسه الحقيقي (format)
const DEMO_FORMATS: FormatKey[] = [
  "standard",
  "square",
  "pocket",
  "landscape",
  "novel",
  "workbook",
  "a5",
  "standard",
  "landscape",
  "pocket",
];
const perBook = books.map((book) => [
  { src: book.cover.src, title: book.title, href: `/books/${book.slug}` },
  ...book.spreads.map((s, i) => ({
    src: s.src,
    title: `${book.title} · ${String(i + 1).padStart(2, "0")}`,
    href: `/books/${book.slug}`,
  })),
]);
const LATEST: LatestItem[] = Array.from(
  { length: Math.max(...perBook.map((p) => p.length)) },
  (_, i) => perBook.map((p) => p[i]).filter(Boolean),
)
  .flat()
  .slice(0, 10)
  .map((item, i) => ({
    ...item,
    format: DEMO_FORMATS[i % DEMO_FORMATS.length],
  }));

// زر Scroll down: ينقل إلى قسم آخر الأعمال بانسياب (فورًا لمن فعّل "تقليل الحركة")
const scrollToLatest = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById("latest")
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
};

const Home = () => (
  <main className="font-mono text-xs uppercase tracking-wide">
    <h1 className="sr-only">Designer Name — Book cover design portfolio</h1>

    <div className={SITE}>
      <BookFan items={items}>
        <button
          type="button"
          onClick={scrollToLatest}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer uppercase underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current">
          <ScrambleText text="[ Scroll down ]" />
        </button>
      </BookFan>

      <LatestWorks id="latest" items={LATEST} total={books.length} />

      <Services />
    </div>

    {/* WHAT I DO يثبت، ثم يغطيه لوحان أسودان (مكان مقاطع الأنميشن لاحقًا): الأيمن أولًا ثم الأيسر.
        خارج حدود الموقع حتى يغطي اللوحان عرض الشاشة كله */}
    <StackReveal next={<Advantage />}>
      <WhatIDo />
    </StackReveal>
    {/* المربع الأسود الذي يكبر حتى يغطي الشاشة. مقطع الفيديو يوضع داخله لاحقًا */}
    <MediaExpand />

    {/* الأسئلة الشائعة */}
    <FAQ />

    {/* آراء العملاء */}
    <Testimonials />

    {/* التواصل */}
    <Contact />

    {/* شريط الأغلفة الحصرية: يمر من اليمين إلى اليسار دون توقف، بعرض الشاشة كاملًا.
        الآن يعرض نفس أغلفة LATEST، إلى أن تجهز قائمة الأغلفة الحصرية */}
    <CoverMarquee items={LATEST} />
  </main>
);

export default Home;
