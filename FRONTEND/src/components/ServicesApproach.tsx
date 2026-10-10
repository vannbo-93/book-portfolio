/** @format */
import type { Ref } from "react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import type { Img } from "../types";

// قسم الطريقة في صفحة الخدمات: كلمة يسارًا وكلمة يمينًا، والعنوان ونصان من منتصف الصفحة،
// ثم صورتان متساويتان جنبًا إلى جنب بعرض المحتوى كاملًا.

interface ApproachBlock {
  label: string;
  text: string;
}

interface ServicesApproachProps {
  id?: string;
  left: string;
  right: string;
  heading: string[];
  blocks: ApproachBlock[];
  images: [Img, Img];
  // مرجع لحاوية الصورتين: القسم التالي يبدأ بالظهور حين يصل أعلاها إلى أعلى الشاشة
  imagesRef?: Ref<HTMLDivElement>;
}

const ServicesApproach = ({
  id,
  left,
  right,
  heading,
  blocks,
  images,
  imagesRef,
}: ServicesApproachProps) => (
  <section id={id} className={`${SITE} py-12 sm:py-16`}>
    <div className="grid gap-6 lg:grid-cols-2">
      <p className={`${MONO} font-medium`}>{left}</p>

      <div>
        <div className="flex items-start justify-between gap-6">
          <h2 className="font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]">
            {heading.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p className={`${MONO} mt-1 shrink-0 font-medium`}>{right}</p>
        </div>

        {/* النصان: عنوان صغير ثم فقرة، واحدة تحت الأخرى */}
        <div className="mt-12 flex max-w-sm flex-col gap-10">
          {blocks.map((b) => (
            <div key={b.label}>
              <h3 className={`${MONO} font-medium`}>{b.label}</h3>
              <p className="mt-4 font-sans text-[15px] font-medium normal-case leading-snug tracking-normal">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* الصورتان: عمود واحد على الهاتف، جنبًا إلى جنب على الأكبر */}
    <div ref={imagesRef} className="mt-12 grid gap-1 sm:mt-16 sm:grid-cols-2">
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className="aspect-[3/2] w-full bg-neutral-200 object-cover"
        />
      ))}
    </div>
  </section>
);

export default ServicesApproach;
