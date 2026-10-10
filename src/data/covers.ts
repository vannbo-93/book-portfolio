/** @format */
import { books } from "./books";
import type { FormatKey, LatestItem } from "./formats";

// كل صور الأغلفة في الموقع، كل صورة بمقاس كتاب (جيب، رواية، مربع، أفقي...).
// مؤقتًا: الصور من books.ts والمقاسات موزعة بالتناوب، إلى أن تصل الأغلفة الحقيقية بمقاساتها.
const DEMO_FORMATS: FormatKey[] = [
  "standard",
  "square",
  "pocket",
  "landscape",
  "novel",
  "workbook",
  "a5",
];

export const COVERS: LatestItem[] = books
  .flatMap((book) => [
    { src: book.cover.src, title: book.title, href: `/books/${book.slug}` },
    ...book.spreads.map((s, i) => ({
      src: s.src,
      title: `${book.title} · ${String(i + 1).padStart(2, "0")}`,
      href: `/books/${book.slug}`,
    })),
  ])
  .map((item, i) => ({
    ...item,
    format: DEMO_FORMATS[i % DEMO_FORMATS.length],
  }));
