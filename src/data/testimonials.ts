/** @format */
// قسم آراء العملاء.
// ⚠ كل ما هنا مؤقت: الأسماء والتعليقات أمثلة فقط. استبدلها بتعليقات حقيقية من عملاء حقيقيين،
//   بأسمائهم وبموافقتهم على النشر، قبل إطلاق الموقع.
// photo: مسار صورة العميل أو شعار شركته (مثلًا "/clients/jane.jpg"). بدونه تظهر الأحرف الأولى من الاسم.

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  photo?: string;
}

export const TESTIMONIALS_TEXT = {
  heading: "Words from the authors",
  left: "Trust",
  right: "Testimonial",
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Placeholder — the cover finally looks like the book I wrote. Every page inside feels considered, and the files were ready for print on the first try.",
    name: "Author Name",
    role: "Author — Book Title",
  },
  {
    quote:
      "Placeholder — clear process, honest timelines, and a designer who listens. The planner sold out its first print run.",
    name: "Brand Name",
    role: "Founder — Planner Brand",
  },
  {
    quote:
      "Placeholder — professional from the first message to the final files. Our workbook is easier to use and looks far more premium.",
    name: "Publisher Name",
    role: "Editor — Publishing House",
  },
];
