/** @format */

import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../middleware/error.js";
import {
  CONTENT,
  CONTENT_TYPES,
  createSchema,
  updateSchema,
} from "../content/registry.js";
import { deleteRemovedMedia } from "../services/media.js";

// مسارات عامة لكل أنواع المحتوى (covers, testimonials, faqs, services, stats, experience)
// النوع يأتي من الرابط: /api/admin/content/faqs

const getType = (name: string | string[] | undefined) => {
  const type = typeof name === "string" ? CONTENT[name] : undefined;
  if (!type)
    throw new AppError(
      404,
      `Unknown content type. Available: ${CONTENT_TYPES.join(", ")}`,
    );
  return type;
};

const SORT = { order: 1, createdAt: 1 } as const;
const HIDDEN = "-__v -createdAt -updatedAt -visible -consent";

// ===== للزوار =====

// GET /api/content: كل المحتوى الظاهر في طلب واحد (الواجهة تحتاجه كله تقريبًا في الصفحة الرئيسية)
export const getAllPublic: RequestHandler = async (_req, res) => {
  const entries = await Promise.all(
    CONTENT_TYPES.map(async (name) => {
      const { model, publicFilter } = CONTENT[name];
      return [
        name,
        await model
          .find({ visible: true, ...publicFilter })
          .sort(SORT)
          .select(HIDDEN)
          .lean(),
      ];
    }),
  );
  res.json(Object.fromEntries(entries));
};

// GET /api/content/:type
export const listPublic: RequestHandler = async (req, res) => {
  const { model, publicFilter } = getType(req.params.type);
  const items = await model
    .find({ visible: true, ...publicFilter })
    .sort(SORT)
    .select(HIDDEN)
    .lean();
  res.json({ items });
};

// ===== للأدمن =====

// GET /api/admin/content/:type: كل العناصر مع المخفية
export const listAll: RequestHandler = async (req, res) => {
  const { model } = getType(req.params.type);
  res.json({ items: await model.find().sort(SORT).lean() });
};

// POST /api/admin/content/:type
export const create: RequestHandler = async (req, res) => {
  const type = getType(req.params.type);
  const data = createSchema(type).parse(req.body);
  // العنصر الجديد في آخر القائمة (إن لم يُحدد ترتيبه)
  const order =
    data.order ??
    ((
      await type.model
        .findOne()
        .sort({ order: -1 })
        .select("order")
        .lean<{ order?: number }>()
    )?.order ?? -1) + 1;
  const item = await type.model.create({ ...data, order });
  res.status(201).json({ item });
};

// PATCH /api/admin/content/:type/:id
export const update: RequestHandler = async (req, res) => {
  const type = getType(req.params.type);
  const data = updateSchema(type).parse(req.body);
  const item = await type.model.findById(req.params.id);
  if (!item) throw new AppError(404, "Item not found");
  const before = item.toObject();
  item.set(data);
  await item.save();
  // الصور التي استُبدلت أو أُزيلت تُحذف من Cloudinary (بعد نجاح الحفظ فقط)
  await deleteRemovedMedia(before, item.toObject());
  res.json({ item });
};

// DELETE /api/admin/content/:type/:id: يحذف العنصر وصوره
export const remove: RequestHandler = async (req, res) => {
  const { model } = getType(req.params.type);
  const item = await model.findByIdAndDelete(req.params.id).lean();
  if (!item) throw new AppError(404, "Item not found");
  await deleteRemovedMedia(item);
  res.status(204).end();
};

const orderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")).min(1),
});

// PUT /api/admin/content/:type/order   { ids: [...] }: الترتيب الجديد كما سُحب في لوحة التحكم
export const reorder: RequestHandler = async (req, res) => {
  const { model } = getType(req.params.type);
  const { ids } = orderSchema.parse(req.body);
  if (new Set(ids).size !== ids.length)
    throw new AppError(400, "Duplicate ids");
  const result = await model.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: id }, update: { order } },
    })),
  );
  if (result.matchedCount !== ids.length)
    throw new AppError(400, "Some items were not found");
  res.json({ ok: true });
};
