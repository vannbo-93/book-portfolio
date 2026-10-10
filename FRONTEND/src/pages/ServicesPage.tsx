/** @format */
import { useRef } from "react";
import ServicesHero from "../components/ServicesHero";
import ServicesApproach from "../components/ServicesApproach";
import ServicesPractice from "../components/ServicesPractice";
import { COVERS } from "../data/covers";
import { books } from "../data/books";
import { SERVICES } from "../data/services";
import {
  SERVICES_APPROACH,
  SERVICES_HERO,
  SERVICES_PRACTICE,
} from "../data/servicesPage";

// صفحة ABOUT (/about): عن المصمم وطريقته وخبرته وخدماته.
// /services يفتح نفس الصفحة نازلًا مباشرة إلى بطاقات الخدمات (انظر App.tsx)

// صورتا قسم الطريقة: مؤقتًا أول صفحة مزدوجة من أول كتابين
const APPROACH_IMAGES = [
  books[0].spreads[0],
  books[1 % books.length].spreads[0],
] as const;

const ServicesPage = () => {
  // صورتا القسم الثاني: حين يبدأ أعلاهما بالخروج من الشاشة يظهر القسم الثالث
  const imagesRef = useRef<HTMLDivElement>(null);

  return (
    <main className="font-mono text-xs uppercase tracking-wide">
      <ServicesHero
        covers={COVERS}
        nextId="services-content"
        {...SERVICES_HERO}
      />

      {/* القسم الثاني: إليه ينقل زر Scroll down */}
      <ServicesApproach
        id="services-content"
        images={[APPROACH_IMAGES[0], APPROACH_IMAGES[1]]}
        imagesRef={imagesRef}
        {...SERVICES_APPROACH}
      />

      <ServicesPractice
        services={SERVICES}
        trigger={imagesRef}
        {...SERVICES_PRACTICE}
      />
    </main>
  );
};

export default ServicesPage;
