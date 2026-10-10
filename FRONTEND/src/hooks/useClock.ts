/** @format */
import { useEffect, useState } from "react";
import { TIMEZONE } from "../data/site";

// الوقت الآن في مدينة صاحب الموقع، مع فرقها عن غرينتش: "22:41:24 GMT+2"
// يتحدث كل ثانية. يستعمله الناف بار والفوتر.
const format = () => {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const offset =
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      timeZoneName: "shortOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return `${time} ${offset === "GMT" ? "GMT+0" : offset}`;
};

export const useClock = () => {
  const [value, setValue] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setValue(format()), 1000);
    return () => clearInterval(id);
  }, []);
  return value;
};

// خط الروابط والساعة المشترك بين الناف بار والفوتر:
// أحادي المسافة، عريض، 11px، بأحرف كبيرة، أسطر متلاصقة
export const MONO =
  "font-mono text-[11px] font-bold uppercase leading-[1.15] tracking-[0.01em]";
