/** @format */
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { useSiteData } from "../data/siteData";
import { MONO } from "../hooks/useClock";
import { BOOK_CATEGORIES } from "../data/categories";

// صفحة الأعمال: كل الكتب في شبكة من الأغلفة.
// بنفس أسلوب الناف بار والفوتر: عنوان بخط Inter كبير، وتفاصيل بالخط الأحادي الصغير.
// الكتب المنشورة من لوحة التحكم: أضف كتابًا هناك فيظهر هنا تلقائيًا (ويتحدث الرقم في الناف بار).
// فوق الشبكة: فلتر التصنيفات (All + كل تصنيف فيه كتاب منشور). التصنيف المختار في الرابط
// (/work?category=business)، فيمكن مشاركة رابط مفلتر، وزر الرجوع في المتصفح يعمل.

const pad = (n: number) => String(n).padStart(2, "0");

const Works = () => {
  const { books } = useSiteData();
  const [params, setParams] = useSearchParams();
  // التصنيفات التي فيها كتاب واحد على الأقل، بترتيب القائمة
  const categories = BOOK_CATEGORIES.filter((c) =>
    books.some((b) => b.categories.includes(c.key)),
  );
  // تصنيف غير معروف في الرابط = All
  const active = categories.find((c) => c.key === params.get("category"));
  const shown = active
    ? books.filter((b) => b.categories.includes(active.key))
    : books;
  const choose = (key?: string) =>
    setParams(key ? { category: key } : {}, {
      replace: true,
      preventScrollReset: true,
    });

  return (
    <main className="pb-24 pt-28 sm:pt-36">
      <header className="mb-12 flex items-end justify-between gap-6 border-b border-black/10 pb-6 sm:mb-16">
        <h1 className="font-sans text-[clamp(2.75rem,9vw,7rem)] font-medium leading-[0.85] tracking-[-0.06em]">
          Works{" "}
          <span className="align-top font-mono text-[0.25em] font-bold tracking-normal">
            [{shown.length}]
          </span>
        </h1>
        <p
          className={`${MONO} hidden max-w-[16rem] text-right text-black/50 sm:block`}>
          Book covers and interior layouts, selected
        </p>
      </header>

      {/* الفلتر: لا يظهر إن لم يُصنَّف أي كتاب بعد. على الهاتف يُمرَّر أفقيًا */}
      {categories.length > 0 && (
        <nav
          aria-label="Filter by category"
          className={`${MONO} -mt-6 mb-10 flex gap-5 overflow-x-auto whitespace-nowrap pb-2 sm:-mt-8 sm:mb-14`}>
          {[{ key: undefined, label: "All" }, ...categories].map((c) => {
            const on = c.key === active?.key;
            const count = c.key
              ? books.filter((b) => b.categories.includes(c.key!)).length
              : books.length;
            return (
              <button
                key={c.label}
                type="button"
                aria-pressed={on}
                onClick={() => choose(c.key)}
                className={`shrink-0 underline-offset-[3px] transition-colors hover:text-black focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black ${on ? "text-black underline" : "text-black/40"}`}>
                {c.label} <sup>{count}</sup>
              </button>
            );
          })}
        </nav>
      )}

      {/* شبكة: عمودان على الهاتف، ثلاثة على الشاشات المتوسطة، أربعة على الكبيرة */}
      <ul className="grid list-none grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
        {shown.map((book, i) => (
          <motion.li
            key={book.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{
              duration: 0.6,
              delay: (i % 4) * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <Link
              to={`/books/${book.slug}`}
              className="group block focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black">
              <div className="overflow-hidden rounded-[4px] bg-neutral-200">
                <img
                  src={book.cover.src}
                  alt={book.cover.alt || book.title}
                  width={book.cover.width}
                  height={book.cover.height}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </div>
              {/* رقم الكتاب، العنوان، السنة: في سطر واحد كما في الناف بار */}
              <div
                className={`${MONO} mt-3 grid grid-cols-[2.5rem_1fr_auto] gap-2`}>
                <span className="text-black/40">{pad(i + 1)}</span>
                <span className="underline-offset-[3px] group-hover:underline">
                  {book.title}
                </span>
                <span className="text-black/40">{book.year}</span>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </main>
  );
};

export default Works;
