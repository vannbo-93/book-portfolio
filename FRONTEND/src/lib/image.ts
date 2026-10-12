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

// فيديو Cloudinary خفيف: نفس فكرة الصور. Cloudinary يصغّر العرض (c_limit لا يكبّر الصغير)،
// ويختار الجودة والترميز المناسبين (q_auto,vc_auto)، ويحوّل الملف إلى MP4
// (مهم لملفات .mov من الآيفون التي لا يشغّلها كروم دائمًا). أول مشاهدة قد تتأخر قليلًا
// ريثما يجهّز Cloudinary النسخة، ثم تُحفظ وتُقدَّم بسرعة للجميع.
const isCloudinaryVideo = (src: string) =>
  src.includes("res.cloudinary.com") && src.includes("/video/upload/");

export const videoSized = (src: string, width: number) =>
  isCloudinaryVideo(src)
    ? src
        .replace("/upload/", `/upload/q_auto,vc_auto,c_limit,w_${width}/`)
        .replace(/\.[a-z0-9]+$/i, ".mp4")
    : src;

// صورة أول لقطة من الفيديو (poster): تظهر فورًا بدل مربع أسود ريثما يبدأ الفيديو
export const videoPoster = (src: string, width: number) =>
  isCloudinaryVideo(src)
    ? src
        .replace("/upload/", `/upload/so_0,f_auto,q_auto,c_limit,w_${width}/`)
        .replace(/\.[a-z0-9]+$/i, ".jpg")
    : undefined;
