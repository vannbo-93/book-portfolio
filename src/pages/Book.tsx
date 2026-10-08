/** @format */
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import { books } from "../data/books";
import { MONO } from "../hooks/useClock";
import NotFound from "./NotFound";

// صفحة الكتاب: الغلاف والمعلومات أولًا، ثم الصفحات المزدوجة كبيرة واحدة تحت الأخرى،
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
          alt={book.cover.alt || book.title}
          width={book.cover.width}
          height={book.cover.height}
          className="aspect-[2/3] w-full max-w-md rounded-[4px] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
        />

        <div className="flex flex-col md:sticky md:top-32 md:self-start">
          <h1 className="font-sans text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.9] tracking-[-0.06em]">
            {book.title}
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-black/70">
            {book.description}
          </p>

          {/* تفاصيل المشروع: أضف حقولًا هنا حين تصل المعلومات الحقيقية (المؤلف، الناشر، الخدمة...) */}
          <dl
            className={`${MONO} mt-10 grid max-w-sm grid-cols-[7rem_1fr] gap-y-2 border-t border-black/10 pt-4`}>
            <dt className="text-black/40">Year</dt>
            <dd>{book.year}</dd>
            <dt className="text-black/40">Pages shown</dt>
            <dd>{book.spreads.length} spreads</dd>
          </dl>
        </div>
      </section>

      {/* الصفحات المزدوجة */}
      {book.spreads.length > 0 && (
        <section
          aria-label="Spreads"
          className="mt-24 grid gap-10 sm:mt-32 sm:gap-16">
          {book.spreads.map((spread, i) => (
            <motion.figure key={spread.src} {...reveal}>
              <img
                src={spread.src}
                alt={spread.alt || `${book.title}, spread ${i + 1}`}
                width={spread.width}
                height={spread.height}
                loading="lazy"
                decoding="async"
                className="w-full rounded-[4px] bg-neutral-200 object-cover"
                style={{ aspectRatio: `${spread.width} / ${spread.height}` }}
              />
              <figcaption className={`${MONO} mt-3 text-black/40`}>
                Spread {pad(i + 1)}
              </figcaption>
            </motion.figure>
          ))}
        </section>
      )}

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
