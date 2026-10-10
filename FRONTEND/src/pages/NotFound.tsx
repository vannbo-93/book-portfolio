/** @format */
import { Link } from "react-router";
import { MONO } from "../hooks/useClock";

// صفحة 404: لأي رابط غير موجود (ومنها الصفحات التي لم نبنها بعد)
const NotFound = () => (
  <main className="flex min-h-[80svh] flex-col justify-center pb-16 pt-28">
    <p className={`${MONO} text-black/40 `}>Error 404</p>
    <h1 className="mt-4 font-sans text-[clamp(3rem,12vw,10rem)] font-medium leading-[0.85] tracking-[-0.06em]">
      Page not
      <br />
      written yet
    </h1>
    <div className={`${MONO} mt-10 flex gap-6`}>
      <Link to="/" className="underline underline-offset-[3px]">
        ← Back home
      </Link>
      <Link to="/work" className="underline-offset-[3px] hover:underline">
        See the works
      </Link>
    </div>
  </main>
);

export default NotFound;
