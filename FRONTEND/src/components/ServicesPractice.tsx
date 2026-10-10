/** @format */
import { createRef, useMemo, type Ref, type RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import { AVAILABILITY } from "../data/site";
import type { Service } from "../data/services";

// القسم الثالث في صفحة الخدمات:
//   1. EXPERIENCE: جدول الخبرة
//   2. SERVICE(S): عنوان، وبجانبه TYPE (أسماء الخدمات) وFOCUS وSTATUS
//   3. بطاقة لكل خدمة: كلما وصلت بطاقة جديدة تثبت السابقة في أعلى الشاشة وتصغر وتبهت للخلف،
//      والجديدة تصعد فوقها
//
// ظهور القسم: لا يظهر إلا حين يبدأ أعلى صورتي القسم السابق بالخروج من أعلى الشاشة (trigger)،
// ثم يظهر تدريجيًا مع التمرير.

interface ExperienceRow {
  role: string;
  type: string;
  place: string;
  years: string;
}

interface ServicesPracticeProps {
  left: string;
  right: string;
  experienceHeading: string;
  experience: ExperienceRow[];
  servicesHeading: string;
  focus: string[];
  services: Service[];
  // العنصر الذي يبدأ القسم بالظهور حين يصل أعلاه إلى أعلى الشاشة (صورتا القسم السابق)
  trigger: RefObject<HTMLElement | null>;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const HEADING =
  "font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]";

// صورة الخدمة بحجم أكبر: صور services.ts مطلوبة بمقاس 600×480 لصفوف الصفحة الرئيسية الصغيرة
const large = (src: string) => src.replace("w=600&h=480", "w=1600&h=1000");

// بطاقة خدمة واحدة: تثبت في أعلى الشاشة، وحين تصعد البطاقة التالية فوقها تصغر وتبهت للخلف
// (والتالية تغطي الجزء السفلي منها)
interface ServiceCardProps {
  service: Service;
  index: number;
  // البطاقة التالية: نتابع صعودها لنعرف كم تصغر هذه. بدونها (آخر بطاقة) لا تصغر
  next?: RefObject<HTMLLIElement | null>;
  ref?: Ref<HTMLLIElement>;
}

const ServiceCard = ({ service, index, next, ref }: ServiceCardProps) => {
  const reduce = useReducedMotion();
  // 0 = أعلى البطاقة التالية عند أسفل الشاشة، 1 = وصلت إلى أعلى الشاشة (غطت هذه)
  const { scrollYProgress } = useScroll({
    target: next,
    offset: ["start end", "start start"],
  });
  const off = !next || reduce;
  const scale = useTransform(scrollYProgress, [0, 1], [1, off ? 1 : 0.55]);
  // البهتان أسرع من التصغير: يبدأ مبكرًا وينتهي في منتصف الطريق،
  // فتكون البطاقة باهتة حين تقترب التالية منها (لا في آخر لحظة)
  const opacity = useTransform(
    scrollYProgress,
    [0.1, 0.5],
    [1, off ? 1 : 0.15],
  );

  return (
    // كل بطاقة تثبت (sticky) في أعلى الشاشة حين تصل إليه، والتي بعدها تمر فوقها لأنها تأتي بعدها في الصفحة.
    // bg-white: حتى تغطي البطاقة التي تحتها
    <li ref={ref} className="sticky top-0 bg-white">
      <motion.div
        style={{ scale, opacity }}
        className="origin-top pb-12 pt-20 will-change-transform sm:pt-24">
        <div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
          <span className={`${MONO} font-medium`}>[{pad2(index + 1)}]</span>
          <div>
            <h3 className={`${MONO} font-medium`}>{service.title}</h3>
            <p className="mt-5 max-w-md font-sans text-[15px] font-medium normal-case leading-snug tracking-normal">
              {service.description}
            </p>
            <img
              src={large(service.images[0])}
              alt=""
              loading="lazy"
              decoding="async"
              className="mt-8 aspect-[16/10] max-h-[55vh] w-full bg-neutral-200 object-cover"
            />
          </div>
        </div>
      </motion.div>
    </li>
  );
};

const ServicesPractice = ({
  left,
  right,
  experienceHeading,
  experience,
  servicesHeading,
  focus,
  services,
  trigger,
}: ServicesPracticeProps) => {
  const reduce = useReducedMotion();
  // مرجع لكل بطاقة: كل بطاقة تتابع صعود التي بعدها
  const cardRefs = useMemo(
    () => services.map(() => createRef<HTMLLIElement>()),
    [services],
  );
  // 0 = أعلى الصورتين في أعلى الشاشة، 1 = خرج ربع شاشة منهما
  const { scrollYProgress } = useScroll({
    target: trigger,
    offset: ["start start", "start -25%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 80, 0]);

  return (
    <motion.section style={{ opacity, y }} className={`${SITE} py-12 sm:py-16`}>
      {/* الصف العلوي: كلمة يسارًا، EXPERIENCE من المنتصف، كلمة يمينًا */}
      <div className="grid grid-cols-[1fr_auto] items-start gap-6 lg:grid-cols-[1fr_1fr_auto]">
        <p className={`${MONO} font-medium`}>{left}</p>
        <p className={`${MONO} text-right font-medium lg:order-last`}>
          {right}
        </p>
        <h2 className={`${HEADING} col-span-2 lg:col-span-1`}>
          {experienceHeading}
        </h2>
      </div>

      {/* جدول الخبرة */}
      <ul className="mt-12 list-none sm:mt-16">
        {experience.map((row) => (
          <li
            key={`${row.role}-${row.years}`}
            className={`${MONO} grid grid-cols-2 gap-x-6 gap-y-1 border-b border-black py-4 font-medium lg:grid-cols-2`}>
            <span className="col-span-2 lg:col-span-1">{row.role}</span>
            <span className="col-span-2 grid grid-cols-[1fr_1fr_auto] gap-x-6 text-black/60 lg:col-span-1 lg:text-black">
              <span>{row.type}</span>
              <span>{row.place}</span>
              <span>{row.years}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* SERVICE(S) وبجانبه ثلاثة أعمدة صغيرة */}
      {/* id="services-list": روابط /services تنزل إلى هنا مباشرة. scroll-mt: مسافة تحت الناف بار */}
      <div
        id="services-list"
        className="mt-24 grid scroll-mt-20 gap-8 sm:mt-32 lg:grid-cols-2">
        <h2 className={HEADING}>{servicesHeading}</h2>
        <dl
          className={`${MONO} grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-[auto_auto_auto] sm:justify-start sm:gap-x-12`}>
          <div className="col-span-2 sm:col-span-1">
            <dt>Type</dt>
            <dd className="mt-3 font-medium">
              {services.map((s) => (
                <span key={s.title} className="block">
                  {s.title}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd className="mt-3 font-medium">
              {focus.map((f) => (
                <span key={f} className="block">
                  {f}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="mt-3 font-medium">{AVAILABILITY}</dd>
          </div>
        </dl>
      </div>

      {/* البطاقات المتراكبة */}
      <ol className="mt-8 list-none">
        {services.map((s, i) => (
          <ServiceCard
            key={s.title}
            ref={cardRefs[i]}
            next={cardRefs[i + 1]}
            service={s}
            index={i}
          />
        ))}
      </ol>
    </motion.section>
  );
};

export default ServicesPractice;
