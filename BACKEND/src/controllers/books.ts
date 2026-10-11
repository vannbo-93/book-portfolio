/** @format */
import type { RequestHandler } from "express";
import { z } from "zod";
import { Book, BOOK_STATUSES } from "../models/Book.js";
import { AppError } from "../middleware/error.js";
import { SLUG_PATTERN, slugify } from "../lib/slug.js";
import { deleteMediaMany, isOwnMedia } from "../services/media.js";

// ===== فحص البيانات المرسلة من لوحة التحكم =====

// صورة: يجب أن تكون مرفوعة عبر /api/uploads (داخل مجلد الموقع على Cloudinary)
const imageInput = z.object({
  url: z.url(),
  publicId: z
    .string()
    .min(1)
    .refine(isOwnMedia, "Image must be uploaded through /api/uploads"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().trim().max(300).default(""),
});

const bookFields = {
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, "Slug: lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1, "Title is required").max(200),
  year: z.number().int().min(1900).max(2100),
  // فقرة واحدة (نص) أو عدة فقرات (مصفوفة): تُحفظ دائمًا كمصفوفة، والفقرات الفارغة تُحذف
  description: z
    .union([z.string(), z.array(z.string())])
    .transform((v) =>
      (Array.isArray(v) ? v : v.split(/\n\s*\n/))
        .map((p) => p.trim())
        .filter(Boolean),
    ),
  client: z.string().trim().max(200),
  services: z.string().trim().max(200),
  location: z.string().trim().max(200),
  cover: imageInput.nullable(),
  spreads: z.array(imageInput).max(60),
  status: z.enum(BOOK_STATUSES),
};

const createSchema = z.object({
  ...bookFields,
  slug: bookFields.slug.optional(),
  description: bookFields.description.default([]),
  client: bookFields.client.default(""),
  services: bookFields.services.default(""),
  location: bookFields.location.default(""),
  cover: bookFields.cover.default(null),
  spreads: bookFields.spreads.default([]),
  status: bookFields.status.default("draft"),
});

// التعديل: كل الحقول اختيارية (يُرسل ما تغيّر فقط)
const updateSchema = z.object(bookFields).partial();

const orderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")).min(1),
});

// الكتاب المنشور يحتاج غلافًا: الزائر لا يجب أن يرى كتابًا بلا صورة
const assertPublishable = (book: { status: string; cover?: unknown }) => {
  if (book.status === "published" && !book.cover)
    throw new AppError(400, "A published book needs a cover image");
};

// كل صور الكتاب (لمعرفة ما حُذف منها)
const imageIds = (book: {
  cover?: { publicId: string } | null;
  spreads?: { publicId: string }[];
}) => [
  ...(book.cover ? [book.cover.publicId] : []),
  ...(book.spreads ?? []).map((s) => s.publicId),
];

// ===== للزوار =====

// GET /api/books: الكتب المنشورة بالترتيب
export const listPublished: RequestHandler = async (_req, res) => {
  const books = await Book.find({ status: "published" })
    .sort({ order: 1, year: -1 })
    .select("-status -__v")
    .lean();
  res.json({ books });
};

// GET /api/books/:slug: كتاب منشور واحد (المسودة = غير موجود)
export const getPublished: RequestHandler = async (req, res) => {
  const book = await Book.findOne({
    slug: req.params.slug,
    status: "published",
  })
    .select("-status -__v")
    .lean();
  if (!book) throw new AppError(404, "Book not found");
  res.json({ book });
};

// ===== للأدمن =====

// GET /api/admin/books: كل الكتب مع المسودات
export const listAll: RequestHandler = async (_req, res) => {
  const books = await Book.find().sort({ order: 1, year: -1 }).lean();
  res.json({ books });
};

// GET /api/admin/books/:id
export const getOne: RequestHandler = async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) throw new AppError(404, "Book not found");
  res.json({ book });
};

// POST /api/admin/books
export const create: RequestHandler = async (req, res) => {
  const data = createSchema.parse(req.body);
  const slug = data.slug ?? slugify(data.title);
  if (!slug)
    throw new AppError(
      400,
      "Could not build a slug from the title, please provide one",
    );
  assertPublishable(data);
  // الكتاب الجديد يظهر في آخر القائمة
  const last = await Book.findOne().sort({ order: -1 }).select("order").lean();
  const book = await Book.create({
    ...data,
    slug,
    order: (last?.order ?? -1) + 1,
  });
  res.status(201).json({ book });
};

// PATCH /api/admin/books/:id
export const update: RequestHandler = async (req, res) => {
  const data = updateSchema.parse(req.body);
  const book = await Book.findById(req.params.id);
  if (!book) throw new AppError(404, "Book not found");

  const before = imageIds(book);
  book.set(data);
  assertPublishable(book);
  await book.save();

  // الصور التي أُزيلت من الكتاب تُحذف من Cloudinary (بعد نجاح الحفظ فقط)
  const after = new Set(imageIds(book));
  await deleteMediaMany(before.filter((id) => !after.has(id)));
  res.json({ book });
};

// DELETE /api/admin/books/:id: يحذف الكتاب وكل صوره
export const remove: RequestHandler = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw new AppError(404, "Book not found");
  await deleteMediaMany(imageIds(book));
  res.status(204).end();
};

// PUT /api/admin/books/order   { ids: [id1, id2, ...] }: الترتيب الجديد كما سُحب في لوحة التحكم
export const reorder: RequestHandler = async (req, res) => {
  const { ids } = orderSchema.parse(req.body);
  if (new Set(ids).size !== ids.length)
    throw new AppError(400, "Duplicate ids");
  const result = await Book.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: id }, update: { order } },
    })),
  );
  if (result.matchedCount !== ids.length)
    throw new AppError(400, "Some books were not found");
  res.json({ ok: true });
};
