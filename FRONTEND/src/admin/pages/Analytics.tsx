/** @format */
import { useState } from "react";
import { useLoad } from "../useLoad";
import PageHeader from "../PageHeader";
import { BUTTON_GHOST, CARD, LABEL, MONO_SM } from "../ui";

// إحصاءات الزوار: أرقام مجمّعة يوميًا من الخادم (انظر BACKEND/src/controllers/analytics.ts و lib/track.ts).
// لا كوكيز ولا بيانات شخصية: فقط كم زائرًا، وماذا شاهدوا، ومن أين جاؤوا، وعلى أي جهاز.

interface Row {
  key: string;
  count: number;
}
interface Day {
  date: string;
  views: number;
  visits: number;
  visitors: number;
}
interface Totals {
  views: number;
  visits: number;
  visitors: number;
  messages: number;
}
interface Report {
  days: number;
  series: Day[];
  totals: Totals;
  previous: Totals;
  pages: Row[];
  sources: Row[];
  referrers: Row[];
  devices: Row[];
  bookTitles: Record<string, string>;
}

const RANGES = [7, 30, 90, 365];

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/work": "Works",
  "/services": "Services",
  "/about": "About",
  "/process": "Process",
  "/contact": "Contact",
  other: "Other / not found",
};

const SOURCE_NAMES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  "other search": "Other search engines",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  pinterest: "Pinterest",
  behance: "Behance",
  threads: "Threads",
  tiktok: "TikTok",
  "ai assistants": "AI assistants (ChatGPT…)",
  email: "Email",
  whatsapp: "WhatsApp",
  direct: "Direct / WhatsApp / bookmarks",
  "other websites": "Other websites",
};

const DEVICE_NAMES: Record<string, string> = {
  mobile: "Phone",
  desktop: "Computer",
  tablet: "Tablet",
};

const number = new Intl.NumberFormat("en-GB");
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// المقارنة بالمدة السابقة: "+25%" أو "−10%"، أو لا شيء إن لم تكن هناك بيانات سابقة
const change = (now: number, before: number) => {
  if (!before) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return pct === 0 ? "Same as before" : `${pct > 0 ? "↑ +" : "↓ −"}${Math.abs(pct)}%`;
};

// أكثر من 90 يومًا: أعمدة أسبوعية بدل يومية (365 عمودًا رفيعًا جدًا لا تُقرأ).
// التجميع من الأحدث للأقدم: الأسبوع الناقص (إن وُجد) يكون الأقدم، لا الأخير،
// فلا يظهر آخر عمود منخفضًا وكأن الزيارات انهارت
const groupWeeks = (series: Day[]) => {
  const weeks: (Day & { to: string })[] = [];
  for (let end = series.length; end > 0; end -= 7) {
    const chunk = series.slice(Math.max(0, end - 7), end);
    weeks.unshift({
      date: chunk[0].date,
      to: chunk[chunk.length - 1].date,
      views: chunk.reduce((n, d) => n + d.views, 0),
      visits: chunk.reduce((n, d) => n + d.visits, 0),
      visitors: chunk.reduce((n, d) => n + d.visitors, 0),
    });
  }
  return weeks;
};

const Tile = ({
  label,
  value,
  before,
  days,
}: {
  label: string;
  value: number;
  before: number;
  days: number;
}) => {
  const diff = change(value, before);
  return (
    <div className={CARD}>
      <p className={LABEL}>{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-[-0.04em]">
        {number.format(value)}
      </p>
      <p className="mt-1 text-xs text-black/50">
        {diff ? `${diff} vs previous ${days} days` : "No earlier data"}
      </p>
    </div>
  );
};

// الرسم اليومي: عمود لكل يوم (ارتفاعه = الزوار). المرور على عمود يعرض تفاصيله
const VisitorsChart = ({ series }: { series: Day[] }) => {
  const weekly = series.length > 90;
  const bars = weekly
    ? groupWeeks(series)
    : series.map((d) => ({ ...d, to: d.date }));
  const max = Math.max(1, ...bars.map((b) => b.visitors));
  const [active, setActive] = useState<number | null>(null);
  const shown = active !== null ? bars[active] : null;

  return (
    <section className={`${CARD} mt-4`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={LABEL}>Visitors per {weekly ? "week" : "day"}</p>
        <p className="min-h-4 text-xs text-black/60" aria-live="polite">
          {shown
            ? `${shortDate(shown.date)}${weekly ? ` – ${shortDate(shown.to)}` : ""}: ${number.format(shown.visitors)} visitors · ${number.format(shown.visits)} visits · ${number.format(shown.views)} page views`
            : "Hover or tap a bar for details"}
        </p>
      </div>
      <div className="relative mt-6">
        {/* خط القيمة القصوى: مرجع خفيف للارتفاع */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-black/10" />
        <span className="absolute -top-4 right-0 text-[10px] leading-none text-black/40">
          {number.format(max)}
        </span>
        <div
          className="flex h-40 items-end gap-[2px]"
          onMouseLeave={() => setActive(null)}>
          {bars.map((b, i) => (
            <button
              key={b.date}
              type="button"
              aria-label={`${b.date}: ${b.visitors} visitors`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group flex h-full min-w-0 flex-1 cursor-default items-end outline-none">
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${
                  active === i ? "bg-black" : "bg-black/70 group-hover:bg-black"
                }`}
                style={{
                  height: b.visitors ? `${(b.visitors / max) * 100}%` : 0,
                  minHeight: b.visitors ? 2 : 0,
                }}
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-black/20 pt-1 text-[10px] text-black/50">
          <span>{shortDate(bars[0].date)}</span>
          <span>{shortDate(bars[bars.length - 1].to)}</span>
        </div>
      </div>
    </section>
  );
};

// قائمة ترتيب: الاسم والعدد، مع شريط أفقي يوضح النسبة من الأكبر
const RankList = ({
  title,
  rows,
  empty = "Nothing yet",
}: {
  title: string;
  rows: { label: string; count: number; hint?: string }[];
  empty?: string;
}) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className={CARD}>
      <p className={LABEL}>{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-black/40">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm" title={r.hint}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">{r.label}</span>
                <span className="shrink-0 tabular-nums text-black/60">
                  {number.format(r.count)}
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-black/5">
                <div
                  className="h-1 rounded-full bg-black/70"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const Analytics = () => {
  const [days, setDays] = useState(30);
  const { data, error } = useLoad<Report>(`/api/admin/analytics?days=${days}`);

  const header = (
    <PageHeader
      title="Analytics"
      note="Visits to the public site. No cookies and no personal data. Your own visits from a browser where you logged in here are not counted. Days are in UTC.">
      {RANGES.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setDays(n)}
          aria-pressed={days === n}
          className={`${BUTTON_GHOST} ${days === n ? "!border-black !bg-black !text-white" : ""}`}>
          {n === 365 ? "1 year" : `${n} days`}
        </button>
      ))}
    </PageHeader>
  );

  if (error)
    return (
      <>
        {header}
        <p className="text-red-700">{error}</p>
      </>
    );
  if (!data || data.days !== days)
    return (
      <>
        {header}
        <p className={MONO_SM}>Loading…</p>
      </>
    );

  const { totals, previous } = data;
  const books = data.pages
    .filter((p) => p.key.startsWith("/books/"))
    .slice(0, 10)
    .map((p) => {
      const slug = p.key.slice("/books/".length);
      return {
        label: data.bookTitles[slug] ?? `${slug} (deleted or renamed)`,
        count: p.count,
        hint: p.key,
      };
    });
  const pages = data.pages
    .filter((p) => !p.key.startsWith("/books/"))
    .map((p) => ({ label: PAGE_NAMES[p.key] ?? p.key, count: p.count }));

  return (
    <>
      {header}

      {totals.views === 0 && (
        <p className={`${CARD} mb-4 text-sm text-black/60`}>
          No visits recorded in this period yet. Visits are counted from the
          day this feature went live.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          label="Visitors"
          value={totals.visitors}
          before={previous.visitors}
          days={days}
        />
        <Tile
          label="Visits"
          value={totals.visits}
          before={previous.visits}
          days={days}
        />
        <Tile
          label="Page views"
          value={totals.views}
          before={previous.views}
          days={days}
        />
        <Tile
          label="Messages"
          value={totals.messages}
          before={previous.messages}
          days={days}
        />
      </div>
      <p className="mt-2 text-xs text-black/50">
        Visitors: each browser counts once per day, so someone who comes back on
        3 different days counts 3 times. Visits: each time the site is opened.
      </p>

      <VisitorsChart series={data.series} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RankList title="Most viewed books" rows={books} />
        <RankList
          title="Where visitors come from"
          rows={data.sources.map((s) => ({
            label: SOURCE_NAMES[s.key] ?? s.key,
            count: s.count,
          }))}
        />
        <RankList title="Pages" rows={pages} />
        <div className="flex flex-col gap-4">
          <RankList
            title="Devices"
            rows={data.devices.map((d) => ({
              label: DEVICE_NAMES[d.key] ?? d.key,
              count: d.count,
            }))}
          />
          {data.referrers.length > 0 && (
            <RankList
              title="Other websites"
              rows={data.referrers.map((r) => ({
                label: r.key,
                count: r.count,
              }))}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Analytics;
