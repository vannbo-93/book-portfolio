/** @format */
import { useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { Reorder } from "motion/react";
import { api } from "../../lib/api";
import { sized } from "../../lib/image";
import { useLoad } from "../useLoad";
import { usePendingUploads } from "../uploads";
import { MediaField, MediaListField } from "../MediaField";
import PageHeader from "../PageHeader";
import {
  CONTENT_TYPES,
  emptyValues,
  type ContentType,
  type Field,
} from "../contentTypes";
import {
  BUTTON,
  BUTTON_GHOST,
  CARD,
  INPUT,
  LABEL,
  MONO_SM,
  errorText,
} from "../ui";
import type { ContentItem, Media } from "../types";

// صفحة واحدة لكل أنواع المحتوى (/admin/content/:type): القائمة، والترتيب بالسحب، والإخفاء، والتعديل.

// ===== نموذج عنصر (جديد أو موجود) =====
interface EditorProps {
  typeKey: string;
  type: ContentType;
  item?: ContentItem;
  onSaved: (item: ContentItem) => void;
  onCancel: () => void;
}

const ItemEditor = ({
  typeKey,
  type,
  item,
  onSaved,
  onCancel,
}: EditorProps) => {
  const pending = usePendingUploads();
  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...emptyValues(type),
    ...(item
      ? Object.fromEntries(
          type.fields.map((f) => [
            f.name,
            item[f.name] ?? emptyValues(type)[f.name],
          ]),
        )
      : {}),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (name: string, value: unknown) =>
    setValues((v) => ({ ...v, [name]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // الأرقام تُرسل أرقامًا
    const body = Object.fromEntries(
      type.fields.map((f) => [
        f.name,
        f.kind === "number" ? Number(values[f.name]) : values[f.name],
      ]),
    );
    try {
      const { item: saved } = await api<{ item: ContentItem }>(
        item
          ? `/api/admin/content/${typeKey}/${item._id}`
          : `/api/admin/content/${typeKey}`,
        { method: item ? "PATCH" : "POST", body: JSON.stringify(body) },
      );
      pending.settle(saved);
      onSaved(saved);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const input = (f: Field) => {
    const value = values[f.name];
    switch (f.kind) {
      case "image":
        return (
          <MediaField
            key={f.name}
            label={f.label}
            hint={f.hint}
            value={(value as Media | null) ?? null}
            onChange={(v) => set(f.name, v)}
            folder={type.folder}
            pending={pending}
          />
        );
      case "images":
        return (
          <MediaListField
            key={f.name}
            label={f.label}
            hint={f.hint}
            value={(value as Media[]) ?? []}
            onChange={(v) => set(f.name, v)}
            folder={type.folder}
            pending={pending}
            max={f.max}
          />
        );
      case "checkbox":
        return (
          <label key={f.name} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => set(f.name, e.target.checked)}
              className="size-4 accent-black"
            />
            <span className="text-sm">{f.label}</span>
          </label>
        );
      case "select":
        return (
          <label key={f.name} className="block">
            <span className={LABEL}>{f.label}</span>
            <select
              className={INPUT}
              value={String(value)}
              onChange={(e) => set(f.name, e.target.value)}>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {f.hint && (
              <span className="mt-1 block text-xs text-black/50">{f.hint}</span>
            )}
          </label>
        );
      default:
        return (
          <label key={f.name} className="block">
            <span className={LABEL}>
              {f.label}
              {"required" in f && f.required && " *"}
            </span>
            {f.kind === "textarea" ? (
              <textarea
                rows={4}
                className={`${INPUT} resize-y`}
                value={String(value ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
              />
            ) : (
              <input
                type={f.kind === "number" ? "number" : "text"}
                className={INPUT}
                placeholder={"placeholder" in f ? f.placeholder : undefined}
                value={String(value ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
            {f.hint && (
              <span className="mt-1 block text-xs text-black/50">{f.hint}</span>
            )}
          </label>
        );
    }
  };

  return (
    <form
      onSubmit={save}
      className={`${CARD} mb-6 flex flex-col gap-5 border-black`}>
      <p className={MONO_SM}>{item ? "Edit" : "New"}</p>
      {type.fields.map(input)}
      {error && (
        <p role="alert" className={`${MONO_SM} text-red-700`}>
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={BUTTON}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className={BUTTON_GHOST}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ===== القائمة =====
const List = ({ typeKey, type }: { typeKey: string; type: ContentType }) => {
  const { data, error, setData } = useLoad<{ items: ContentItem[] }>(
    `/api/admin/content/${typeKey}`,
  );
  // ما يُعدَّل الآن: معرّف عنصر، أو "new"، أو لا شيء
  const [editing, setEditing] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const latest = useRef<ContentItem[]>([]);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!data) return <p className={MONO_SM}>Loading…</p>;
  const items = data.items;
  const replace = (next: ContentItem[]) => setData({ items: next });

  const run = async (action: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(errorText(err));
    }
  };

  const saveOrder = () =>
    run(() =>
      api(`/api/admin/content/${typeKey}/order`, {
        method: "PUT",
        body: JSON.stringify({ ids: latest.current.map((i) => i._id) }),
      }),
    );

  const toggleVisible = (item: ContentItem) =>
    run(async () => {
      const { item: saved } = await api<{ item: ContentItem }>(
        `/api/admin/content/${typeKey}/${item._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ visible: !item.visible }),
        },
      );
      replace(items.map((i) => (i._id === saved._id ? saved : i)));
    });

  const remove = (item: ContentItem) =>
    confirm(`Delete “${type.summary(item)}”? This cannot be undone.`) &&
    run(async () => {
      await api(`/api/admin/content/${typeKey}/${item._id}`, {
        method: "DELETE",
      });
      replace(items.filter((i) => i._id !== item._id));
    });

  const onSaved = (saved: ContentItem) => {
    const exists = items.some((i) => i._id === saved._id);
    replace(
      exists
        ? items.map((i) => (i._id === saved._id ? saved : i))
        : [...items, saved],
    );
    setEditing(null);
  };

  return (
    <>
      <PageHeader title={type.title} note={type.note}>
        {editing !== "new" && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className={BUTTON}>
            + Add
          </button>
        )}
      </PageHeader>

      {actionError && (
        <p className={`${MONO_SM} mb-4 text-red-700`}>{actionError}</p>
      )}

      {editing === "new" && (
        <ItemEditor
          typeKey={typeKey}
          type={type}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      {items.length === 0 && editing !== "new" ? (
        <p className="text-sm text-black/60">Nothing here yet.</p>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={(next) => {
            latest.current = next;
            replace(next);
          }}
          className="flex list-none flex-col gap-2">
          {items.map((item) =>
            editing === item._id ? (
              <li key={item._id}>
                <ItemEditor
                  typeKey={typeKey}
                  type={type}
                  item={item}
                  onSaved={onSaved}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <Reorder.Item
                key={item._id}
                value={item}
                onDragEnd={saveOrder}
                className={`flex cursor-grab items-center gap-4 rounded-[6px] border border-black/10 bg-white p-3 active:cursor-grabbing ${
                  item.visible ? "" : "opacity-50"
                }`}>
                <span className={`${MONO_SM} text-black/40`} aria-hidden="true">
                  ⋮⋮
                </span>
                {type.thumb &&
                  (type.thumb(item) ? (
                    <img
                      src={sized(type.thumb(item)!.url, 160)}
                      alt=""
                      draggable={false}
                      className="h-12 w-12 shrink-0 rounded-[3px] bg-neutral-100 object-cover"
                    />
                  ) : (
                    <span className="h-12 w-12 shrink-0 rounded-[3px] bg-neutral-100" />
                  ))}
                <p className="min-w-0 flex-1 truncate text-sm">
                  {type.summary(item)}
                </p>
                <div
                  className="flex shrink-0 gap-3"
                  onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleVisible(item)}
                    className={`${MONO_SM} cursor-pointer text-black/60 hover:text-black`}>
                    {item.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(item._id)}
                    className={`${MONO_SM} cursor-pointer hover:underline`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className={`${MONO_SM} cursor-pointer text-red-700 hover:underline`}>
                    Delete
                  </button>
                </div>
              </Reorder.Item>
            ),
          )}
        </Reorder.Group>
      )}
    </>
  );
};

const ContentList = () => {
  const { type = "" } = useParams();
  const config = CONTENT_TYPES[type];
  if (!config) return <p>Unknown section.</p>;
  // key: صفحة جديدة لكل نوع (حتى لا تختلط بياناتها عند الانتقال بين الأقسام)
  return <List key={type} typeKey={type} type={config} />;
};

export default ContentList;
