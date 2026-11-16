/** @format */
import { useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import { useSiteData } from "../data/siteData";
import { MONO } from "../hooks/useClock";
import NotFound from "./NotFound";
import SpreadLightbox from "../components/SpreadLightbox";
import { COVER_SIZES, COVER_WIDTHS, srcSet } from "../lib/image";

// صفحة الكتاب: الغلاف والمعلومات أولًا، ثم الصفحات المزدوجة كبيرة واحدة تحت الأخرى
// (الضغط على أي صفحة يفتحها بملء الشاشة: SpreadLightbox)،
// وفي النهاية رابط للكتاب التالي حتى يكمل الزائر التصفح بدل أن يعود للخلف.

const pad = (n: number) => String(n).padStart(2, "0");

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -10% 0px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const Book = () => {
  const { slug } = useParams();
  const { books } = useSiteData();
  // الصفحة المزدوجة المفتوحة بملء الشاشة (null = لا شيء)
  const [open, setOpen] = useState<number | null>(null);
  const index = books.findIndex((b) => b.slug === slug);
  if (index === -1) return <NotFound />;

  const book = books[index];
  // الكتاب التالي (وبعد الأخير يعود للأول)
  const next = books[(index + 1) % books.length];

  return (
    <main className="pb-24 pt-28 sm:pt-36">
      {/* سطر علوي: رجوع للأعمال، ورقم الكتاب من المجموع */}
      <div
        className={`${MONO} mb-10 flex justify-between border-b border-black/10 pb-4`}>
        <Link to="/work" className="underline-offset-[3px] hover:underline">
          ← All works
        </Link>
        <span className="text-black/40">
          {pad(index + 1)} / {pad(books.length)}
        </span>
      </div>

      {/* الغلاف والمعلومات: جنبًا إلى جنب على الشاشات الكبيرة */}
      <section className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <motion.img
          {...reveal}
          src={book.cover.src}
          srcSet={srcSet(book.cover.src, COVER_WIDTHS)}
          sizes={COVER_SIZES}
          alt={book.cover.alt || book.title}
          // أكبر صورة في أول شاشة: تُقدَّم على غيرها (والصفحة الثابتة تحمّلها مسبقًا، انظر prerender.mjs)
          fetchPriority="high"
          width={book.cover.width}
          height={book.cover.height}
          className="aspect-[2/3] w-full max-w-md rounded-[4px] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
        />

        <div className="flex flex-col md:sticky md:top-32 md:self-start">
          <h1 className="font-sans text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.9] tracking-[-0.06em]">
            {book.title}
          </h1>
          {/* نبذة عن المشروع */}
          <div className="mt-10">
            <p className={`${MONO}`}>About the project</p>
            <div className="mt-4 flex max-w-xl flex-col gap-4 font-sans text-[15px] font-medium leading-snug">
              {(Array.isArray(book.description)
                ? book.description
                : [book.description]
              ).map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>

          {/* تفاصيل المشروع: العنوان فوق والقيمة تحته، في أعمدة (2 على الهاتف، 4 على الأكبر).
              الحقل الفارغ لا يظهر */}
          <dl
            className={`${MONO} mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4`}>
            {[
              ["Client", book.client],
              ["Services", book.services],
              ["Year", String(book.year)],
              ["Location", book.location],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className="mt-3 font-medium">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>

      {/* الصفحات المزدوجة */}
      {book.spreads.length > 0 && (
        // mx-auto max-w-6xl: الصفحات المزدوجة في المنتصف بعرض أقصاه 1152px، لا بعرض الشاشة كاملة
        <section
          aria-label="Spreads"
          className="mx-auto mt-24 grid w-full max-w-6xl gap-10 sm:mt-32 sm:gap-16">
          {/* ظل خفيف + خط رفيع شبه شفاف حول كل صفحة: الصفحات البيضاء تظهر حدودها على خلفية الموقع البيضاء */}
          {book.spreads.map((spread, i) => (
            <motion.figure key={spread.src} {...reveal}>
              {/* الضغط يفتح الصفحة بملء الشاشة */}
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open spread ${i + 1} full screen`}
                className="block w-full cursor-zoom-in focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black">
                <img
                  src={spread.src}
                  alt={spread.alt || `${book.title}, spread ${i + 1}`}
                  width={spread.width}
                  height={spread.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-[4px] bg-neutral-200 object-cover shadow-[0_2px_6px_rgba(0,0,0,0.06),0_24px_48px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]"
                  style={{ aspectRatio: `${spread.width} / ${spread.height}` }}
                />
              </button>
              <figcaption className={`${MONO} mt-3 text-black/40`}>
                Spread {pad(i + 1)}
              </figcaption>
            </motion.figure>
          ))}
        </section>
      )}

      <SpreadLightbox
        key={book.slug}
        spreads={book.spreads}
        title={book.title}
        index={open}
        onIndex={setOpen}
      />

      {/* الكتاب التالي */}
      {books.length > 1 && (
        <Link
          to={`/books/${next.slug}`}
          className="group mt-24 flex items-end justify-between gap-6 border-t border-black/10 pt-6 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black sm:mt-32">
          <div>
            <p className={`${MONO} text-black/40`}>Next book</p>
            <p className="mt-2 font-sans text-[clamp(2rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.05em] underline-offset-[8px] decoration-2 group-hover:underline">
              {next.title} →
            </p>
          </div>
          <img
            src={next.cover.src}
            // صورة صغيرة (80–112px)
            srcSet={srcSet(next.cover.src, [200, 300])}
            sizes="(min-width: 640px) 112px, 80px"
            alt=""
            loading="lazy"
            className="aspect-[2/3] w-20 rounded-[3px] object-cover transition-transform duration-500 group-hover:-translate-y-1 sm:w-28"
          />
        </Link>
      )}
    </main>
  );
};

export default Book;
