/** @format */
import GradientWaves from "../components/GradientWaves";
// import BookCover from "../components/BookCover";
// import { books } from "../data/books";

const Home = () => (
  <>
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#120f17]">
      <GradientWaves
        horizonColor="#363c90"
        waveColor="#a7a7a7"
        crestColor="#FFFFFF"
        speed={0.55}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1}
        height={5.5}
        fogDepth={15}
        detail="low"
        brightness={1}
        opacity={1}
        mouseInteraction
        parallaxStrength={0.5}
        grain
        grainIntensity={0.05}
        dpr={0.75}
        fps={30}
      />
    </div>
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-8">
      {/* <h1 className="sr-only">Ussain</h1>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-14">
        {books.map((book, i) => (
          <li key={book.slug}>
            <BookCover book={book} priority={i < 4} />
          </li>
        ))}
      </ul> */}
    </main>
  </>
);

export default Home;
