/** @format */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { loadSiteData, SiteDataContext, type SiteData } from "../data/siteData";
import { BRAND } from "../data/site";

// يحمّل محتوى الموقع من الخادم قبل عرض أي صفحة.
// أثناء التحميل: شاشة سوداء بالاسم، بنفس شكل بداية شاشة الدخول (Intro)، فيبدو الانتقال متصلًا.
// إن فشل التحميل: رسالة وزر "حاول مجددًا" بدل صفحة فارغة.

// بعد كم ثانية نطمئن الزائر أن الموقع يُحمَّل (الخادم المجاني قد يحتاج وقتًا ليستيقظ)
const SLOW_AFTER = 3000;

const Screen = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black text-white">
    <p className="font-sans text-base font-medium leading-none">{BRAND}</p>
    {children}
  </div>
);

const NOTE =
  "font-mono text-[11px] font-bold uppercase tracking-[0.01em] text-white/50";

const SiteDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SiteData | null>(null);
  const [error, setError] = useState(false);
  const [slow, setSlow] = useState(false);

  // التحميل نفسه (عند الفتح، وعند "حاول مجددًا")
  const fetchData = useCallback(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER);
    loadSiteData()
      .then(setData)
      .catch((err) => {
        console.error("Could not load site content:", err);
        setError(true);
      })
      .finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => fetchData(), [fetchData]);

  const retry = () => {
    setError(false);
    setSlow(false);
    fetchData();
  };

  if (data) return <SiteDataContext value={data}>{children}</SiteDataContext>;

  if (error)
    return (
      <Screen>
        <p className={NOTE}>Couldn’t load the site</p>
        <button
          type="button"
          onClick={retry}
          className={`${NOTE} cursor-pointer text-white underline-offset-[3px] hover:underline`}>
          [ Try again ]
        </button>
      </Screen>
    );

  return (
    <Screen>
      {slow && <p className={`${NOTE} animate-pulse`}>Loading…</p>}
    </Screen>
  );
};

export default SiteDataProvider;
