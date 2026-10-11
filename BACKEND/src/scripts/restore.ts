import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { BACKUP_COLLECTIONS, BACKUP_VERSION } from "../lib/backup.js";

// استعادة نسخة احتياطية (الملف الذي نزّلته من لوحة التحكم ← Account ← Download backup):
//   npm run restore -- site-backup-2026-10-11.json --yes
// ⚠ يستبدل كل المحتوى الحالي بمحتوى الملف (الكتب، الأقسام، الإعدادات، الرسائل).
// حساب الأدمن لا يتأثر. بدون --yes يعرض ما سيحدث فقط ولا يغيّر شيئًا.

const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
const confirmed = process.argv.includes("--yes");
if (!file) {
  console.error("Usage: npm run restore -- <backup.json> --yes");
  process.exit(1);
}

const backup = JSON.parse(readFileSync(file, "utf8")) as {
  version?: number;
  exportedAt?: string;
  data?: Record<string, unknown[]>;
};
if (backup.version !== BACKUP_VERSION || !backup.data) {
  console.error("✗ This file is not a site backup");
  process.exit(1);
}

console.log(`Backup from ${backup.exportedAt}:`);
for (const name of Object.keys(BACKUP_COLLECTIONS)) console.log(`  ${name}: ${backup.data[name]?.length ?? 0}`);
if (!confirmed) {
  console.log("\nNothing changed. Add --yes to replace the current content with this backup.");
  process.exit(0);
}

await connectDB();
for (const [name, model] of Object.entries(BACKUP_COLLECTIONS)) {
  const docs = backup.data[name] ?? [];
  await model.deleteMany({});
  // نفس المعرّفات والتواريخ كما في النسخة (بلا فحص Mongoose: البيانات خرجت من القاعدة نفسها)
  if (docs.length) await model.collection.insertMany(docs.map(revive) as never[]);
  console.log(`✓ ${name}: restored ${docs.length}`);
}
await mongoose.disconnect();

// JSON يحوّل المعرّفات والتواريخ إلى نصوص: نعيدها إلى أنواعها
function revive(doc: unknown): unknown {
  const d = { ...(doc as Record<string, unknown>) };
  if (typeof d._id === "string") d._id = new mongoose.Types.ObjectId(d._id);
  for (const k of ["createdAt", "updatedAt"]) if (typeof d[k] === "string") d[k] = new Date(d[k] as string);
  return d;
}
