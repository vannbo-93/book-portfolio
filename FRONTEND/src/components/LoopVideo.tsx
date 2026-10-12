/** @format */
import type { Video } from "../data/siteData";

// فيديو صامت يعمل وحده ويتكرر (للمربع في MediaExpand ولوحتي StackReveal).
// muted + playsInline: شرط المتصفحات (خصوصًا آيفون) لتشغيل الفيديو تلقائيًا
// poster: أول لقطة تظهر فورًا بدل السواد ريثما يبدأ الفيديو
const LoopVideo = ({ src, poster }: Video) => (
  <video
    src={src}
    poster={poster}
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    aria-hidden="true"
    className="h-full w-full object-cover"
  />
);

export default LoopVideo;
