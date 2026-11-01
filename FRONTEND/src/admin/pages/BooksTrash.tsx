/** @format */
import { useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import { sized } from "../../lib/image";
import { useLoad } from "../useLoad";
import PageHeader from "../PageHeader";
import { BUTTON, BUTTON_DANGER, BUTTON_GHOST, MONO_SM, errorText } from "../ui";
import type { AdminBook } from "../types";

// سلة الكتب (/admin/books/trash): الكتب المحذوفة من صفحة التعديل تنتقل إلى هنا بدل أن تختفي.
// مخفية عن الزوار، وصورها باقية على Cloudinary.
// Restore: يعيد الكتاب بحالته السابقة (منشور أو مسودة) في آخر قائمة الكتب.
// Delete forever: يحذفه نهائيًا مع كل صوره (لا رجعة فيه).

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const BooksTrash = () => {
  const { data, error, setData } = useLoad<{ books: AdminBook[] }>(
    "/api/admin/books/trash",
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  const books = data.books;
  const drop = (id: string) =>
    setData({ books: books.filter((b) => b._id !== id) });

  const restore = async (book: AdminBook) => {
    setBusy(book._id);
    setMessage(null);
    try {
      await api(`/api/admin/books/${book._id}/restore`, { method: "POST" });
      drop(book._id);
      setMessage({
        ok: true,
        text: `“${book.title}” restored${book.status === "published" ? " and back on the site" : " as a draft"}.`,
      });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  const removeForever = async (book: AdminBook) => {
    if (
      !confirm(
        `Delete "${book.title}" and all its images forever? This cannot be undone.`,
      )
    )
      return;
    setBusy(book._id);
    setMessage(null);
    try {
      await api(`/api/admin/books/${book._id}/permanent`, {
        method: "DELETE",
      });
      drop(book._id);
      setMessage({ ok: true, text: `“${book.title}” deleted forever.` });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Trash"
        note="Deleted books stay here, hidden from the site, until you restore them or delete them forever.">
        <Link to="/admin/books" className={BUTTON_GHOST}>
          ← All books
        </Link>
      </PageHeader>

      {message && (
        <p
          role="status"
          className={`${MONO_SM} mb-4 ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
          {message.text}
        </p>
      )}

      {books.length === 0 ? (
        <p className="text-sm text-black/60">The trash is empty.</p>
      ) : (
        <ul className="flex list-none flex-col gap-2">
          {books.map((book) => (
            <li
              key={book._id}
              className="flex flex-wrap items-center gap-4 rounded-[6px] border border-black/10 bg-white p-3">
              {book.cover ? (
                <img
                  src={sized(book.cover.url, 160)}
                  alt=""
                  className="h-16 w-11 shrink-0 rounded-[3px] bg-neutral-100 object-cover opacity-60 grayscale"
                />
              ) : (
                <span className="h-16 w-11 shrink-0 rounded-[3px] bg-neutral-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{book.title}</p>
                <p className={`${MONO_SM} mt-1 text-black/50`}>
                  Deleted {formatDate(book.deletedAt)} · was {book.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy === book._id}
                  onClick={() => restore(book)}
                  className={BUTTON}>
                  Restore
                </button>
                <button
                  type="button"
                  disabled={busy === book._id}
                  onClick={() => removeForever(book)}
                  className={BUTTON_DANGER}>
                  Delete forever
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default BooksTrash;
