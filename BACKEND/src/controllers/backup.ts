import type { RequestHandler } from "express";
import { BACKUP_COLLECTIONS, BACKUP_VERSION } from "../lib/backup.js";

// GET /api/admin/backup: ملف JSON بكل محتوى الموقع، يُنزَّل من لوحة التحكم
export const download: RequestHandler = async (_req, res) => {
  const entries = await Promise.all(
    Object.entries(BACKUP_COLLECTIONS).map(async ([name, model]) => [name, await model.find().lean()]),
  );
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Disposition", `attachment; filename="site-backup-${date}.json"`);
  res.json({ version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: Object.fromEntries(entries) });
};
