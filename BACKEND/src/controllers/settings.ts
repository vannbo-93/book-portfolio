import type { RequestHandler } from "express";
import { z } from "zod";
import { Settings } from "../models/Settings.js";
import { mediaInput } from "../lib/mediaInput.js";
import { deleteRemovedMedia } from "../services/media.js";

// المستند الوحيد للإعدادات: يُنشأ بالقيم الافتراضية أول مرة يُطلب فيها
const getSettings = async () => (await Settings.findOne()) ?? (await Settings.create({}));

// المنطقة الزمنية يجب أن يعرفها المتصفح، وإلا تتعطل الساعة في الناف بار
const isTimezone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const video = mediaInput("video").nullable();

// كل الحقول اختيارية: يُرسل ما تغيّر فقط
const updateSchema = z
  .object({
    email: z.union([z.email(), z.literal("")]),
    location: z.string().trim().max(150),
    responseTime: z.string().trim().max(100),
    city: z.string().trim().max(100),
    timezone: z.string().trim().refine(isTimezone, "Unknown timezone (example: Africa/Casablanca)"),
    available: z.boolean(),
    availableText: z.string().trim().max(100),
    busyText: z.string().trim().max(100),
    socials: z.array(z.object({ label: z.string().trim().min(1).max(40), href: z.url() })).max(12),
    videos: z.object({ reel: video, stackLeft: video, stackRight: video }).partial(),
    fanPages: z.array(mediaInput("image")).max(12, "The 3D book takes 12 covers at most"),
  })
  .partial()
  .strict();

const toPublic = (s: Awaited<ReturnType<typeof getSettings>>) => {
  const { _id, __v, createdAt, updatedAt, ...rest } = s.toObject();
  return rest;
};

// GET /api/settings (للزوار) و GET /api/admin/settings
export const getPublic: RequestHandler = async (_req, res) => {
  res.json({ settings: toPublic(await getSettings()) });
};

// PATCH /api/admin/settings
export const update: RequestHandler = async (req, res) => {
  const { videos, ...data } = updateSchema.parse(req.body);
  const settings = await getSettings();
  const before = settings.toObject();
  settings.set(data);
  // الفيديوهات: يُغيَّر المرسل منها فقط
  for (const [key, value] of Object.entries(videos ?? {})) settings.set(`videos.${key}`, value);
  await settings.save();
  await deleteRemovedMedia(before, settings.toObject());
  res.json({ settings: toPublic(settings) });
};
