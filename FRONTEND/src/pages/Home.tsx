/** @format */
import BookFan, { type FanItem } from "../components/BookFan";
import LatestWorks from "../components/LatestWorks";
import ScrambleText from "../components/ScrambleText";
import Services from "../components/Services";
import WhatIDo from "../components/WhatIDo";
import StackReveal from "../components/StackReveal";
import Advantage from "../components/Advantage";
import MediaExpand from "../components/MediaExpand";
import FAQ from "../components/FAQ";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import CoverMarquee from "../components/CoverMarquee";
import LoopVideo from "../components/LoopVideo";
import { BRAND } from "../data/site";
import type { LatestItem } from "../data/formats";
import { useSiteData } from "../data/siteData";
import type { Book } from "../types";
import { SITE } from "../layout";
import { scrollToElement } from "../lib/scroll";

// صفحات الكتاب الدوّار: أغلفة فقط (بلا صفحات مزدوجة).
// أغلفة الكتب المنشورة أولًا (كل غلاف رابط إلى صفحة كتابه)، ثم الأغلفة الحصرية
// من قسم Covers في لوحة التحكم (غير المرتبطة بكتاب: رابطها /work).
// إن قلّت الأغلفة عن MIN_PAGES تتكرر حتى يبدو الكتاب ممتلئًا؛ النسخ المكررة ليست روابط
// حتى لا يمر مستخدم لوحة المفاتيح على الرابط نفسه مرتين.
const MIN_PAGES = 12;
const fanItems = (
  books: Book[],
  covers: LatestItem[],
  chosen: { src: string; alt: string }[],
): FanItem[] => {
  // أغلفة اختارها المصمم خصيصًا للكتاب الدوّار (لوحة التحكم ← Settings): لها الأولوية وحدها
  const unique: FanItem[] = chosen.length
    ? chosen.map((c) => ({ src: c.src, alt: c.alt }))
    : [
        ...books.map((book) => ({
          src: book.cover.src,
          alt: book.cover.alt || book.title,
          href: `/books/${book.slug}`,
        })),
        ...covers
          .filter((c) => c.href === "/work")
          .map((c) => ({ src: c.src, alt: c.title })),
      ];
  if (!unique.length) return [];
  const count = Math.max(MIN_PAGES, unique.length);
  return Array.from({ length: count }, (_, i) =>
    i < unique.length
      ? unique[i]
      : { src: unique[i % unique.length].src, alt: "" },
  );
};

// آخر الأعمال: غلاف كل كتاب بمقاسه الحقيقي (format من لوحة التحكم)، ثم صفحاته المزدوجة (عريضة: landscape)،
// بالتناوب بين الكتب: غلاف الأول، غلاف الثاني...، ثم أول صفحة من كل كتاب... حتى 10 عناصر
const latestItems = (books: Book[]): LatestItem[] => {
  const perBook = books.map((book) => [
    {
      src: book.cover.src,
      title: book.title,
      href: `/books/${book.slug}`,
      format: book.format,
    },
    ...book.spreads.map((s, i) => ({
      src: s.src,
      title: `${book.title} · ${String(i + 1).padStart(2, "0")}`,
      href: `/books/${book.slug}`,
      format: "landscape" as const,
    })),
  ]);
  const longest = Math.max(0, ...perBook.map((p) => p.length));
  return Array.from({ length: longest }, (_, i) =>
    perBook.map((p) => p[i]).filter(Boolean),
  )
    .flat()
    .slice(0, 10);
};

// زر Scroll down: ينقل إلى قسم آخر الأعمال بنفس نعومة تمرير الموقع
const scrollToLatest = () => scrollToElement(document.getElementById("latest"));

const Home = () => {
  const { books, covers, settings } = useSiteData();
  const { reel, stackLeft, stackRight } = settings.videos;
  return (
    <main className="font-mono text-xs uppercase tracking-wide">
      <h1 className="sr-only">{BRAND} — Book design portfolio</h1>

      <div className={SITE}>
        <BookFan items={fanItems(books, covers, settings.fanPages)}>
          <button
            type="button"
            onClick={scrollToLatest}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer uppercase underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current">
            <ScrambleText text="[ Scroll down ]" />
          </button>
        </BookFan>

        <LatestWorks
          id="latest"
          items={latestItems(books)}
          total={books.length}
        />

        <Services />
      </div>

      {/* WHAT I DO يثبت، ثم يغطيه لوحان (أسودان، أو بالفيديو المرفوع من لوحة التحكم): الأيمن أولًا ثم الأيسر.
        خارج حدود الموقع حتى يغطي اللوحان عرض الشاشة كله */}
      <StackReveal
        next={<Advantage />}
        left={stackLeft ? <LoopVideo {...stackLeft} /> : undefined}
        right={stackRight ? <LoopVideo {...stackRight} /> : undefined}>
        <WhatIDo />
      </StackReveal>
      {/* المربع الذي يكبر حتى يغطي الشاشة: بداخله الفيديو (reel) إن رُفع، وإلا يبقى أسود */}
      <MediaExpand>{reel ? <LoopVideo {...reel} /> : undefined}</MediaExpand>

      {/* الأسئلة الشائعة */}
      <FAQ />

      {/* آراء العملاء */}
      <Testimonials />

      {/* التواصل */}
      <Contact />

      {/* شريط الأغلفة: يمر من اليمين إلى اليسار دون توقف، بعرض الشاشة كاملًا.
        يعرض الأغلفة الحصرية من لوحة التحكم (أو أغلفة الكتب إن لم تُضف بعد)، مثل صفحة CONTACT */}
      <CoverMarquee items={covers} />
    </main>
  );
};

export default Home;
