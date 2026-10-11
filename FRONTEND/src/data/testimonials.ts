/** @format */
// قسم آراء العملاء: العناوين هنا، والآراء نفسها من لوحة التحكم.
// لا يظهر رأي في الموقع إلا إن وافق صاحبه على النشر (خانة consent في لوحة التحكم).
// photo: صورة العميل أو شعار شركته. بدونها تظهر الأحرف الأولى من الاسم.

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

// القائمة نفسها تأتي من الخادم (لوحة التحكم): useSiteData().testimonials (التي وافق أصحابها على النشر فقط)
