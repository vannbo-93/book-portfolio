/** @format */
import type { Book, Img } from "../types";

// بيانات مؤقتة: صور طبيعة من Unsplash حتى تصل تصاميم المصمم.
// كل رابط تحقّقت أنه يعمل. لاستبدال صورة: غيّر المعرّف (الجزء بعد photo-)
const nature = (
  id: string,
  width: number,
  height: number,
  alt: string,
): Img => ({
  src: `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&fit=crop&auto=format&q=70`,
  width,
  height,
  alt,
});

// الكوفر بنسبة 2:3، والصفحة المزدوجة 4:3 (صفحتان عموديتان جنبًا إلى جنب)
const cover = (id: string, alt: string) => nature(id, 600, 900, alt);
const spread = (id: string) => nature(id, 1600, 1200, "");

export const books: Book[] = [
  {
    slug: "mountains",
    title: "Mountains",
    year: 2025,
    description: "Peaks, ridges and the quiet light above the clouds.",
    cover: cover("1506905925346-21bda4d32df4", "Mountains cover"),
    spreads: [
      spread("1470071459604-3b5ec3a7fe05"),
      spread("1426604966848-d7adac402bff"),
      spread("1418065460487-3e41a6c84dc5"),
      spread("1469474968028-56623f02e42e"),
    ],
  },
  {
    slug: "forests",
    title: "Forests",
    year: 2024,
    description: "Paths, trunks and green shadows deep in the woods.",
    cover: cover("1441974231531-c6227db76b6e", "Forests cover"),
    spreads: [
      spread("1447752875215-b2761acb3c5d"),
      spread("1511497584788-876760111969"),
      spread("1501854140801-50d01698950b"),
      spread("1472214103451-9374bd1c798e"),
    ],
  },
  {
    slug: "waters",
    title: "Waters",
    year: 2023,
    description: "Lakes, waterfalls and the edge of the sea.",
    cover: cover("1433086966358-54859d0ed716", "Waters cover"),
    spreads: [
      spread("1470770841072-f978cf4d019e"),
      spread("1507525428034-b723cf961d3e"),
      spread("1475924156734-496f6cac6ec1"),
      spread("1465146344425-f00d5f5c8f07"),
    ],
  },
];
