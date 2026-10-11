/** @format */
// صور Cloudinary بالحجم المناسب: Cloudinary يصغّر الصورة ويختار أخف صيغة يدعمها المتصفح (WebP/AVIF)
// قبل إرسالها. صورة غلاف 6000px تصير 900px لبطاقة صغيرة، فتفتح الصفحة أسرع بكثير.
// الروابط الأخرى (مثل صور Unsplash المؤقتة) تمر كما هي.
export const sized = (src: string, width: number) => {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/"))
    return src.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  // صور Unsplash المؤقتة: نفس الفكرة بمعاملاتها
  if (src.includes("images.unsplash.com"))
    return src.replace(/([?&])w=\d+/, `$1w=${width}`).replace(/&h=\d+/, "");
  return src;
};
