import { env } from "../config/env.js";
import { buildBackup } from "../lib/backup.js";
import { SystemState } from "../models/SystemState.js";
import { transporter } from "./mail.js";

// ===== نسخة احتياطية تلقائية بالبريد =====
// Atlas المجاني لا يأخذ نسخًا احتياطية، ولن يتذكر أحد الضغط على زر التنزيل كل شهر.
// لذلك يرسل الخادم ملف النسخة (نفس ملف Download backup) إلى بريد المصممة كل BACKUP_EVERY_DAYS يومًا.
//
// كيف يعمل دون أن يتأثر بإعادة تشغيل الخادم (كل نشر جديد يعيد تشغيله):
// تاريخ آخر إرسال محفوظ في قاعدة البيانات، والخادم يفحص كل 6 ساعات: إن مرت المدة، يرسل.
// أول تشغيل بعد إضافة الميزة يرسل نسخة مباشرة (لا يوجد تاريخ سابق).

const STATE_ID = "autoBackup";
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const FIRST_CHECK_MS = 2 * 60 * 1000; // دقيقتان بعد التشغيل: يترك الخادم يستقر أولًا
const DAY_MS = 24 * 60 * 60 * 1000;
// حد أمان للمرفق (Gmail يقبل حتى 25MB). أكبر من هذا: البريد يطلب التنزيل اليدوي
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

const recipient = () => env.BACKUP_EMAIL || env.NOTIFY_EMAIL || "";

export const autoBackupStatus = async () => {
  const state = await SystemState.findById(STATE_ID).lean();
  const lastAt = state?.at ?? null;
  const enabled = Boolean(transporter && recipient() && env.BACKUP_EVERY_DAYS > 0);
  return {
    enabled,
    everyDays: env.BACKUP_EVERY_DAYS,
    to: recipient(),
    lastAt,
    nextAt: enabled && lastAt ? new Date(new Date(lastAt).getTime() + env.BACKUP_EVERY_DAYS * DAY_MS) : null,
    lastError: state?.error || "",
  };
};

// يرسل النسخة الآن. يرمي خطأ إن فشل (المسار اليدوي يعرضه للأدمن)
export const sendBackupEmail = async () => {
  const to = recipient();
  if (!transporter || !to) throw new Error("Email is not set up on the server (SMTP settings or BACKUP_EMAIL / NOTIFY_EMAIL)");

  const backup = await buildBackup();
  const json = JSON.stringify(backup);
  const bytes = Buffer.byteLength(json);
  const date = backup.exportedAt.slice(0, 10);
  const counts = Object.entries(backup.data)
    .map(([name, docs]) => `${name}: ${(docs as unknown[]).length}`)
    .join(", ");
  const tooBig = bytes > MAX_ATTACHMENT_BYTES;

  try {
    await transporter.sendMail({
      from: `"Portfolio" <${env.SMTP_USER}>`,
      to,
      subject: `Website backup — ${date}`,
      text: [
        tooBig
          ? `This month's backup is too large to attach (${(bytes / 1024 / 1024).toFixed(1)} MB). Please download it from the dashboard: Account → Download backup.`
          : `Attached: a full backup of the website content (${Math.max(1, Math.round(bytes / 1024))} KB).`,
        "",
        `Contents — ${counts}.`,
        "Images are not inside the file: they stay on Cloudinary, and the file keeps their links.",
        "",
        "Keep this email. To restore the site from it, the developer runs:",
        `npm run restore -- site-backup-${date}.json --yes`,
        "",
        `Next automatic backup in ${env.BACKUP_EVERY_DAYS} days.`,
      ].join("\n"),
      attachments: tooBig ? [] : [{ filename: `site-backup-${date}.json`, content: json, contentType: "application/json" }],
    });
    await SystemState.findByIdAndUpdate(STATE_ID, { at: new Date(), error: "" }, { upsert: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await SystemState.findByIdAndUpdate(STATE_ID, { error }, { upsert: true }).catch(() => {});
    throw err;
  }
  return { to, bytes, attached: !tooBig };
};

const checkAndSend = async () => {
  try {
    const status = await autoBackupStatus();
    if (!status.enabled) return;
    const due = !status.lastAt || Date.now() - new Date(status.lastAt).getTime() >= status.everyDays * DAY_MS;
    if (!due) return;
    const r = await sendBackupEmail();
    console.log(`✓ Automatic backup emailed to ${r.to} (${Math.max(1, Math.round(r.bytes / 1024))} KB)`);
  } catch (err) {
    // يُعاد المحاولة في الفحص التالي (بعد 6 ساعات)
    console.error("✗ Automatic backup failed:", err instanceof Error ? err.message : err);
  }
};

export const startAutoBackup = () => {
  if (env.BACKUP_EVERY_DAYS === 0) return console.log("ℹ Automatic backups are off (BACKUP_EVERY_DAYS=0)");
  if (!transporter || !recipient()) return console.log("ℹ Automatic backups are off (email is not set up)");
  setTimeout(checkAndSend, FIRST_CHECK_MS).unref();
  setInterval(checkAndSend, CHECK_EVERY_MS).unref();
  console.log(`✓ Automatic backup by email every ${env.BACKUP_EVERY_DAYS} days → ${recipient()}`);
};
