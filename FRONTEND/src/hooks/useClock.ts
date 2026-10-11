/** @format */
import { useEffect, useState } from "react";
import { useSiteData } from "../data/siteData";

// الوقت الآن في مدينة صاحب الموقع، مع فرقها عن غرينتش: "22:41:24 GMT+2"
// يتحدث كل ثانية. يستعمله الناف بار والفوتر.
const format = (timeZone: string) => {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const offset =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return `${time} ${offset === "GMT" ? "GMT+0" : offset}`;
};

// المنطقة الزمنية من إعدادات لوحة التحكم
export const useClock = () => {
  const { timezone } = useSiteData().settings;
  const [value, setValue] = useState(() => format(timezone));
  useEffect(() => {
    const id = setInterval(() => setValue(format(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);
  return value;
};

// خط الروابط والساعة المشترك بين الناف بار والفوتر:
// أحادي المسافة، عريض، 11px، بأحرف كبيرة، أسطر متلاصقة
export const MONO =
  "font-mono text-[11px] font-bold uppercase leading-[1.15] tracking-[0.01em]";
