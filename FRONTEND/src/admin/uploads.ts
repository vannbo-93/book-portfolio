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
