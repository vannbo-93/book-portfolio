/** @format */
import { Link } from "react-router";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import ScrambleText from "../components/ScrambleText";
import ProcessSteps from "../components/ProcessSteps";
import {
  PROCESS_CTA,
  PROCESS_DETAILS,
  PROCESS_STEPS,
  PROCESS_TEXT,
} from "../data/process";

// صفحة PROCESS (/process): كيف يسير المشروع من المخطوطة إلى الطباعة.
//   1. العنوان ونبذة قصيرة
//   2. المراحل (رقم ضخم يتبدل مع التمرير)
//   3. ما يجهّزه العميل، وما يستلمه، والدفع
//   4. دعوة كبيرة لبدء مشروع (رابط لصفحة التواصل)

const HEADING =
  "font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]";

const Process = () => (
  <main className="pt-12 font-mono text-xs uppercase tracking-wide sm:pt-16">
    <div className={SITE}>
      {/* 1. العنوان: نفس ترتيب بقية الأقسام */}
      <section className="py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <p className={`${MONO} font-medium`}>{PROCESS_TEXT.left}</p>
          <div>
            <div className="flex items-start justify-between gap-6">
              <h1 className={HEADING}>
                {PROCESS_TEXT.heading.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </h1>
              <p className={`${MONO} mt-1 shrink-0 font-medium`}>
                {PROCESS_TEXT.right}
              </p>
            </div>
            <p className="mt-8 max-w-sm font-sans text-[15px] font-medium normal-case leading-snug tracking-normal">
              {PROCESS_TEXT.intro}
            </p>
          </div>
        </div>
      </section>

      {/* 2. المراحل */}
      <section aria-label="Steps" className="py-12 sm:py-16">
        <ProcessSteps steps={PROCESS_STEPS} />
      </section>

      {/* 3. التفاصيل: ثلاثة أعمدة في النصف الأيمن */}
      <section
        aria-label="Details"
        className="grid gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <h2 className={HEADING}>Details</h2>
        <dl
          className={`${MONO} grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3`}>
          {PROCESS_DETAILS.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd className="mt-3 font-medium">
                {d.items.map((item) => (
                  <span key={item} className="block">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>

    {/* 4. الدعوة: صف أسود بعرض الشاشة، النص الكبير رابط لصفحة التواصل */}
    <section data-nav="dark" className="mt-12 bg-black text-white sm:mt-16">
      <Link
        to="/contact"
        className={`${SITE} group flex flex-col gap-8 py-16 focus-visible:outline-1 focus-visible:-outline-offset-8 focus-visible:outline-white sm:py-24`}>
        <span className={`${MONO} font-medium`}>{PROCESS_CTA.label}</span>
        <span className="flex items-end justify-between gap-6">
          <span className="font-sans text-[clamp(2.75rem,9vw,10rem)] font-medium uppercase leading-[0.85] tracking-[-0.06em]">
            {PROCESS_CTA.link}
          </span>
          {/* السهم يتحرك قليلًا عند المرور */}
          <span
            aria-hidden="true"
            className="font-sans text-[clamp(2.75rem,9vw,10rem)] leading-[0.85] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:translate-x-2">
            ↗
          </span>
        </span>
        <span className={`${MONO} font-medium`}>
          <ScrambleText text="[ Contact ]" />
        </span>
      </Link>
    </section>
  </main>
);

export default Process;
