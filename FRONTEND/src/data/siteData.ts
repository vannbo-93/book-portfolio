/** @format */
import { createContext, useContext } from "react";
import { api } from "../lib/api";
import { sized, videoPoster, videoSized } from "../lib/image";
import type { Book, Img } from "../types";
import type { FormatKey, LatestItem } from "./formats";
import type { Faq } from "./faq";
import type { Service } from "./services";
import type { Testimonial } from "./testimonials";
import type { Stat } from "./Advantage";
import type { ExperienceRow } from "./servicesPage";
import type { NavItem } from "./site";

// كل محتوى الموقع القادم من الخادم: يُحمَّل مرة واحدة عند فتح الموقع (SiteDataProvider)،
// وتقرؤه المكونات بـ useSiteData() بدل ملفات data الثابتة القديمة.

export interface Settings {
  email: string;
  location: string;
  responseTime: string;
  city: string;
  timezone: string;
  available: boolean;
  // النص تحت نقطة التوفر: حسب available
  availability: string;
  socials: NavItem[];
  // روابط الفيديوهات (فارغ = لا فيديو، يبقى المربع الأسود)
  videos: { reel?: Video; stackLeft?: Video; stackRight?: Video };
}

// فيديو جاهز للعرض: الرابط المضغوط + صورة أول لقطة
export interface Video {
  src: string;
  poster?: string;
}

export interface SiteData {
  books: Book[];
  // كل الأغلفة لشريط الأغلفة وشاشة الدخول وأول صفحة About
  covers: LatestItem[];
  faqs: Faq[];
  services: Service[];
  testimonials: Testimonial[];
  stats: Stat[];
  experience: ExperienceRow[];
  settings: Settings;
}

// ===== شكل البيانات كما يرسلها الخادم =====
interface ApiMedia {
  url: string;
  width: number;
  height: number;
  alt?: string;
}
interface ApiBook {
  slug: string;
  title: string;
  year: number;
  format?: FormatKey;
  description: string[];
  client: string;
  services: string;
  location: string;
  cover: ApiMedia | null;
  spreads: ApiMedia[];
}
interface ApiContent {
  covers: {
    title: string;
    image: ApiMedia;
    format?: FormatKey;
    bookSlug?: string;
  }[];
  testimonials: {
    quote: string;
    name: string;
    role: string;
    photo: ApiMedia | null;
  }[];
  faqs: Faq[];
  services: {
    title: string;
    tag: string;
    description: string;
    images: ApiMedia[];
  }[];
  stats: Stat[];
  experience: ExperienceRow[];
}
interface ApiSettings {
  email: string;
  location: string;
  responseTime: string;
  city: string;
  timezone: string;
  available: boolean;
  availableText: string;
  busyText: string;
  socials: { label: string; href: string }[];
  videos: Record<"reel" | "stackLeft" | "stackRight", ApiMedia | null>;
}

// ===== التحويل إلى الشكل الذي تستعمله المكونات =====
const toVideo = (m: ApiMedia | null, width: number): Video | undefined =>
  m
    ? { src: videoSized(m.url, width), poster: videoPoster(m.url, width) }
    : undefined;

const toImg = (m: ApiMedia, width: number): Img => ({
  src: sized(m.url, width),
  width: m.width,
  height: m.height,
  alt: m.alt ?? "",
});

const toBook = (b: ApiBook): Book | null =>
  // كتاب بلا غلاف لا يُعرض (الخادم يمنع نشره أصلًا، هذا احتياط)
  b.cover
    ? {
        slug: b.slug,
        title: b.title,
        year: b.year,
        format: b.format ?? "standard",
        description: b.description,
        client: b.client,
        services: b.services,
        location: b.location,
        cover: toImg(b.cover, 900),
        spreads: b.spreads.map((s) => toImg(s, 2000)),
      }
    : null;

// إن لم تُضف أغلفة حصرية بعد: أغلفة الكتب وصفحاتها المزدوجة (المزدوجة عريضة، فمقاسها landscape)
const coversFromBooks = (books: Book[]): LatestItem[] =>
  books.flatMap((book) => [
    {
      src: book.cover.src,
      title: book.title,
      href: `/books/${book.slug}`,
      format: book.format,
    },
    ...book.spreads.map((s, i) => ({
      src: s.src,
      title: `${book.title} · ${String(i + 1).padStart(2, "0")}`,
      href: `/books/${book.slug}`,
      format: "landscape" as const,
    })),
  ]);

export const loadSiteData = async (): Promise<SiteData> => {
  const [{ books: apiBooks }, content, { settings: s }] = await Promise.all([
    api<{ books: ApiBook[] }>("/api/books"),
    api<ApiContent>("/api/content"),
    api<{ settings: ApiSettings }>("/api/settings"),
  ]);

  const books = apiBooks.map(toBook).filter((b): b is Book => b !== null);
  // رابط الغلاف الحصري: صفحة الكتاب إن طابق bookSlug كتابًا منشورًا (بالـ slug أو بالعنوان)،
  // وإلا صفحة Works. هكذا لا يقود slug مكتوب خطأً أو كتاب في المسودة إلى صفحة 404
  const key = (v: string) => v.trim().toLowerCase();
  const coverHref = (bookSlug?: string) => {
    if (!bookSlug) return "/work";
    const book = books.find(
      (b) => key(b.slug) === key(bookSlug) || key(b.title) === key(bookSlug),
    );
    return book ? `/books/${book.slug}` : "/work";
  };
  const covers: LatestItem[] = content.covers.length
    ? content.covers.map((c) => ({
        src: sized(c.image.url, 900),
        title: c.title,
        href: coverHref(c.bookSlug),
        format: c.format ?? "standard",
      }))
    : coversFromBooks(books);

  return {
    books,
    covers,
    faqs: content.faqs,
    // الصور بالرابط الأصلي: كل مكون يطلب الحجم الذي يحتاجه (sized)
    services: content.services.map((sv) => ({
      ...sv,
      images: sv.images.map((m) => m.url),
    })),
    testimonials: content.testimonials.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      photo: t.photo ? sized(t.photo.url, 160) : undefined,
    })),
    stats: content.stats,
    experience: content.experience,
    settings: {
      email: s.email,
      location: s.location,
      responseTime: s.responseTime,
      city: s.city,
      timezone: s.timezone || "UTC",
      available: s.available,
      availability: s.available ? s.availableText : s.busyText,
      socials: s.socials,
      // المربع الكبير يملأ الشاشة: 1920px. اللوحتان نصف الشاشة تقريبًا: 1080px
      videos: {
        reel: toVideo(s.videos.reel, 1920),
        stackLeft: toVideo(s.videos.stackLeft, 1080),
        stackRight: toVideo(s.videos.stackRight, 1080),
      },
    },
  };
};

export const SiteDataContext = createContext<SiteData | null>(null);

// المحتوى داخل أي مكون: const { books, settings } = useSiteData()
export const useSiteData = () => {
  const data = useContext(SiteDataContext);
  if (!data)
    throw new Error("useSiteData must be used inside <SiteDataProvider>");
  return data;
};
