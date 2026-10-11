/** @format */
import { useState, type FormEvent } from "react";
import { api, API_URL } from "../../lib/api";
import { useAuth } from "../auth";
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

// الحساب: تغيير كلمة المرور، والخروج
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
        <p className="text-sm text-black/60">
          One file with all books, sections, settings and messages. Download one
          every month and after big changes, and keep it somewhere safe (Google
          Drive, email). Images stay on Cloudinary.
        </p>
        <a href={`${API_URL}/api/admin/backup`} className={BUTTON_GHOST}>
          Download backup
        </a>
      </section>
    </>
  );
};

export default Account;
