/** @format */
// محتوى صفحة PROCESS (/process).
// ⚠ المدد، وعدد التعديلات، وطريقة الدفع أمثلة مؤقتة: يجب أن يحددها صاحب الموقع بنفسه،
//   لأن العميل سيعتبر ما يُكتب هنا التزامًا.

export interface ProcessStep {
  title: string;
  // المدة التقريبية لهذه المرحلة
  duration: string;
  text: string;
}

export const PROCESS_TEXT = {
  left: "Process",
  right: "Steps",
  heading: ["From manuscript", "to print"],
  intro:
    "A clear path from the first message to the final files. You always know what happens next, how long it takes, and what I need from you.",
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "Brief",
    duration: "1–2 days",
    text: "You send the manuscript and tell me about the book: the readers, the format, the printer, and the feeling it should have. I read it before anything else.",
  },
  {
    title: "Quote",
    duration: "2–3 days",
    text: "You receive a clear quote with the scope, the schedule, and what is included. Work starts once the quote is approved and the first payment is made.",
  },
  {
    title: "Direction",
    duration: "1 week",
    text: "I present two or three design directions for the cover or the interior: typography, grid, and mood. You choose one, and we refine it together.",
  },
  {
    title: "Layout",
    duration: "2–4 weeks",
    text: "The full book takes shape page by page: chapters, headings, images, and every small detail, built on the direction we agreed on.",
  },
  {
    title: "Revisions",
    duration: "1 week",
    text: "Two rounds of revisions are included. You mark your notes directly on the PDF, and I apply them carefully across the whole book.",
  },
  {
    title: "Final files",
    duration: "2–3 days",
    text: "You receive print-ready files set up for your printer, plus a digital edition if needed. I stay available if the printer asks for changes.",
  },
];

// ما يجهّزه العميل، وما يستلمه في النهاية، وطريقة الدفع
export const PROCESS_DETAILS = [
  {
    label: "You prepare",
    items: [
      "Final manuscript (Word)",
      "Trim size & page count",
      "Printer (KDP, IngramSpark…)",
      "Images & logos, if any",
    ],
  },
  {
    label: "You receive",
    items: [
      "Print-ready PDF",
      "EPUB or interactive PDF",
      "Cover with spine & back",
      "Source files on request",
    ],
  },
  {
    label: "Payment",
    items: ["50% to start", "50% on delivery", "Invoice for every payment"],
  },
];

export const PROCESS_CTA = {
  label: "Ready when you are",
  link: "Start a project",
};
