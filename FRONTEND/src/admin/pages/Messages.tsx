/** @format */
import { useState } from "react";
import { api } from "../../lib/api";
import { useLoad } from "../useLoad";
import PageHeader from "../PageHeader";
import { BUTTON_GHOST, MONO_SM, errorText } from "../ui";
import type { Message } from "../types";

// صندوق رسائل نموذج التواصل: الأحدث أولًا. فتح الرسالة يعلّمها مقروءة
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});
const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
};

const Messages = () => {
  const { data, error, setData } = useLoad<{
    messages: Message[];
    unread: number;
  }>("/api/admin/messages");
  const [open, setOpen] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  const { messages } = data;
  const update = (next: Message[]) =>
    setData({ messages: next, unread: next.filter((m) => !m.read).length });

  const setRead = async (m: Message, read: boolean) => {
    try {
      setActionError("");
      await api(`/api/admin/messages/${m._id}`, {
        method: "PATCH",
        body: JSON.stringify({ read }),
      });
      update(messages.map((x) => (x._id === m._id ? { ...x, read } : x)));
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const toggle = (m: Message) => {
    setOpen(open === m._id ? null : m._id);
    if (!m.read) setRead(m, true);
  };

  const remove = async (m: Message) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    try {
      setActionError("");
      await api(`/api/admin/messages/${m._id}`, { method: "DELETE" });
      update(messages.filter((x) => x._id !== m._id));
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Messages"
        note={`From the contact form. ${data.unread} unread.`}
      />
      {actionError && (
        <p className={`${MONO_SM} mb-4 text-red-700`}>{actionError}</p>
      )}

      {messages.length === 0 ? (
        <p className="text-sm text-black/60">No messages yet.</p>
      ) : (
        <ul className="flex list-none flex-col gap-2">
          {messages.map((m) => (
            <li
              key={m._id}
              className="rounded-[6px] border border-black/10 bg-white">
              <button
                type="button"
                onClick={() => toggle(m)}
                aria-expanded={open === m._id}
                className="flex w-full cursor-pointer items-center gap-4 p-4 text-left">
                <span
                  className={`size-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-emerald-500"}`}
                  aria-label={m.read ? undefined : "Unread"}
                />
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${m.read ? "" : "font-semibold"}`}>
                  {m.name} — {m.topic || "No topic"}
                </span>
                <span className={`${MONO_SM} shrink-0 text-black/40`}>
                  {formatDate(m.createdAt)}
                </span>
              </button>
              {open === m._id && (
                <div className="border-t border-black/10 p-4">
                  <p className={`${MONO_SM} text-black/50`}>{m.email}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {m.message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic || "Your message"}`)}`}
                      className={BUTTON_GHOST}>
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() => setRead(m, false)}
                      className={BUTTON_GHOST}>
                      Mark unread
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      className={`${BUTTON_GHOST} text-red-700`}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Messages;
