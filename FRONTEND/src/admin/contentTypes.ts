/** @format */
import { FORMATS } from "../data/formats";
import type { UploadFolder } from "./uploads";
import type { ContentItem, Media } from "./types";

// وصف كل نوع محتوى: حقوله في النموذج، وكيف يظهر في القائمة.
// صفحة واحدة (ContentList) تبني نفسها من هذا الوصف لكل الأنواع.

export type Field =
  | {
      name: string;
      label: string;
      kind: "text" | "textarea";
      required?: boolean;
      hint?: string;
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      kind: "number";
      required?: boolean;
      hint?: string;
    }
  | { name: string; label: string; kind: "checkbox"; hint?: string }
  | {
      name: string;
      label: string;
      kind: "select";
      options: { value: string; label: string }[];
      defaultValue: string;
      hint?: string;
    }
  | {
      name: string;
      label: string;
      kind: "image";
      required?: boolean;
      hint?: string;
    }
  | { name: string; label: string; kind: "images"; max: number; hint?: string };

export interface ContentType {
  title: string;
  note: string;
  folder: UploadFolder;
  fields: Field[];
  // سطر العنصر في القائمة
  summary: (item: ContentItem) => string;
  // صورته المصغرة في القائمة (إن وجدت)
  thumb?: (item: ContentItem) => Media | null | undefined;
}

const formatOptions = Object.entries(FORMATS).map(([value, f]) => ({
  value,
  label: `${f.label} (${f.w} × ${f.h} in)`,
}));

export const CONTENT_TYPES: Record<string, ContentType> = {
  covers: {
    title: "Exclusive covers",
    note: "The moving strip of covers (home and contact pages), the intro screen and the About page. If empty, the books' covers are used.",
    folder: "covers",
    fields: [
      { name: "image", label: "Cover image", kind: "image", required: true },
      { name: "title", label: "Title", kind: "text" },
      {
        name: "format",
        label: "Book format",
        kind: "select",
        options: formatOptions,
        defaultValue: "standard",
        hint: "Sets the cover shape.",
      },
      {
        name: "bookSlug",
        label: "Opens book (slug)",
        kind: "text",
        hint: "Optional: the book's link, e.g. mountains. Empty = opens the Works page.",
      },
    ],
    summary: (i) => String(i.title || "Untitled cover"),
    thumb: (i) => i.image as Media,
  },
  testimonials: {
    title: "Testimonials",
    note: "Only testimonials with the client's permission appear on the site. Never publish a testimonial without it.",
    folder: "testimonials",
    fields: [
      { name: "quote", label: "Quote", kind: "textarea", required: true },
      { name: "name", label: "Name", kind: "text", required: true },
      {
        name: "role",
        label: "Role",
        kind: "text",
        placeholder: "Author — Book title",
      },
      {
        name: "photo",
        label: "Photo or logo",
        kind: "image",
        hint: "Optional. Without it, the initials are shown.",
      },
      {
        name: "consent",
        label: "The client agreed to publish this testimonial",
        kind: "checkbox",
      },
    ],
    summary: (i) =>
      `${i.name}${i.consent ? "" : " — no permission yet (hidden)"}`,
    thumb: (i) => i.photo as Media | null,
  },
  faqs: {
    title: "FAQ",
    note: "Questions in the order they appear on the home page.",
    folder: "misc",
    fields: [
      { name: "question", label: "Question", kind: "text", required: true },
      {
        name: "tag",
        label: "Short tag",
        kind: "text",
        placeholder: "Timeline",
        hint: "One word shown beside the question.",
      },
      { name: "answer", label: "Answer", kind: "textarea", required: true },
    ],
    summary: (i) => String(i.question),
  },
  services: {
    title: "Services",
    note: "Service rows on the home page and the cards on the About page. Also the topics in the contact form.",
    folder: "services",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      {
        name: "tag",
        label: "Tag",
        kind: "text",
        placeholder: "Typography & layout",
      },
      { name: "description", label: "Description", kind: "textarea" },
      {
        name: "images",
        label: "Images",
        kind: "images",
        max: 4,
        hint: "4 images. The third is shown wider.",
      },
    ],
    summary: (i) => String(i.title),
    thumb: (i) => (i.images as Media[])?.[0],
  },
  stats: {
    title: "Numbers",
    note: "“The advantage” section. Use real numbers only.",
    folder: "misc",
    fields: [
      { name: "value", label: "Number", kind: "number", required: true },
      {
        name: "suffix",
        label: "After the number",
        kind: "text",
        placeholder: "+ or %",
      },
      {
        name: "label",
        label: "Label",
        kind: "text",
        required: true,
        placeholder: "Delivered works",
      },
    ],
    summary: (i) => `${i.value}${i.suffix ?? ""} ${i.label}`,
  },
  experience: {
    title: "Experience",
    note: "The experience table on the About page. Real roles and places only.",
    folder: "misc",
    fields: [
      {
        name: "role",
        label: "Role",
        kind: "text",
        required: true,
        placeholder: "Book designer",
      },
      { name: "type", label: "Type", kind: "text", placeholder: "Freelance" },
      {
        name: "place",
        label: "Place",
        kind: "text",
        required: true,
        placeholder: "Studio name",
      },
      { name: "years", label: "Years", kind: "text", placeholder: "('22–'24)" },
    ],
    summary: (i) => `${i.role} — ${i.place} ${i.years ?? ""}`,
  },
};

// قيم فارغة لعنصر جديد
export const emptyValues = (type: ContentType): Record<string, unknown> =>
  Object.fromEntries(
    type.fields.map((f) => [
      f.name,
      f.kind === "checkbox"
        ? false
        : f.kind === "image"
          ? null
          : f.kind === "images"
            ? []
            : f.kind === "select"
              ? f.defaultValue
              : "",
    ]),
  );
