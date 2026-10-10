/** @format */
import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { MONO } from "../hooks/useClock";
import ScrambleText from "./ScrambleText";
import { SERVICES, type Service } from "../data/services";

// قسم الخدمات: صف لكل خدمة، بخط رفيع تحته.
//   يسار: الرقم والاسم في الأعلى، والوسم الصغير أسفل يسار،
//         وأسفل يمين مفتاح IMAGES / DESCRIPTION يبدّل ما يظهر يمينًا
//   يمين: 4 صور (الثالثة أعرض)، أو وصف الخدمة إن اختير DESCRIPTION

const pad = (n: number) => String(n).padStart(2, "0");

const ServiceRow = ({
  service,
  index,
}: {
  service: Service;
  index: number;
}) => {
  const [view, setView] = useState<"images" | "description">("images");

  const toggle = (v: typeof view, label: string) => (
    <button
      type="button"
      onClick={() => setView(v)}
      aria-pressed={view === v}
      className={`cursor-pointer uppercase transition-colors aria-pressed:text-black ${
        view === v ? "" : "text-black/35 hover:text-black"
      } focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black`}>
      {label}
    </button>
  );

  return (
    <li className="grid gap-4 border-b border-black py-2 lg:grid-cols-2 lg:gap-6">
      {/* يسار */}
      <div
        className={`${MONO} flex flex-col justify-between gap-3 font-medium lg:min-h-24 lg:gap-6`}>
        <div>
          <p>[{pad(index + 1)}]</p>
          <h3>{service.title}</h3>
        </div>
        <div className="flex items-end justify-between gap-4">
          <p>{service.tag}</p>
          <p className="flex gap-1.5">
            {toggle("images", "Images")}
            <span className="text-black/35">/</span>
            {toggle("description", "Description")}
          </p>
        </div>
      </div>

      {/* يمين: الصور أو الوصف، بنفس الارتفاع حتى لا يقفز الصف عند التبديل */}
      <div className="relative h-28 sm:h-32 lg:h-[120px]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "images" ? (
            <motion.div
              key="images"
              className="grid h-full grid-cols-[1fr_1fr_2fr_1fr] gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              {service.images.slice(0, 4).map((src, i) => (
                <div key={i} className="overflow-hidden bg-neutral-200">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="description"
              className="flex h-full items-start font-sans text-lg normal-case leading-snug tracking-[-0.01em] sm:text-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}>
              {service.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
};

const Services = ({ viewAllHref = "/services" }: { viewAllHref?: string }) => (
  <section className="py-12 sm:py-16">
    <header className="mb-10 flex items-start justify-between gap-6 sm:mb-14">
      <h2 className="font-sans text-[clamp(2.5rem,6vw,4.5rem)] font-medium uppercase leading-[0.85] tracking-[-0.06em]">
        Service(s)
      </h2>
      <Link
        to={viewAllHref}
        className={`${MONO} mt-2 whitespace-nowrap underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current`}>
        <ScrambleText text="[ View all ]" />
      </Link>
    </header>

    <ul className="list-none border-t border-black">
      {SERVICES.map((s, i) => (
        <ServiceRow key={s.title} service={s} index={i} />
      ))}
    </ul>
  </section>
);

export default Services;
