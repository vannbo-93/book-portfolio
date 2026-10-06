/** @format */

import type { Book } from "../types";

// صور مؤقتة من picsum حتى تصل تصاميم المصمم
// الكوفر بنسبة 2:3، والصفحة المزدوجة 4:3 (صفحتان عموديتان جنبًا إلى جنب)
const cover = (seed: string) => ({
  src: `https://picsum.photos/seed/${seed}/600/900`,
  width: 600,
  height: 900,
  alt: "",
});

const spreads = (seed: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    src: `https://picsum.photos/seed/${seed}-${i}/1600/1200`,
    width: 1600,
    height: 1200,
    alt: "",
  }));

export const books: Book[] = [
  {
    slug: "first-book",
    title: "First Book",
    year: 2025,
    description: "Short description of the book.",
    cover: { ...cover("book1"), alt: "First Book cover" },
    spreads: spreads("book1", 6),
  },
  {
    slug: "second-book",
    title: "Second Book",
    year: 2024,
    description: "Short description of the book.",
    cover: { ...cover("book2"), alt: "Second Book cover" },
    spreads: spreads("book2", 5),
  },
  {
    slug: "third-book",
    title: "Third Book",
    year: 2023,
    description: "Short description of the book.",
    cover: { ...cover("book3"), alt: "Third Book cover" },
    spreads: spreads("book3", 4),
  },
];
