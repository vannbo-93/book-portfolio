/** @format */

import type { RequestHandler } from "express";
import { z } from "zod";
import { DailyStat, decodeKey, encodeKey } from "../models/DailyStat.js";
import { Message } from "../models/Message.js";
import { Book } from "../models/Book.js";
import { env } from "../config/env.js";
import { deviceOf, isBot, sourceOf } from "../lib/visitor.js";

// ===== تسجيل زيارة (للزوار) =====
// الواجهة ترسل عند فتح كل صفحة: { p: المسار, v: أول زيارة اليوم؟, s: بداية جلسة؟, r: الموقع السابق, u: utm_source }
// يصل كنص (navigator.sendBeacon) لا JSON: طلب "بسيط" بلا طلب تمهيدي (preflight)، فلا يبطئ الموقع.

// الصفحات المعروفة فقط (أي مسار آخر = "other"): لا يستطيع أحد ملء الإحصاءات بمسارات عشوائية
const PAGE = /^\/(work|services|process|about|contact|books\/[a-z0-9-]{1,80})?$/;

const trackSchema = z.object({
  p: z.string().max(200),
  v: z.boolean().optional(),
  s: z.boolean().optional(),
  r: z.string().max(300).optional(),
  u: z.string().max(60).optional(),
});

// أسماء موقعنا: الانتقال داخله ليس "مصدرًا"
const ownHosts = env.CLIENT_URL.map((url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}).filter(Boolean);

const hostOf = (ref = "") => {
  try {
    const host = new URL(ref).hostname;
    return /^[a-z0-9.-]{1,80}$/i.test(host) ? host : "";
  } catch {
    return "";
  }
};

const today = () => new Date().toISOString().slice(0, 10);

// POST /api/track: يرد دائمًا 204 (حتى عند تجاهل الطلب): الزائر لا يتأثر بأي خطأ هنا
export const track: RequestHandler = async (req, res) => {
  res.status(204).end();
  const ua = String(req.get("user-agent") ?? "");
  if (isBot(ua)) return;
  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return;
  }
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return;
  const { p, v, s, r, u } = parsed.data;

  const path = p.split(/[?#]/)[0].replace(/(.)\/+$/, "$1").toLowerCase();
  const inc: Record<string, number> = { views: 1, [`pages.${encodeKey(PAGE.test(path) ? path : "other")}`]: 1 };
  if (v) {
    inc.visitors = 1;
    inc[`devices.${deviceOf(ua)}`] = 1;
  }
  if (s) {
    inc.visits = 1;
    const { source, referrer } = sourceOf(ua, hostOf(r), u ?? "", ownHosts);
    inc[`sources.${encodeKey(source)}`] = 1;
    if (referrer) inc[`referrers.${encodeKey(referrer)}`] = 1;
  }

  const day = today();
  try {
    await DailyStat.updateOne(
      { _id: day },
      { $inc: inc, $setOnInsert: { date: new Date(`${day}T00:00:00Z`) } },
      { upsert: true },
    );
  } catch (err) {
    console.error("✗ analytics:", err instanceof Error ? err.message : err);
  }
};

// ===== التقرير (للأدمن) =====

const reportQuery = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) });

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

type Doc = {
  _id: string;
  views?: number;
  visits?: number;
  visitors?: number;
  pages?: Record<string, number>;
  sources?: Record<string, number>;
  referrers?: Record<string, number>;
  devices?: Record<string, number>;
};

const sumMaps = (docs: Doc[], field: "pages" | "sources" | "referrers" | "devices", top = 20) => {
  const total = new Map<string, number>();
  for (const d of docs)
    for (const [k, n] of Object.entries(d[field] ?? {})) total.set(decodeKey(k), (total.get(decodeKey(k)) ?? 0) + n);
  return [...total].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count).slice(0, top);
};

const totals = (docs: Doc[]) => ({
  views: docs.reduce((n, d) => n + (d.views ?? 0), 0),
  visits: docs.reduce((n, d) => n + (d.visits ?? 0), 0),
  visitors: docs.reduce((n, d) => n + (d.visitors ?? 0), 0),
});

// GET /api/admin/analytics?days=30: آخر N يومًا (اليوم منها)، ومقارنتها بالـ N يومًا التي قبلها
export const report: RequestHandler = async (req, res) => {
  const { days } = reportQuery.parse(req.query);
  const end = new Date(`${today()}T00:00:00Z`);
  const start = addDays(end, -(days - 1));
  const prevStart = addDays(start, -days);
  const between = (a: Date, b: Date) => ({ _id: { $gte: dayKey(a), $lte: dayKey(b) } });

  const [current, previous, messages, prevMessages, books] = await Promise.all([
    DailyStat.find(between(start, end)).lean<Doc[]>(),
    DailyStat.find(between(prevStart, addDays(start, -1))).lean<Doc[]>(),
    Message.countDocuments({ createdAt: { $gte: start } }),
    Message.countDocuments({ createdAt: { $gte: prevStart, $lt: start } }),
    Book.find().select("slug title -_id").lean<{ slug: string; title: string }[]>(),
  ]);

  // كل الأيام في المدة، حتى التي بلا زيارات (صفر)، ليكون الرسم البياني متصلًا
  const byDay = new Map(current.map((d) => [d._id, d]));
  const series = Array.from({ length: days }, (_, i) => {
    const date = dayKey(addDays(start, i));
    const d = byDay.get(date);
    return { date, views: d?.views ?? 0, visits: d?.visits ?? 0, visitors: d?.visitors ?? 0 };
  });

  res.json({
    days,
    series,
    totals: { ...totals(current), messages },
    previous: { ...totals(previous), messages: prevMessages },
    pages: sumMaps(current, "pages", 100),
    sources: sumMaps(current, "sources"),
    referrers: sumMaps(current, "referrers", 10),
    devices: sumMaps(current, "devices"),
    bookTitles: Object.fromEntries(books.map((b) => [b.slug, b.title])),
  });
};
