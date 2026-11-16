/** @format */
import { useEffect, useRef } from "react";
import { api } from "../lib/api";
import type { Media } from "./types";

// رفع الملفات: تُرفع إلى Cloudinary فورًا عند اختيارها، ثم تُحفظ مع الكتاب أو العنصر عند الضغط على Save.
export type UploadFolder =
  "books" | "covers" | "testimonials" | "services" | "videos" | "misc";

export const uploadFiles = async (files: File[], folder: UploadFolder) => {
  const body = new FormData();
  files.forEach((f) => body.append("files", f));
  const { media } = await api<{ media: Media[] }>(
    `/api/uploads?folder=${folder}`,
    {
      method: "POST",
      body,
    },
  );
  return media;
};

// ترتيب أسماء الملفات كما يرتبها الإنسان: 2.jpg قبل 10.jpg (لا 10 قبل 2 كترتيب الحروف)
export const byFileName = (a: File, b: File) =>
  a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });

// رفع عدد كبير من الملفات على دفعات صغيرة (الخادم يقبل 20 ملفًا على الأكثر في الطلب الواحد،
// والدفعات الأصغر أسرع وأقل عرضة للانقطاع). ترتيب النتيجة نفس ترتيب الملفات.
// إن فشلت دفعة: يتوقف ويُرجع ما نجح قبلها مع الخطأ، فلا تضيع الصور التي رُفعت
export const uploadInBatches = async (
  files: File[],
  folder: UploadFolder,
  onProgress?: (done: number, total: number) => void,
  batchSize = 8,
) => {
  const media: Media[] = [];
  onProgress?.(0, files.length);
  for (let i = 0; i < files.length; i += batchSize) {
    try {
      media.push(...(await uploadFiles(files.slice(i, i + batchSize), folder)));
    } catch (error) {
      return { media, error };
    }
    onProgress?.(Math.min(i + batchSize, files.length), files.length);
  }
  return { media, error: null };
};

const discard = (m: Media) =>
  api("/api/uploads", {
    method: "DELETE",
    body: JSON.stringify({
      publicId: m.publicId,
      resourceType: m.resourceType ?? "image",
    }),
  }).catch(() => {}); // تنظيف: فشله لا يوقف شيئًا

// كل publicId داخل أي كائن (كتاب، عنصر...)
const idsIn = (value: unknown, found = new Set<string>()): Set<string> => {
  if (Array.isArray(value)) value.forEach((v) => idsIn(v, found));
  else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.publicId === "string") found.add(obj.publicId);
    else Object.values(obj).forEach((v) => idsIn(v, found));
  }
  return found;
};

// يتابع الملفات المرفوعة في نموذج لم يُحفظ بعد:
// - track: بعد كل رفع
// - settle(saved): بعد الحفظ، يحذف من Cloudinary ما رُفع ثم أُزيل قبل الحفظ
// - إن خرج الأدمن من الصفحة دون حفظ: يحذف كل ما رفعه فيها (حتى لا تتراكم ملفات بلا استعمال)
export const usePendingUploads = () => {
  const pending = useRef<Media[]>([]);

  useEffect(
    () => () => {
      pending.current.forEach(discard);
      pending.current = [];
    },
    [],
  );

  return {
    track: (media: Media[]) => {
      pending.current.push(...media);
    },
    settle: (saved: unknown) => {
      const kept = idsIn(saved);
      pending.current.filter((m) => !kept.has(m.publicId)).forEach(discard);
      pending.current = [];
    },
  };
};
export type PendingUploads = ReturnType<typeof usePendingUploads>;
