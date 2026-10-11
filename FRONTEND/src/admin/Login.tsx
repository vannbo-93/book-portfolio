/** @format */
import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { BRAND } from "../data/site";
import type { AdminUser } from "./auth";
import { BUTTON, INPUT, LABEL, MONO_SM, errorText } from "./ui";

// صفحة الدخول إلى لوحة التحكم
const Login = ({ onLogin }: { onLogin: (admin: AdminUser) => void }) => {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      const { admin } = await api<{ admin: AdminUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onLogin(admin);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[6px] border border-black/10 bg-white p-8">
        <p className="font-sans text-2xl font-medium tracking-[-0.04em]">
          {BRAND}
        </p>
        <p className={`${MONO_SM} mt-1 text-black/50`}>Dashboard</p>

        <label className="mt-8 block">
          <span className={LABEL}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className={INPUT}
          />
        </label>
        <label className="mt-4 block">
          <span className={LABEL}>Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={INPUT}
          />
        </label>

        {error && (
          <p role="alert" className={`${MONO_SM} mt-4 text-red-700`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`${BUTTON} mt-6 w-full`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
};

export default Login;
