import type { Model } from "mongoose";
import { Book } from "../models/Book.js";
import { Settings } from "../models/Settings.js";
import { Message } from "../models/Message.js";
import { CONTENT } from "../content/registry.js";

// كل ما يُحفظ في النسخة الاحتياطية: المحتوى والإعدادات والرسائل.
// حساب الأدمن لا يُحفظ (فيه بصمة كلمة المرور)، والصور تبقى في Cloudinary (النسخة تحفظ روابطها).
export const BACKUP_COLLECTIONS: Record<string, Model<any>> = {
  books: Book,
  settings: Settings,
  messages: Message,
  ...Object.fromEntries(Object.entries(CONTENT).map(([name, type]) => [name, type.model])),
};

export const BACKUP_VERSION = 1;

// النسخة الاحتياطية كاملة (نفس الملف الذي يُنزَّل من لوحة التحكم ويُرسل بالبريد)
export const buildBackup = async () => {
  const entries = await Promise.all(
    Object.entries(BACKUP_COLLECTIONS).map(async ([name, model]) => [name, await model.find().lean()]),
  );
  return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: Object.fromEntries(entries) };
};
