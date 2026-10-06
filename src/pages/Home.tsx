/** @format */
import BookCover from "../components/BookCover";
import { books } from "../data/books";

const Home = () => (
  <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
    <header className="mb-12 sm:mb-16">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
        Designer Name
      </h1>
      <p className="mt-3 text-neutral-600">Book cover & editorial design</p>
    </header>

    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-14">
      {books.map((book, i) => (
        <li key={book.slug}>
          <BookCover book={book} priority={i < 4} />
        </li>
      ))}
    </ul>
  </main>
);

export default Home;
