/** @format */
import GhostCursor from "../components/GhostCursor";
import BookCover from "../components/BookCover";
import { books } from "../data/books";

const Home = () => (
  <>
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#120f17]">
      <GhostCursor
        color="#fcf9ff"
        brightness={0.4}
        edgeIntensity={0}
        trailLength={50}
        inertia={0.58}
        grainIntensity={0.2}
        bloomStrength={0}
        bloomRadius={8.9}
        bloomThreshold={0.21}
        fadeDelayMs={2100}
        fadeDurationMs={3400}
        zIndex={0}
      />
    </div>

    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-8">
      <h1 className="sr-only">Designer Name — Book cover design portfolio</h1>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-14">
        {books.map((book, i) => (
          <li key={book.slug}>
            <BookCover book={book} priority={i < 4} />
          </li>
        ))}
      </ul>
    </main>
  </>
);

export default Home;
