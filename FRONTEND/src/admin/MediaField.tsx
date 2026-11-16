/** @format */
import { useRef, useState, type ChangeEvent } from "react";
import { Reorder } from "motion/react";
import { sized } from "../lib/image";
import {
  byFileName,
  uploadInBatches,
  type PendingUploads,
  type UploadFolder,
} from "./uploads";
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
  // أقصى عدد يمكن إضافته الآن (مثلًا 60 ناقص الموجود): الزائد لا يُرفع أصلًا
  limit?: number;
  disabled?: boolean;
  pending: PendingUploads;
  onUploaded: (media: Media[]) => void;
}

const UploadButton = ({
  label,
  folder,
  kind,
  multiple,
  limit,
  disabled,
  pending,
  onUploaded,
}: UploadButtonProps) => {
  const input = useRef<HTMLInputElement>(null);
  // التقدم أثناء الرفع: [تم، المجموع]، أو null = لا رفع الآن
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // يمكن اختيار مجلد كامل (Ctrl+A في نافذة الاختيار): يُرتَّب حسب الأسماء ويُرفع على دفعات
  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []).sort(byFileName);
    e.target.value = ""; // حتى يمكن اختيار نفس الملف مرة أخرى
    if (!chosen.length) return;
    const files = limit !== undefined ? chosen.slice(0, limit) : chosen;
    setError("");
    setNotice(
      files.length < chosen.length
        ? `Only the first ${files.length} of ${chosen.length} were added (limit reached).`
        : "",
    );
    if (!files.length) return;
    const { media, error } = await uploadInBatches(
      files,
      folder,
      (done, total) => setProgress([done, total]),
    );
    setProgress(null);
    if (media.length) {
      pending.track(media);
      onUploaded(media.map((m) => ({ ...m, alt: "" })));
    }
    if (error)
      setError(
        `${errorText(error)}${media.length ? ` — ${media.length} of ${files.length} uploaded, try the rest again` : ""}`,
      );
  };
  const busy = progress !== null;

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
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
        className={BUTTON_GHOST}>
        {progress
          ? progress[1] > 1
            ? `Uploading ${progress[0]} / ${progress[1]}…`
            : "Uploading…"
          : label}
      </button>
      {notice && <p className="mt-2 text-xs text-amber-700">{notice}</p>}
      {error && <p className={`${MONO_SM} mt-2 text-red-700`}>{error}</p>}
    </div>
  );
};

// تحذيرات تحت الصورة المرفوعة: صغيرة فستبدو ضبابية، أو بألوان الطباعة (CMYK).
// لا تمنع الحفظ: القرار للمصممة (أحيانًا لا توجد نسخة أكبر من صورة قديمة)
const imageWarnings = (m: Media, minWidth?: number) => {
  if (m.resourceType === "video") return [];
  const out: string[] = [];
  if (minWidth && m.width < minWidth)
    out.push(
      `Only ${m.width}px wide: may look blurry on the site. Upload at least ${minWidth}px wide.`,
    );
  if (m.cmyk)
    out.push(
      "CMYK (print colors): colors may look dull or wrong online. Export it as RGB (sRGB) and upload again.",
    );
  return out;
};

const Warnings = ({ media, minWidth }: { media: Media; minWidth?: number }) => {
  const list = imageWarnings(media, minWidth);
  if (!list.length) return null;
  return (
    <ul className="mt-2 flex list-none flex-col gap-1">
      {list.map((w) => (
        <li key={w} className="text-xs text-amber-700">
          ⚠ {w}
        </li>
      ))}
    </ul>
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
  // أقل عرض مقبول (بكسل) قبل أن يظهر تحذير "قد تبدو ضبابية"
  minWidth?: number;
}

export const MediaField = ({
  label,
  value,
  onChange,
  folder,
  pending,
  kind = "image",
  hint,
  minWidth,
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
    {value && <Warnings media={value} minWidth={minWidth} />}
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
  // أقل عرض مقبول (بكسل) قبل أن يظهر تحذير "قد تبدو ضبابية"
  minWidth?: number;
}

export const MediaListField = ({
  label,
  value,
  onChange,
  folder,
  pending,
  max,
  hint,
  minWidth,
}: MediaListFieldProps) => {
  const full = max !== undefined && value.length >= max;
  return (
    <div>
      <span className={LABEL}>
        {label} {max !== undefined && `(${value.length}/${max})`}
      </span>
      {hint && <p className="mt-1 text-xs text-black/50">{hint}</p>}
      <p className="mt-1 text-xs text-black/50">
        Tip: select the whole folder at once (Ctrl+A). Images are added in
        file-name order (01, 02 … 10).
      </p>
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
              <div className="min-w-0 flex-1">
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
                <Warnings media={m} minWidth={minWidth} />
              </div>
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
        {/* يبقى ظاهرًا حتى عند الامتلاء (معطّلًا)، فتبقى رسالته ظاهرة إن لم تُضف كل الصور */}
        <UploadButton
          label={full ? `Limit reached (${max})` : "Add images"}
          disabled={full}
          folder={folder}
          kind="image"
          multiple
          limit={max !== undefined ? max - value.length : undefined}
          pending={pending}
          onUploaded={(media) => onChange([...value, ...media])}
        />
      </div>
    </div>
  );
};
