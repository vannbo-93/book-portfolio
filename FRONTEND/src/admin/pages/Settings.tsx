/** @format */
import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useLoad } from "../useLoad";
import { usePendingUploads } from "../uploads";
import { MediaField } from "../MediaField";
import PageHeader from "../PageHeader";
import {
  BUTTON,
  BUTTON_GHOST,
  CARD,
  INPUT,
  LABEL,
  MONO_SM,
  errorText,
} from "../ui";
import type { Media, SettingsDoc } from "../types";

// إعدادات الموقع: معلومات التواصل، والساعة، وحالة التوفر، والحسابات، والفيديوهات.
// أغلفة الكتاب الدوّار لها صفحتها الخاصة (FanCovers.tsx)

const VIDEOS = [
  {
    key: "reel",
    label: "Home — expanding video",
    hint: "The square that grows to fill the screen (after “The advantage”).",
  },
  {
    key: "stackRight",
    label: "Home — right panel video",
    hint: "Rises first over “What I do”.",
  },
  {
    key: "stackLeft",
    label: "Home — left panel video",
    hint: "Rises second over “What I do”.",
  },
] as const;

const withoutFan = (s: SettingsDoc) => {
  const rest: Partial<SettingsDoc> = { ...s };
  delete rest.fanPages;
  return rest;
};

const SettingsForm = ({ initial }: { initial: SettingsDoc }) => {
  const pending = usePendingUploads();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const set = <K extends keyof SettingsDoc>(key: K, value: SettingsDoc[K]) => {
    setS((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    // الصفوف الفارغة تمامًا تُتجاهل. الصف الناقص (اسم بلا رابط أو العكس) يوقف الحفظ برسالة واضحة
    // بدل أن يُحذف بصمت. الرابط بلا https:// يُكمَّل تلقائيًا (instagram.com/x → https://instagram.com/x)
    const socials = s.socials
      .map((x) => ({ label: x.label.trim(), href: x.href.trim() }))
      .filter((x) => x.label || x.href)
      .map((x) =>
        x.href && !/^https?:\/\//i.test(x.href)
          ? { ...x, href: `https://${x.href}` }
          : x,
      );
    const incomplete = socials.findIndex((x) => !x.label || !x.href);
    if (incomplete !== -1) {
      setMessage({
        ok: false,
        text: `Social account ${incomplete + 1}: fill in both the name (e.g. Instagram) and the link.`,
      });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { settings } = await api<{ settings: SettingsDoc }>(
        "/api/admin/settings",
        {
          method: "PATCH",
          // fanPages لا تُرسل من هنا: صفحتها مستقلة، فلا تكتب هذه الصفحة فوق تعديلاتها
          body: JSON.stringify({
            ...withoutFan(s),
            socials,
          }),
        },
      );
      pending.settle(settings);
      setS(settings);
      setMessage({ ok: true, text: "Saved" });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const text = (
    key:
      | "email"
      | "location"
      | "responseTime"
      | "city"
      | "timezone"
      | "availableText"
      | "busyText"
      | "instagram",
    label: string,
    hint?: string,
  ) => (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <input
        className={INPUT}
        value={s[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
      {hint && <span className="mt-1 block text-xs text-black/50">{hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Settings & videos"
        note="Shown in the navbar, footer and contact page."
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <section className={`${CARD} grid gap-4 sm:grid-cols-2`}>
          {text("email", "Email")}
          {text(
            "responseTime",
            "Response time",
            "e.g. Replies within 48 hours",
          )}
          {text(
            "location",
            "Location line",
            "e.g. Based in — Kenitra, Morocco",
          )}
          {text("city", "City (beside the clock)", "e.g. Kenitra, Morocco")}
          {text(
            "instagram",
            "Instagram username",
            "Shows a “Message me on Instagram” button under the contact form. Without @. Empty = no button.",
          )}
          {text(
            "timezone",
            "Time zone",
            "e.g. Africa/Casablanca, Europe/Paris",
          )}
        </section>

        <section className={CARD}>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={s.available}
              onChange={(e) => set("available", e.target.checked)}
              className="size-4 accent-black"
            />
            <span className="text-sm">
              Available for new projects (green dot)
            </span>
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {text("availableText", "Text when available")}
            {text("busyText", "Text when busy")}
          </div>
        </section>

        <section className={CARD}>
          <span className={LABEL}>Social accounts</span>
          <span className="mt-1 block text-xs text-black/50">
            Name on the left (e.g. Instagram), full profile link on the right.
          </span>
          <div className="mt-3 flex flex-col gap-2">
            {s.socials.map((social, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={`${INPUT} mt-0 max-w-28 shrink-0 sm:max-w-36`}
                  aria-label="Account name"
                  placeholder="Instagram"
                  value={social.label}
                  onChange={(e) =>
                    set(
                      "socials",
                      s.socials.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className={`${INPUT} mt-0 min-w-0 flex-1`}
                  aria-label="Account link"
                  inputMode="url"
                  placeholder="https://instagram.com/…"
                  value={social.href}
                  onChange={(e) =>
                    set(
                      "socials",
                      s.socials.map((x, j) =>
                        j === i ? { ...x, href: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() =>
                    set(
                      "socials",
                      s.socials.filter((_, j) => j !== i),
                    )
                  }
                  className={`${BUTTON_GHOST} shrink-0 px-3`}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              set("socials", [...s.socials, { label: "", href: "" }])
            }
            className={`${BUTTON_GHOST} mt-3`}>
            + Add account
          </button>
        </section>

        <section className={`${CARD} flex flex-col gap-6`}>
          {VIDEOS.map(({ key, label, hint }) => (
            <MediaField
              key={key}
              kind="video"
              label={label}
              hint={`${hint} Muted, looping. Max 100 MB; short and light is better.`}
              value={s.videos[key]}
              onChange={(v: Media | null) =>
                set("videos", { ...s.videos, [key]: v })
              }
              folder="videos"
              pending={pending}
            />
          ))}
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={busy} className={BUTTON}>
            {busy ? "Saving…" : "Save settings"}
          </button>
          {message && (
            <p
              role="status"
              className={`${MONO_SM} ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

const Settings = () => {
  const { data, error } = useLoad<{ settings: SettingsDoc }>(
    "/api/admin/settings",
  );
  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  return <SettingsForm initial={data.settings} />;
};

export default Settings;
