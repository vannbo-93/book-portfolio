/** @format */
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { api } from "../../lib/api";
import { FORMATS, type FormatKey } from "../../data/formats";
import { useLoad } from "../useLoad";
import { usePendingUploads } from "../uploads";
import { MediaField, MediaListField } from "../MediaField";
import PageHeader from "../PageHeader";
import {
  BUTTON,
  BUTTON_DANGER,
  BUTTON_GHOST,
  CARD,
  INPUT,
  LABEL,
  MONO_SM,
  errorText,
} from "../ui";
import type { AdminBook, Media } from "../types";

// إنشاء كتاب أو تعديله: /admin/books/new أو /admin/books/:id

interface Form {
  title: string;
  slug: string;
  year: string;
  format: FormatKey;
  // الفقرات مفصولة بسطر فارغ
  description: string;
  client: string;
  services: string;
  location: string;
  cover: Media | null;
  spreads: Media[];
  status: "draft" | "published";
}

const toForm = (b?: AdminBook): Form => ({
  title: b?.title ?? "",
  slug: b?.slug ?? "",
  year: String(b?.year ?? new Date().getFullYear()),
  format: b?.format ?? "standard",
  description: (b?.description ?? []).join("\n\n"),
  client: b?.client ?? "",
  services: b?.services ?? "",
  location: b?.location ?? "",
  cover: b?.cover ?? null,
  spreads: b?.spreads ?? [],
  status: b?.status ?? "draft",
});

const BookForm = ({ book }: { book?: AdminBook }) => {
  const navigate = useNavigate();
  // بعد إنشاء كتاب ننتقل إلى صفحته: نحمل معنا رسالة "Saved"
  const justCreated = (useLocation().state as { created?: boolean } | null)
    ?.created;
  const pending = usePendingUploads();
  const [form, setForm] = useState<Form>(() => toForm(book));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    justCreated ? { ok: true, text: "Saved" } : null,
  );
  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const body = {
      ...form,
      year: Number(form.year),
      // slug فارغ عند الإنشاء: الخادم يصنعه من العنوان
      slug: form.slug.trim() || undefined,
    };
    try {
      const { book: saved } = await api<{ book: AdminBook }>(
        book ? `/api/admin/books/${book._id}` : "/api/admin/books",
        { method: book ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      pending.settle(saved);
      setForm(toForm(saved));
      setMessage({ ok: true, text: "Saved" });
      if (!book)
        navigate(`/admin/books/${saved._id}`, {
          replace: true,
          state: { created: true },
        });
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (
      !book ||
      !confirm(
        `Delete "${book.title}" and all its images? This cannot be undone.`,
      )
    )
      return;
    try {
      await api(`/api/admin/books/${book._id}`, { method: "DELETE" });
      navigate("/admin/books");
    } catch (err) {
      setMessage({ ok: false, text: errorText(err) });
    }
  };

  const text = (
    key: "title" | "slug" | "client" | "services" | "location",
    label: string,
    hint?: string,
  ) => (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <input
        className={INPUT}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {hint && <span className="mt-1 block text-xs text-black/50">{hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save}>
      <PageHeader title={book ? book.title : "New book"}>
        <Link to="/admin/books" className={BUTTON_GHOST}>
          ← All books
        </Link>
        {book?.status === "published" && (
          <a
            href={`/books/${book.slug}`}
            target="_blank"
            rel="noreferrer"
            className={BUTTON_GHOST}>
            View ↗
          </a>
        )}
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <section className={`${CARD} grid gap-4 sm:grid-cols-2`}>
            {text("title", "Title")}
            {text(
              "slug",
              "Link (slug)",
              book
                ? `/books/${form.slug || "…"}`
                : "Leave empty to build it from the title",
            )}
            <label className="block">
              <span className={LABEL}>Year</span>
              <input
                type="number"
                className={INPUT}
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              />
            </label>
            <label className="block">
              <span className={LABEL}>Book format</span>
              <select
                className={INPUT}
                value={form.format}
                onChange={(e) => set("format", e.target.value as FormatKey)}>
                {Object.entries(FORMATS).map(([key, f]) => (
                  <option key={key} value={key}>
                    {f.label} ({f.w} × {f.h} in)
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-black/50">
                Sets the cover shape in “Latest works”.
              </span>
            </label>
            {text("client", "Client")}
            {text("services", "Services")}
            {text("location", "Location")}
          </section>

          <section className={CARD}>
            <label className="block">
              <span className={LABEL}>About the project</span>
              <textarea
                rows={6}
                className={`${INPUT} resize-y`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <span className="mt-1 block text-xs text-black/50">
                Leave an empty line between paragraphs.
              </span>
            </label>
          </section>

          <section className={CARD}>
            <MediaListField
              label="Spreads"
              hint="Double pages, shown large on the book page. Drag to reorder."
              value={form.spreads}
              onChange={(v) => set("spreads", v)}
              folder="books"
              pending={pending}
              max={60}
            />
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className={CARD}>
            <span className={LABEL}>Status</span>
            <div className="mt-3 flex gap-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={form.status === s ? BUTTON : BUTTON_GHOST}>
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-black/50">
              Drafts are hidden from visitors. Publishing needs a cover.
            </p>
          </section>

          <section className={CARD}>
            <MediaField
              label="Cover"
              value={form.cover}
              onChange={(v) => set("cover", v)}
              folder="books"
              pending={pending}
            />
          </section>

          <section className={`${CARD} flex flex-col gap-3`}>
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
            {book && (
              <button type="button" onClick={remove} className={BUTTON_DANGER}>
                Delete book
              </button>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
};

// تحميل الكتاب (إن لم يكن جديدًا) ثم النموذج
const ExistingBook = ({ id }: { id: string }) => {
  const { data, error } = useLoad<{ book: AdminBook }>(
    `/api/admin/books/${id}`,
  );
  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  return <BookForm key={data.book._id} book={data.book} />;
};

const BookEditor = () => {
  const { id = "new" } = useParams();
  return id === "new" ? <BookForm /> : <ExistingBook key={id} id={id} />;
};

export default BookEditor;
