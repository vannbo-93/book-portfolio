/** @format */

import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../middleware/error.js";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "../middleware/upload.js";
import {
  deleteMedia,
  isOwnMedia,
  uploadBuffer,
  type ResourceType,
} from "../services/media.js";

// المجلدات الفرعية المسموحة داخل Cloudinary (لترتيب الملفات هناك)
const SUBFOLDERS = [
  "books",
  "covers",
  "testimonials",
  "videos",
  "misc",
] as const;

const uploadQuery = z.object({
  folder: z.enum(SUBFOLDERS).default("misc"),
});

// POST /api/uploads?folder=books   (form-data، الحقل: files)
// يرفع ملفًا أو عدة ملفات، ويُرجع بياناتها لتُحفظ لاحقًا مع الكتاب أو الغلاف
export const uploadFiles: RequestHandler = async (req, res) => {
  const { folder } = uploadQuery.parse(req.query);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0)
    throw new AppError(400, "No files uploaded (field name must be 'files')");

  // حد حجم الصور (أصغر من حد الفيديو)
  const tooBig = files.find(
    (f) => IMAGE_TYPES.includes(f.mimetype) && f.size > MAX_IMAGE_BYTES,
  );
  if (tooBig)
    throw new AppError(
      413,
      `Image too large (max 10MB): ${tooBig.originalname}`,
    );

  // رفع متوازٍ: أسرع من ملف تلو الآخر
  const media = await Promise.all(
    files.map((f) =>
      uploadBuffer(
        f.buffer,
        (IMAGE_TYPES.includes(f.mimetype) ? "image" : "video") as ResourceType,
        folder,
      ),
    ),
  );
  res.status(201).json({ media });
};

const deleteBody = z.object({
  publicId: z.string().min(1),
  resourceType: z.enum(["image", "video"]).default("image"),
});

// DELETE /api/uploads   { publicId, resourceType }
// يحذف ملفًا من Cloudinary (مثلًا: صورة رُفعت ثم أُلغيت قبل الحفظ)
export const deleteFile: RequestHandler = async (req, res) => {
  const { publicId, resourceType } = deleteBody.parse(req.body);
  if (!isOwnMedia(publicId))
    throw new AppError(403, "This file does not belong to the site");
  const deleted = await deleteMedia(publicId, resourceType);
  if (!deleted) throw new AppError(404, "File not found");
  res.status(204).end();
};
