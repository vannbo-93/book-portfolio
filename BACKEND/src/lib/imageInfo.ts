// هل صورة JPEG بنظام ألوان الطباعة CMYK؟
// ملفات الطباعة غالبًا CMYK، والمتصفحات تعرضها بألوان باهتة أو خاطئة.
// نقرأ رأس الملف فقط (مقطع SOF): عدد قنوات الألوان 4 = CMYK، و3 = RGB، و1 = رمادي.
// PNG وWebP وAVIF لا تدعم CMYK أصلًا، فلا حاجة لفحصها.

// مقاطع SOF في JPEG (C0–CF ما عدا C4 و C8 و CC)
const isSof = (m: number) => m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;

export const isCmykJpeg = (buf: Buffer): boolean => {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return false; // ليس JPEG
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return false; // رأس غير متوقع: نتوقف بأمان
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i++; // حشو
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return false; // نهاية الرأس دون SOF
    const length = buf.readUInt16BE(i + 2);
    if (isSof(marker)) return buf[i + 9] === 4;
    i += 2 + length;
  }
  return false;
};
