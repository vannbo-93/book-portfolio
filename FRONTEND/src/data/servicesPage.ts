/** @format */
import { BRAND } from "./site";

// نصوص صفحة ABOUT (/about): عن المصمم وطريقته وخبرته وخدماته
export const SERVICES_HERO = {
  left: "About",
  right: "Info",
  // العنوان في منتصف القسم الأول
  heading: `${BRAND} designs books from the first cover to the final page`,
};

// القسم الثاني: الطريقة. نصان تحت العنوان، ثم صورتان جنبًا إلى جنب.
// الصور الآن من صفحات الكتب (طبيعة) إلى أن تصل صور حقيقية لمكان العمل أو مراحل التصميم.
export const SERVICES_APPROACH = {
  left: "Approach",
  right: "Process",
  heading: ["Reading, layout,", "and print"],
  blocks: [
    {
      label: "Reading",
      text: "Every book starts with the manuscript. I read it, learn who the readers are, and agree with you on the tone, the format, and the details that matter before any design begins. Clear decisions at this stage keep the whole project focused.",
    },
    {
      label: "Making",
      text: "This is where the book takes shape. Typography, grids, and covers are built with care for every page, then refined with your feedback and delivered as print-ready and digital files that look consistent from the cover to the last page.",
    },
  ],
};

// القسم الثالث: الخبرة ثم الخدمات. صفوف الخبرة نفسها من لوحة التحكم (useSiteData().experience)
export interface ExperienceRow {
  role: string;
  type: string;
  place: string;
  years: string;
}

export const SERVICES_PRACTICE = {
  left: "Practice",
  right: "Career",
  experienceHeading: "Experience",
  servicesHeading: "Service(s)",
  // العمود الأوسط تحت FOCUS
  focus: ["Reading", "Layout", "Print"],
};
