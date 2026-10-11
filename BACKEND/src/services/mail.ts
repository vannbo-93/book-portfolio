/** @format */

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// إرسال إشعار بريدي للمصمم. اختياري: إن لم تُضبط قيم SMTP في .env لا يُرسل شيء
const enabled = Boolean(
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.NOTIFY_EMAIL,
);

const transporter = enabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

if (!enabled)
  console.log("ℹ Email notifications are off (SMTP settings missing in .env)");

interface NewMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

// لا يوقف الطلب أبدًا: الرسالة محفوظة في قاعدة البيانات حتى لو فشل البريد
export const notifyNewMessage = async (m: NewMessage) => {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"Portfolio" <${env.SMTP_USER}>`,
      to: env.NOTIFY_EMAIL,
      replyTo: `"${m.name.replace(/"/g, "")}" <${m.email}>`, // "رد" في البريد يذهب للزائر مباشرة
      subject: `New message: ${m.topic || "Inquiry"} — ${m.name}`,
      text: `${m.message}\n\n— ${m.name}\n${m.email}\nTopic: ${m.topic}`,
    });
  } catch (err) {
    console.error("✗ Notification email failed:", (err as Error).message);
  }
};
