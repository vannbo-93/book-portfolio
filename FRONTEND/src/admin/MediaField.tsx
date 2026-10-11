/** @format */
import { useRef, useState, type ChangeEvent } from "react";
import { Reorder } from "motion/react";
import { sized } from "../lib/image";
import { uploadFiles, type PendingUploads, type UploadFolder } from "./uploads";
import { BUTTON_GHOST, INPUT, LABEL, MONO_SM, errorText } from "./ui";
import type { Media } from "./types";

// حقول الصور والفيديو في لوحة التحكم: اختيار ملف ← يُرفع فورًا ← معاينة، مع وصف الصورة (alt).

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

interface UploadButtonProps {
  label: string;
  folder: UploadFolder;
  kind: "image" | "video";
  multiple?: boolean;
  pending: PendingUploads;
  onUploaded: (media: Media[]) => void;
}

const UploadButton = ({
  label,
  folder,
  kind,
  multiple,
  pending,
  onUploaded,
}: UploadButtonProps) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // حتى يمكن اختيار نفس الملف مرة أخرى
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const media = await uploadFiles(files, folder);
      pending.track(media);
      onUploaded(media.map((m) => ({ ...m, alt: "" })));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        hidden
        multiple={multiple}
        accept={kind === "image" ? IMAGE_ACCEPT : VIDEO_ACCEPT}
        onChange={onChange}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className={BUTTON_GHOST}>
        {busy ? "Uploading…" : label}
      </button>
      {error && <p className={`${MONO_SM} mt-2 text-red-700`}>{error}</p>}
    </div>
  );
};

const Preview = ({ media, className }: { media: Media; className: string }) =>
  media.resourceType === "video" ? (
    <video src={media.url} muted playsInline controls className={className} />
  ) : (
    <img src={sized(media.url, 400)} alt="" className={className} />
  );

// ملف واحد (غلاف، صورة عميل، فيديو)
interface MediaFieldProps {
  label: string;
  value: Media | null;
  onChange: (value: Media | null) => void;
  folder: UploadFolder;
  pending: PendingUploads;
  kind?: "image" | "video";
  hint?: string;
}

export const MediaField = ({
  label,
  value,
  onChange,
  folder,
  pending,
  kind = "image",
  hint,
}: MediaFieldProps) => (
  <div>
    <span className={LABEL}>{label}</span>
    {hint && <p className="mt-1 text-xs text-black/50">{hint}</p>}
    <div className="mt-3 flex flex-wrap items-start gap-4">
      {value && (
        <Preview
          media={value}
          className="h-40 w-auto max-w-[16rem] rounded-[4px] border border-black/10 bg-neutral-100 object-contain"
        />
      )}
      <div className="flex flex-col gap-3">
        <UploadButton
          label={
            value
              ? "Replace"
              : kind === "image"
                ? "Upload image"
                : "Upload video"
          }
          folder={folder}
          kind={kind}
          pending={pending}
          onUploaded={([m]) => onChange(m)}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={BUTTON_GHOST}>
            Remove
          </button>
        )}
      </div>
    </div>
    {value && kind === "image" && (
      <label className="mt-3 block max-w-md">
        <span className={LABEL}>Image description (alt)</span>
        <input
          className={INPUT}
          value={value.alt ?? ""}
          placeholder="What the image shows, for screen readers and search engines"
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      </label>
    )}
  </div>
);

// عدة صور بترتيب يُسحب (الصفحات المزدوجة، صور الخدمة)
interface MediaListFieldProps {
  label: string;
  value: Media[];
  onChange: (value: Media[]) => void;
  folder: UploadFolder;
  pending: PendingUploads;
  max?: number;
  hint?: string;
}

export const MediaListField = ({
  label,
  value,
  onChange,
  folder,
  pending,
  max,
  hint,
}: MediaListFieldProps) => {
  const full = max !== undefined && value.length >= max;
  return (
    <div>
      <span className={LABEL}>
        {label} {max !== undefined && `(${value.length}/${max})`}
      </span>
      {hint && <p className="mt-1 text-xs text-black/50">{hint}</p>}
      {value.length > 0 && (
        <Reorder.Group
          axis="y"
          values={value}
          onReorder={onChange}
          className="mt-3 flex list-none flex-col gap-2">
          {value.map((m, i) => (
            <Reorder.Item
              key={m.publicId}
              value={m}
              className="flex cursor-grab items-center gap-4 rounded-[4px] border border-black/10 bg-white p-2 active:cursor-grabbing">
              <span
                className={`${MONO_SM} w-6 text-black/40`}
                aria-hidden="true">
                ⋮⋮
              </span>
              <img
                src={sized(m.url, 300)}
                alt=""
                draggable={false}
                className="h-16 w-24 shrink-0 rounded-[3px] bg-neutral-100 object-cover"
              />
              <input
                className={`${INPUT} mt-0`}
                value={m.alt ?? ""}
                placeholder={`Description of image ${i + 1} (alt)`}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) =>
                  onChange(
                    value.map((x) =>
                      x === m ? { ...x, alt: e.target.value } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label={`Remove image ${i + 1}`}
                onClick={() => onChange(value.filter((x) => x !== m))}
                className={`${BUTTON_GHOST} shrink-0 px-3`}>
                ✕
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
      <div className="mt-3">
        {!full && (
          <UploadButton
            label="Add images"
            folder={folder}
            kind="image"
            multiple
            pending={pending}
            onUploaded={(media) =>
              onChange([...value, ...media].slice(0, max ?? Infinity))
            }
          />
        )}
      </div>
    </div>
  );
};
