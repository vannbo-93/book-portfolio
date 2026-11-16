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

// تغيير عرض صورة مجهّزة مسبقًا بـ sized (مثل الأغلفة في siteData بعرض 900):
// الصور الصغيرة على الشاشة لا تحتاج تنزيل النسخة الكبيرة
export const resized = (src: string, width: number) =>
  /\/upload\/f_auto,q_auto,c_limit,w_\d+\//.test(src)
    ? src.replace(/(\/upload\/f_auto,q_auto,c_limit,)w_\d+\//, `$1w_${width}/`)
    : sized(src, width);

// صور متجاوبة (srcset): المتصفح يختار أصغر نسخة تكفي لحجم الصورة على الشاشة ودقتها،
// بدل تنزيل نسخة 900px لغلاف يظهر بعرض 180px على الهاتف.
// sizes يخبر المتصفح بعرض الصورة على الشاشة قبل رسم الصفحة (مثل "50vw" = نصف عرض الشاشة)
export const srcSet = (src: string, widths: readonly number[]) =>
  src.includes("res.cloudinary.com") && src.includes("/upload/")
    ? widths.map((w) => `${resized(src, w)} ${w}w`).join(", ")
    : undefined;

// المقاسات المستعملة في أكثر من مكان. أي تغيير هنا يجب أن يُنقل إلى scripts/prerender.mjs
// (يحمّل صورة الكتاب الدوّار وغلاف صفحة الكتاب مسبقًا بنفس srcset و sizes، وإلا يُنزّلها المتصفح مرتين)
export const GRID_WIDTHS = [200, 300, 400, 600, 900] as const;
export const FAN_WIDTHS = [250, 375, 500] as const;
export const FAN_SIZES = "clamp(120px, 20vw, 250px)";
export const COVER_WIDTHS = [400, 600, 900] as const;
export const COVER_SIZES = "(min-width: 768px) 448px, calc(100vw - 32px)";

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
