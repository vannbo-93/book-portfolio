/** @format */

import type { RequestHandler } from "express";
import { z } from "zod";
import { Message } from "../models/Message.js";
import { AppError } from "../middleware/error.js";
import { notifyNewMessage } from "../services/mail.js";

const sendSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Invalid email").max(200),
  topic: z.string().trim().max(150).default(""),
  message: z.string().trim().min(5, "Message is too short").max(5000),
  // فخ للبرامج الآلية (honeypot): حقل مخفي في النموذج، الإنسان لا يراه فيتركه فارغًا
  website: z.string().optional(),
});

// POST /api/contact (للزوار)
export const send: RequestHandler = async (req, res) => {
  const { website, ...data } = sendSchema.parse(req.body);
  // برنامج آلي ملأ الحقل المخفي: نوهمه بالنجاح ولا نحفظ شيئًا
  if (website) {
    res.status(201).json({ ok: true });
    return;
  }
  await Message.create(data);
  // البريد يُرسل في الخلفية: الزائر لا ينتظره
  void notifyNewMessage(data);
  res.status(201).json({ ok: true });
};

const listQuery = z.object({
  status: z.enum(["all", "unread"]).default("all"),
});

// GET /api/admin/messages?status=unread: الأحدث أولًا، مع عدد غير المقروءة
export const list: RequestHandler = async (req, res) => {
  const { status } = listQuery.parse(req.query);
  const [messages, unread] = await Promise.all([
    Message.find(status === "unread" ? { read: false } : {})
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(),
    Message.countDocuments({ read: false }),
  ]);
  res.json({ messages, unread });
};

// PATCH /api/admin/messages/:id   { read: true|false }
export const markRead: RequestHandler = async (req, res) => {
  const { read } = z.object({ read: z.boolean() }).parse(req.body);
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read },
    { returnDocument: "after" },
  ).lean();
  if (!message) throw new AppError(404, "Message not found");
  res.json({ message });
};

// DELETE /api/admin/messages/:id
export const remove: RequestHandler = async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id).lean();
  if (!message) throw new AppError(404, "Message not found");
  res.status(204).end();
};
