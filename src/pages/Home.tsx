/** @format */
import BookFan, { type FanItem } from "../components/BookFan";
import ScrollGrid, { type GridImage } from "../components/ScrollGrid";
import StackCards, { type StackImage } from "../components/StackCards";
import ImageTrail from "../components/ImageTrail";
import { books } from "../data/books";
import { SITE } from "../layout";
import { motion } from "motion/react";

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

// صور الشبكة: صور طبيعة مؤقتة من Unsplash (تحقّقت أن كل رابط يعمل).
// لاستبدال صورة: غيّر المعرّف (الأرقام بعد photo-)
const nature = (id: string, w = 800): GridImage => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=70`,
  alt: "",
});

const GRID_OUTER = [
  "1506905925346-21bda4d32df4",
  "1441974231531-c6227db76b6e",
  "1433086966358-54859d0ed716",
  "1475924156734-496f6cac6ec1",
  "1418065460487-3e41a6c84dc5",
  "1507525428034-b723cf961d3e",
].map((id) => nature(id));

const GRID_INNER = [
  "1470071459604-3b5ec3a7fe05",
  "1501854140801-50d01698950b",
  "1472214103451-9374bd1c798e",
  "1447752875215-b2761acb3c5d",
  "1470770841072-f978cf4d019e",
  "1511497584788-876760111969",
].map((id) => nature(id));

const GRID_CENTER = [
  "1469474968028-56623f02e42e",
  "1490750967868-88aa4486c946",
].map((id) => nature(id));

// الصورة الوسطى التي تبدأ غلافًا كبيرًا: دقة أعلى من بقية الشبكة لأنها تظهر كبيرة
const GRID_HERO = nature("1426604966848-d7adac402bff", 1200);

// البطاقات المتراكمة: صور طبيعة بدقة أعلى لأنها تظهر كبيرة
const STACK: StackImage[] = [
  "1470071459604-3b5ec3a7fe05",
  "1426604966848-d7adac402bff",
  "1433086966358-54859d0ed716",
  "1418065460487-3e41a6c84dc5",
  "1470770841072-f978cf4d019e",
  "1507525428034-b723cf961d3e",
  "1447752875215-b2761acb3c5d",
].map((id) => nature(id, 1600));

// الصور التي تلاحق الماوس: صغيرة (190px)، فتكفي دقة 400
const TRAIL = [
  "1506905925346-21bda4d32df4",
  "1441974231531-c6227db76b6e",
  "1433086966358-54859d0ed716",
  "1470071459604-3b5ec3a7fe05",
  "1501854140801-50d01698950b",
  "1472214103451-9374bd1c798e",
  "1469474968028-56623f02e42e",
  "1447752875215-b2761acb3c5d",
  "1426604966848-d7adac402bff",
  "1465146344425-f00d5f5c8f07",
  "1418065460487-3e41a6c84dc5",
  "1470770841072-f978cf4d019e",
  "1475924156734-496f6cac6ec1",
  "1511497584788-876760111969",
  "1490750967868-88aa4486c946",
  "1507525428034-b723cf961d3e",
].map((id) => nature(id, 400).src);

const Home = () => (
  <main className="font-mono text-xs uppercase tracking-wide">
    <h1 className="sr-only">Designer Name — Book cover design portfolio</h1>

    {/* أقسام داخل حدود الموقع */}
    <div className={SITE}>
      <BookFan items={items}>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2">
          [ Scroll down ]
        </span>
      </BookFan>

      <ScrollGrid
        outer={GRID_OUTER}
        inner={GRID_INNER}
        center={GRID_CENTER}
        hero={GRID_HERO}
      />

      <StackCards images={STACK} className="pb-[20vh]" />
    </div>

    {/* صور تلاحق الماوس على خلفية سوداء: خارج الحدود، يمتد من حافة الشاشة إلى حافتها.
        الفوتر يأتي تحته مباشرة بلا فراغ.
        data-nav="dark": يخبر الناف بار أن الخلفية هنا داكنة */}
    <div data-nav="dark">
      <ImageTrail items={TRAIL} className="group h-[80vh] bg-black">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
          {/* العبارة الرئيسية: خط الموقع (Inter) كبير وأبيض، بأحرفها العادية لا الكبيرة */}
          <h2 className="font-sans text-[clamp(2.5rem,8vw,7.5rem)] font-semibold normal-case leading-[0.95] tracking-[-0.04em] text-white">
            From manuscript to shelf
          </h2>
          {/* تعليمة صغيرة تنبض باستمرار حتى يلاحظها الزائر،
              وتختفي فقط حين يبدأ فعلًا برسم الأثر (لا بمجرد وجود الماوس فوق القسم)،
              وتعود حين يخرج منه */}
          <p className="text-white transition-opacity duration-500 group-data-trailing:opacity-0">
            <motion.span
              className="inline-block"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{
                duration: 2.4,
                ease: "easeInOut",
                repeat: Infinity,
              }}>
              <span className="hidden sm:inline">
                Move your cursor to flip through
              </span>
              <span className="sm:hidden">Drag to flip through</span>
            </motion.span>
          </p>
        </div>
      </ImageTrail>
    </div>
  </main>
);

export default Home;
