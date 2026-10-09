/** @format */
// الخدمات: النص من صاحب الموقع، والصور مؤقتة (صور طبيعة) حتى تصل صور حقيقية من أعماله.
// tag: الكلمة الصغيرة أسفل يسار كل خدمة (اقتراح مني، غيّرها كما تريد)

export interface Service {
  title: string;
  tag: string;
  description: string;
  // 4 صور: الثالثة تظهر أعرض من الباقي
  images: string[];
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=480&fit=crop&auto=format&q=70`;

export const SERVICES: Service[] = [
  {
    title: "Journal & planner design",
    tag: "Prompts & planning systems",
    description:
      "Custom pages built around your prompts, planning system, and the way people will use them.",
    images: [
      img("1506905925346-21bda4d32df4"),
      img("1470071459604-3b5ec3a7fe05"),
      img("1441974231531-c6227db76b6e"),
      img("1501854140801-50d01698950b"),
    ],
  },
  {
    title: "Book interior design",
    tag: "Typography & layout",
    description:
      "Thoughtful typography and page layouts that make your manuscript clear, comfortable to read, and ready for print.",
    images: [
      img("1472214103451-9374bd1c798e"),
      img("1469474968028-56623f02e42e"),
      img("1447752875215-b2761acb3c5d"),
      img("1433086966358-54859d0ed716"),
    ],
  },
  {
    title: "Workbook & guide design",
    tag: "Exercises & lessons",
    description:
      "Structured layouts for exercises, lessons, and practical content, with room to reflect and write.",
    images: [
      img("1426604966848-d7adac402bff"),
      img("1465146344425-f00d5f5c8f07"),
      img("1418065460487-3e41a6c84dc5"),
      img("1470770841072-f978cf4d019e"),
    ],
  },
  {
    title: "Cover design",
    tag: "Front, spine & back",
    description:
      "Covers that reflect what’s inside, with the front, spine, and back designed together.",
    images: [
      img("1475924156734-496f6cac6ec1"),
      img("1511497584788-876760111969"),
      img("1490750967868-88aa4486c946"),
      img("1507525428034-b723cf961d3e"),
    ],
  },
  {
    title: "Ebook & digital PDF design",
    tag: "EPUB & interactive PDF",
    description:
      "EPUBs and digital PDFs adapted for reading on screen, with clear navigation and clickable links.",
    images: [
      img("1441974231531-c6227db76b6e"),
      img("1506905925346-21bda4d32df4"),
      img("1469474968028-56623f02e42e"),
      img("1433086966358-54859d0ed716"),
    ],
  },
];

// قسم "ماذا أفعل"
export const WHAT_I_DO =
  "I design books, journals, planners, and workbooks for authors and brands. From the first cover impression to the smallest detail inside, I give every project a consistent look and prepare the files for print and digital use.";
