/** @format */
// فيديو صامت يعمل وحده ويتكرر (للمربع في MediaExpand ولوحتي StackReveal).
// muted + playsInline: شرط المتصفحات (خصوصًا آيفون) لتشغيل الفيديو تلقائيًا
const LoopVideo = ({ src }: { src: string }) => (
  <video
    src={src}
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
