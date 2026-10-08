/** @format */
import BookFan, { type FanItem } from "../components/BookFan";
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

const Home = () => (
  <main className="font-mono text-xs uppercase tracking-wide">
    <h1 className="sr-only">Designer Name — Book cover design portfolio</h1>

    <div className={SITE}>
      <BookFan items={items}>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2">
          [ Scroll down ]
        </span>
      </BookFan>
    </div>
  </main>
);

export default Home;
