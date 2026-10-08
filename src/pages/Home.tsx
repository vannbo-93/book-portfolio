/** @format */
import BookFan, { type FanItem } from "../components/BookFan";
import ScrollGrid, { type GridImage } from "../components/ScrollGrid";
import StackCards, { type StackImage } from "../components/StackCards";
import { books } from "../data/books";

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

// الصورة الوسطى التي تبدأ مالئة للشاشة: دقة أعلى لأنها تظهر بحجم الشاشة كلها
const GRID_HERO = nature("1426604966848-d7adac402bff", 2000);

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

const Home = () => (
  <main className="font-mono text-xs uppercase tracking-wide">
    <h1 className="sr-only">Designer Name — Book cover design portfolio</h1>

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
  </main>
);

export default Home;
