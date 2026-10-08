/** @format */
import { Link, useParams } from "react-router";
import { books } from "../data/books";

// صفحة كتاب مؤقتة: العنوان والكوفر ورابط العودة. نبنيها لاحقًا بالصفحات المزدوجة
const Book = () => {
  const { slug } = useParams();
  const book = books.find((b) => b.slug === slug);

  if (!book) {
    return (
      <main className="pt-32">
        <h1 className="text-2xl font-semibold">Book not found</h1>
        <Link to="/" className="mt-4 inline-block underline">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20">
      <Link to="/" className="text-sm underline">
        ← Back
      </Link>
      <h1 className="mt-6 text-4xl font-semibold">{book.title}</h1>
      <p className="mt-2 text-neutral-500">{book.year}</p>
      <img
        src={book.cover.src}
        alt={book.cover.alt}
        width={book.cover.width}
        height={book.cover.height}
        className="mt-8 h-auto w-full max-w-sm rounded-sm shadow-md"
      />
    </main>
  );
};

export default Book;
