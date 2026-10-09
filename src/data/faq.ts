/** @format */
// محتوى قسم الأسئلة الشائعة.
// الإجابات مكتوبة كمثال مناسب لمصمم كتب: راجعها مع صاحب الموقع، خصوصًا المدد وعدد التعديلات.

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

export const FAQS: Faq[] = [
  {
    question: "What services do you offer?",
    tag: "Services",
    answer:
      "I design book interiors, covers, journals, planners, workbooks, and ebooks. Most projects combine several of these, so the cover and the pages inside share one consistent look.",
  },
  {
    question: "What is your typical turnaround time?",
    tag: "Timeline",
    answer:
      "A cover usually takes one to two weeks. A full interior takes three to six weeks, depending on the page count and how complex the layout is. You get a clear schedule before we start.",
  },
  {
    question: "Which files will I receive?",
    tag: "Files",
    answer:
      "You receive print-ready PDFs with the correct bleed and trim for your printer, plus an EPUB or interactive PDF if your project includes a digital edition. Source files are available on request.",
  },
  {
    question: "Can you prepare files for Amazon KDP or IngramSpark?",
    tag: "Printing",
    answer:
      "Yes. I set up the trim size, margins, bleed, and spine width to match your printer's specifications, so the files pass their checks on the first upload.",
  },
  {
    question: "How many revisions are included?",
    tag: "Revisions",
    answer:
      "Each project includes two rounds of revisions at every main stage: concept, layout, and final files. Extra rounds can be added if needed.",
  },
  {
    question: "What does your process look like?",
    tag: "Process",
    answer:
      "We start with a short brief about your book and readers. Then I present a design direction, build the layout, refine it with your feedback, and deliver final files ready for print and digital use.",
  },
];
