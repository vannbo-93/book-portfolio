/** @format */

import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";

export type ResourceType = "image" | "video";

// ما نحفظه عن كل ملف في قاعدة البيانات (داخل الكتاب، الغلاف، الشهادة...)
export interface Media {
  url: string; // رابط https للعرض في الموقع
  publicId: string; // معرّف الملف في Cloudinary: نحتاجه لحذفه
  resourceType: ResourceType;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// رفع ملف من الذاكرة إلى Cloudinary
export const uploadBuffer = (
  buffer: Buffer,
  resourceType: ResourceType,
  subfolder?: string,
) =>
  new Promise<Media>((resolve, reject) => {
    const folder = subfolder
      ? `${env.CLOUDINARY_FOLDER}/${subfolder}`
      : env.CLOUDINARY_FOLDER;
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result?: UploadApiResponse) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });

// هل الملف داخل مجلد الموقع؟ (حماية: لا نحذف أي ملف آخر في حساب Cloudinary)
export const isOwnMedia = (publicId: string) =>
  publicId.startsWith(`${env.CLOUDINARY_FOLDER}/`);

// حذف ملف من Cloudinary. يُرجع true إن حُذف، false إن لم يكن موجودًا
export const deleteMedia = async (
  publicId: string,
  resourceType: ResourceType,
) => {
  const res = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return res.result === "ok";
};

// حذف عدة ملفات دون إيقاف الطلب إن فشل أحدها (يُسجل الخطأ فقط):
// الكتاب حُذف أو عُدّل في قاعدة البيانات، وفشل تنظيف Cloudinary لا يجب أن يلغي ذلك
export const deleteMediaMany = async (
  publicIds: string[],
  resourceType: ResourceType = "image",
) => {
  const ids = publicIds.filter(isOwnMedia);
  const results = await Promise.allSettled(
    ids.map((id) => deleteMedia(id, resourceType)),
  );
  results.forEach((r, i) => {
    if (r.status === "rejected")
      console.error(`✗ Cloudinary delete failed: ${ids[i]}`, r.reason);
  });
};

// كل الملفات داخل أي كائن (كتاب، شهادة، إعدادات...): يبحث عن كل حقل publicId أينما كان
export interface MediaRef {
  publicId: string;
  resourceType: ResourceType;
}
export const collectMedia = (
  value: unknown,
  found: MediaRef[] = [],
): MediaRef[] => {
  if (Array.isArray(value)) value.forEach((v) => collectMedia(v, found));
  else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.publicId === "string") {
      found.push({
        publicId: obj.publicId,
        resourceType: obj.resourceType === "video" ? "video" : "image",
      });
    } else Object.values(obj).forEach((v) => collectMedia(v, found));
  }
  return found;
};

// يحذف من Cloudinary الملفات التي كانت في before ولم تعد في after (بعد تعديل أو حذف)
export const deleteRemovedMedia = async (
  before: unknown,
  after: unknown = null,
) => {
  const kept = new Set(collectMedia(after).map((m) => m.publicId));
  const removed = collectMedia(before).filter((m) => !kept.has(m.publicId));
  await Promise.all(
    (["image", "video"] as const).map((type) =>
      deleteMediaMany(
        removed.filter((m) => m.resourceType === type).map((m) => m.publicId),
        type,
      ),
    ),
  );
};
