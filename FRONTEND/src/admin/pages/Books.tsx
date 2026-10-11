/** @format */
import { useRef, useState } from "react";
import { Link } from "react-router";
import { Reorder } from "motion/react";
import { api } from "../../lib/api";
import { sized } from "../../lib/image";
import { useLoad } from "../useLoad";
import PageHeader from "../PageHeader";
import { BUTTON, MONO_SM, errorText } from "../ui";
import type { AdminBook } from "../types";

// قائمة الكتب: اسحب لتغيير الترتيب في الموقع، واضغط على كتاب لتعديله
const Books = () => {
  const { data, error, setData } = useLoad<{ books: AdminBook[] }>(
    "/api/admin/books",
  );
  const [saveError, setSaveError] = useState("");
  // آخر ترتيب (لحفظه عند إفلات الكتاب المسحوب)
  const latest = useRef<AdminBook[]>([]);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  const books = data.books;

  const reorder = (next: AdminBook[]) => {
    latest.current = next;
    setData({ books: next });
  };
  const saveOrder = async () => {
    if (!latest.current.length) return;
    try {
      setSaveError("");
      await api("/api/admin/books/order", {
        method: "PUT",
        body: JSON.stringify({ ids: latest.current.map((b) => b._id) }),
      });
    } catch (err) {
      setSaveError(errorText(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Books"
        note="Drag a book to change its place on the site. Drafts are only visible here.">
        <Link to="/admin/books/new" className={BUTTON}>
          + New book
        </Link>
      </PageHeader>

      {saveError && (
        <p className={`${MONO_SM} mb-4 text-red-700`}>
          Order not saved: {saveError}
        </p>
      )}

      {books.length === 0 ? (
        <p className="text-sm text-black/60">No books yet.</p>
      ) : (
        <Reorder.Group
          axis="y"
          values={books}
          onReorder={reorder}
          className="flex list-none flex-col gap-2">
          {books.map((book, i) => (
            <Reorder.Item
              key={book._id}
              value={book}
              onDragEnd={saveOrder}
              className="flex cursor-grab items-center gap-4 rounded-[6px] border border-black/10 bg-white p-3 active:cursor-grabbing">
              <span className={`${MONO_SM} w-6 text-black/40`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {book.cover ? (
                <img
                  src={sized(book.cover.url, 160)}
                  alt=""
                  draggable={false}
                  className="h-16 w-11 shrink-0 rounded-[3px] bg-neutral-100 object-cover"
                />
              ) : (
                <span className="h-16 w-11 shrink-0 rounded-[3px] bg-neutral-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{book.title}</p>
                <p className={`${MONO_SM} mt-1 text-black/50`}>
                  {book.year} · {book.spreads.length} spread(s)
                </p>
              </div>
              <span
                className={`${MONO_SM} rounded-full px-2 py-1 ${
                  book.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-black/5 text-black/60"
                }`}>
                {book.status}
              </span>
              <Link
                to={`/admin/books/${book._id}`}
                onPointerDown={(e) => e.stopPropagation()}
                className={`${MONO_SM} underline-offset-[3px] hover:underline`}>
                Edit
              </Link>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </>
  );
};

export default Books;
