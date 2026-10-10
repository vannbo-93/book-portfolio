/** @format */

import multer from "multer";
import { AppError } from "./error.js";

// استقبال الملفات المرفوعة من لوحة التحكم.
// تبقى في الذاكرة لحظيًا ثم تُرسل مباشرة إلى Cloudinary (لا شيء يُحفظ على قرص الخادم،
// لأن أغلب الاستضافات تمسح القرص عند كل إعادة تشغيل)

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// حدود الخطة المجانية في Cloudinary: الصورة 10MB، الفيديو 100MB
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_FILES = 20;

export const upload = multer({
  storage: multer.memoryStorage(),
  // الحد العام هو حد الفيديو، وحد الصورة يُفحص بعد الاستقبال (multer لا يعرف النوع مسبقًا)
  limits: { fileSize: MAX_VIDEO_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (
      IMAGE_TYPES.includes(file.mimetype) ||
      VIDEO_TYPES.includes(file.mimetype)
    )
      return cb(null, true);
    cb(
      new AppError(
        400,
        `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WebP, AVIF, MP4, WebM, MOV`,
      ),
    );
  },
});
