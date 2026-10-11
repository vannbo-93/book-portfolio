/** @format */
// أنماط لوحة التحكم المشتركة: نفس روح الموقع (أبيض وأسود، خط أحادي صغير) لكن أبسط وأوضح للعمل اليومي.

export const LABEL =
  "block font-mono text-[11px] font-bold uppercase tracking-[0.01em] text-black/60";

export const INPUT =
  "mt-2 w-full rounded-[4px] border border-black/20 bg-white px-3 py-2 font-sans text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black disabled:bg-black/5";

export const BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-black bg-black px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

export const BUTTON_GHOST =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-black/20 bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.01em] text-black transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40";

export const BUTTON_DANGER =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-red-700/30 bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.01em] text-red-700 transition-colors hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-40";

export const CARD = "rounded-[6px] border border-black/10 bg-white p-5";

export const MONO_SM =
  "font-mono text-[11px] font-bold uppercase tracking-[0.01em]";

// الخطأ كنص للعرض
export const errorText = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong";
