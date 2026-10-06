/** @format */
import { Link } from "react-router";
import type { Book } from "../types";

interface BookCoverProps {
  book: Book;
  // الكوفرات الظاهرة أول فتح الصفحة تُحمَّل فورًا، والباقي عند الاقتراب منها
  priority?: boolean;
}

const BookCover = ({ book, priority = false }: BookCoverProps) => (
  <Link
    to={`/books/${book.slug}`}
    className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900">
    <img
      src={book.cover.src}
      alt={book.cover.alt}
      width={book.cover.width}
      height={book.cover.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className="h-auto w-full rounded-sm bg-neutral-200 shadow-md"
    />
    <div className="mt-3 flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-medium text-neutral-900">{book.title}</h2>
      <span className="text-xs text-neutral-500">{book.year}</span>
    </div>
  </Link>
);

export default BookCover;
