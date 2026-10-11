/** @format */
import { useRef } from "react";
import ServicesHero from "../components/ServicesHero";
import ServicesApproach from "../components/ServicesApproach";
import ServicesPractice from "../components/ServicesPractice";
import { useSiteData } from "../data/siteData";
import {
  SERVICES_APPROACH,
  SERVICES_HERO,
  SERVICES_PRACTICE,
} from "../data/servicesPage";

// صفحة ABOUT (/about): عن المصمم وطريقته وخبرته وخدماته.
// /services يفتح نفس الصفحة نازلًا مباشرة إلى بطاقات الخدمات (انظر App.tsx)

const ServicesPage = () => {
  const { books, covers, services, experience } = useSiteData();
  // صورتا قسم الطريقة: أول صفحة مزدوجة من أول كتابين (وإن لم توجد صفحات: الأغلفة)
  const approachImages = [
    ...books.flatMap((b) => b.spreads.slice(0, 1)),
    ...books.map((b) => b.cover),
  ].slice(0, 2);
  // صورتا القسم الثاني: حين يبدأ أعلاهما بالخروج من الشاشة يظهر القسم الثالث
  const imagesRef = useRef<HTMLDivElement>(null);

  return (
    <main className="font-mono text-xs uppercase tracking-wide">
      <ServicesHero
        covers={covers}
        nextId="services-content"
        {...SERVICES_HERO}
      />

      {/* القسم الثاني: إليه ينقل زر Scroll down */}
      <ServicesApproach
        id="services-content"
        images={approachImages}
        imagesRef={imagesRef}
        {...SERVICES_APPROACH}
      />

      <ServicesPractice
        services={services}
        experience={experience}
        trigger={imagesRef}
        {...SERVICES_PRACTICE}
      />
    </main>
  );
};

export default ServicesPage;
