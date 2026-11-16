import type { RequestHandler } from "express";
import { buildBackup } from "../lib/backup.js";
import { autoBackupStatus, sendBackupEmail } from "../services/autoBackup.js";

// GET /api/admin/backup: ملف JSON بكل محتوى الموقع، يُنزَّل من لوحة التحكم
export const download: RequestHandler = async (_req, res) => {
  const backup = await buildBackup();
  const date = backup.exportedAt.slice(0, 10);
  res.setHeader("Content-Disposition", `attachment; filename="site-backup-${date}.json"`);
  res.json(backup);
};

// GET /api/admin/backup/status: حالة النسخة التلقائية بالبريد (لصفحة Account)
export const status: RequestHandler = async (_req, res) => {
  res.json(await autoBackupStatus());
};

// POST /api/admin/backup/email: إرسال نسخة بالبريد الآن (يُحسب كآخر نسخة تلقائية)
export const emailNow: RequestHandler = async (_req, res) => {
  await sendBackupEmail();
  res.json(await autoBackupStatus());
};
