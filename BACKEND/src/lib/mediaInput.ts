/** @format */

import { z } from "zod";
import { isOwnMedia } from "../services/media.js";

// فحص ملف مرسل من لوحة التحكم: يجب أن يكون مرفوعًا عبر /api/uploads (داخل مجلد الموقع)
export const mediaInput = (resourceType: "image" | "video" = "image") =>
  z.object({
    url: z.url(),
    publicId: z
      .string()
      .min(1)
      .refine(isOwnMedia, "File must be uploaded through /api/uploads"),
    resourceType: z.literal(resourceType).default(resourceType),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().trim().max(300).default(""),
  });
