/** @format */
import { AVAILABLE } from "../data/site";

// نقطة حالة التوفر: خضراء تنبض إن كان متاحًا، رمادية ثابتة إن كان مشغولًا
const StatusDot = () => (
  <span aria-hidden="true" className="relative flex size-2 shrink-0">
    {AVAILABLE && (
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
    )}
    <span
      className={`relative inline-flex size-2 rounded-full ${AVAILABLE ? "bg-emerald-500" : "bg-neutral-400"}`}
    />
  </span>
);

export default StatusDot;
