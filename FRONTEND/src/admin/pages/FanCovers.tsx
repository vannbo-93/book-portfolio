/** @format */
import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { useLoad } from "../useLoad";
import { usePendingUploads } from "../uploads";
import { MediaListField } from "../MediaField";
import PageHeader from "../PageHeader";
import { BUTTON, CARD, MONO_SM, errorText } from "../ui";
import type { Media, SettingsDoc } from "../types";

// أغلفة الكتاب الدوّار في أول الرئيسية (/admin/fan): حتى 12 غلافًا يختارها المصمم،
// مستقلة عن الكتب وعن الأغلفة الحصرية. تُحفظ في الإعدادات (fanPages) لكن لها صفحتها الخاصة.
// فارغة = يأخذ الكتاب أغلفة الكتب المنشورة.

const MAX = 12;

const FanForm = ({ initial }: { initial: Media[] }) => {
  const pending = usePendingUploads();
  const [pages, setPages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      // يُرسل هذا الحقل وحده: بقية الإعدادات لا تتغير
      const { settings } = await api<{ settings: SettingsDoc }>(
        "/api/admin/settings",
        { method: "PATCH", body: JSON.stringify({ fanPages: pages }) },
      );
      pending.settle(settings);
      setPages(settings.fanPages ?? []);
      setMessage({ ok: true, text: "Saved" });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title="3D book (home)"
        note="The spinning book at the top of the home page."
      />
      <div className="flex max-w-3xl flex-col gap-6">
        <section className={CARD}>
          <MediaListField
            label="Covers"
            hint={`Upload the covers you want in the book (up to ${MAX}), then drag to reorder. Fewer than ${MAX} are repeated to fill the book. Empty = the published books' covers are used.`}
            value={pages}
            onChange={(v) => {
              setPages(v);
              setMessage(null);
            }}
            folder="covers"
            pending={pending}
            max={MAX}
          />
        </section>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={busy} className={BUTTON}>
            {busy ? "Saving…" : "Save"}
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

const FanCovers = () => {
  const { data, error } = useLoad<{ settings: SettingsDoc }>(
    "/api/admin/settings",
  );
  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  return <FanForm initial={data.settings.fanPages ?? []} />;
};

export default FanCovers;
