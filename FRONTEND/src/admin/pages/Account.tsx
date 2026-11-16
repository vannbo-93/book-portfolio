/** @format */
import { useState, type FormEvent } from "react";
import { api, API_URL } from "../../lib/api";
import { useAuth } from "../auth";
import { useLoad } from "../useLoad";
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

// الحساب: تغيير كلمة المرور، والخروج، والنسخ الاحتياطي (تنزيل يدوي + حالة النسخة التلقائية بالبريد)

interface BackupStatus {
  enabled: boolean;
  everyDays: number;
  to: string;
  lastAt: string | null;
  nextAt: string | null;
  lastError: string;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

// النسخة التلقائية بالبريد: متى أُرسلت آخر نسخة، ومتى التالية، وزر "أرسل الآن" للتجربة
const AutoBackup = () => {
  const { data, error, setData } = useLoad<BackupStatus>(
    "/api/admin/backup/status",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const sendNow = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const status = await api<BackupStatus>("/api/admin/backup/email", {
        method: "POST",
      });
      setData(status);
      setMessage({ ok: true, text: `Backup sent to ${status.to}` });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  if (!data.enabled)
    return (
      <p className="text-sm text-black/60">
        Automatic email backups are off: the server has no email settings. Use
        the download button below.
      </p>
    );

  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="text-black/60">
        A copy is emailed automatically every {data.everyDays} days to{" "}
        <span className="text-black">{data.to}</span>. Keep those emails.
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-black/50">Last sent</dt>
        <dd>{formatDate(data.lastAt)}</dd>
        <dt className="text-black/50">Next</dt>
        <dd>{data.lastAt ? formatDate(data.nextAt) : "Within a few hours"}</dd>
      </dl>
      {data.lastError && (
        <p className="text-red-700">Last attempt failed: {data.lastError}</p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={sendNow}
        className={`${BUTTON_GHOST} self-start`}>
        {busy ? "Sending…" : "Email a backup now"}
      </button>
      {message && (
        <p
          role="status"
          className={`${MONO_SM} ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

const Account = () => {
  const { admin, logout } = useAuth();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;
    if (data.newPassword !== data.repeat) {
      setMessage({ ok: false, text: "The new passwords do not match" });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await api("/api/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      form.reset();
      setMessage({ ok: true, text: "Password changed" });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" note={`Signed in as ${admin.email}`}>
        <button type="button" onClick={logout} className={BUTTON_GHOST}>
          Log out
        </button>
      </PageHeader>

      <form
        onSubmit={submit}
        className={`${CARD} flex max-w-md flex-col gap-4`}>
        <p className={MONO_SM}>Change password</p>
        <label className="block">
          <span className={LABEL}>Current password</span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>New password (10+ characters)</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Repeat new password</span>
          <input
            name="repeat"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className={INPUT}
          />
        </label>
        {message && (
          <p
            role="status"
            className={`${MONO_SM} ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={busy} className={BUTTON}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>

      <section className={`${CARD} mt-6 flex max-w-md flex-col gap-3`}>
        <p className={MONO_SM}>Backup</p>
        <AutoBackup />
        <p className="mt-2 border-t border-black/10 pt-3 text-sm text-black/60">
          One file with all books, sections, settings and messages. Download one
          after big changes too, and keep it somewhere safe. Images stay on
          Cloudinary.
        </p>
        <a href={`${API_URL}/api/admin/backup`} className={BUTTON_GHOST}>
          Download backup
        </a>
      </section>
    </>
  );
};

export default Account;
