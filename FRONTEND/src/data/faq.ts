/** @format */
// قسم الأسئلة الشائعة: العناوين هنا، والأسئلة نفسها من لوحة التحكم.

export interface Faq {
  question: string;
  // الكلمة القصيرة على يمين السؤال
  tag: string;
  answer: string;
}

export const FAQ_TEXT = {
  label: "Frequently asked questions",
  heading: ["Clarity", "builds the image"],
  side: "Clarity",
};

// القائمة نفسها تأتي من الخادم (لوحة التحكم): useSiteData().faqs
