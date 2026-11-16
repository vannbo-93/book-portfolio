/** @format */
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MONO } from "../hooks/useClock";
import { SITE } from "../layout";
import { CONTACT_TEXT, GENERAL_TOPIC, PROJECT_DETAILS } from "../data/contact";
import { useSiteData } from "../data/siteData";
import { api } from "../lib/api";

// قسم التواصل: نموذج (الاسم، البريد، الموضوع، الرسالة) بخطوط سفلية فقط.
// بعد اختيار موضوع مشروع (لا "سؤال عام") تظهر ثلاثة أسئلة اختيارية: الشكل، والطول، والموعد.
// وتحت النموذج: زر رسالة مباشرة على إنستغرام لمن لا يحب النماذج (إن كُتب اسم الحساب في الإعدادات).
// ملاحظة: رسائل إنستغرام لا تظهر في لوحة التحكم، تبقى في التطبيق.
//
// الإرسال: إلى الخادم مباشرة (POST /api/contact)، فتُحفظ الرسالة وتظهر في لوحة التحكم،
// ويصل المصمم إشعار بالبريد إن كان مفعّلًا. الزائر لا يحتاج برنامج بريد على جهازه.

// شكل الحقل: بلا إطار، خط سفلي رمادي يصير أسود عند الكتابة
const FIELD =
  "w-full rounded-none border-0 border-b border-black/30 bg-transparent px-0 pb-2 pt-1 font-sans text-base normal-case tracking-normal outline-none transition-colors placeholder:text-black/35 focus:border-black";
const LABEL = `${MONO} block font-medium`;

// سهم القائمة المنسدلة (بدل سهم المتصفح، ليبدو نفس الشكل في كل المتصفحات)
const Chevron = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2">
    <path d="M2 4.5 6 8.5 10 4.5" />
  </svg>
);

// سؤال اختياري من أسئلة المشروع: "Select" بلون باهت حتى يختار الزائر
const DetailSelect = ({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) => {
  const [value, setValue] = useState("");
  return (
    <label>
      <span className={LABEL}>{label}</span>
      <span className="relative mt-3 block">
        <select
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${FIELD} cursor-pointer appearance-none pr-8 ${value ? "" : "text-black/35"}`}>
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o} className="text-black">
              {o}
            </option>
          ))}
        </select>
        <Chevron />
      </span>
    </label>
  );
};

// رابط إنستغرام: ig.me/m يفتح المحادثة مباشرة، لكنه يعمل في تطبيق إنستغرام على الهاتف فقط.
// على الحاسوب (Instagram Web) لا يدعمه إنستغرام ويعرض "Sorry, this page isn't available"،
// فنفتح صفحة الحساب بدلًا منه، وفيها زر Message.
const IS_MOBILE =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const instagramLink = (handle: string) => {
  const h = encodeURIComponent(handle);
  return IS_MOBILE ? `https://ig.me/m/${h}` : `https://www.instagram.com/${h}/`;
};

const Contact = ({ id = "contact" }: { id?: string }) => {
  const { services, settings } = useSiteData();
  const EMAIL = settings.email;
  // خيارات "الموضوع": أسماء الخدمات ثم "سؤال عام"
  const TOPICS = [...services.map((s) => s.title), GENERAL_TOPIC];
  // idle: لم يُرسل بعد. sending: جارٍ الإرسال. sent: وصل. error: فشل (وسببه في error)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  // الموضوع المختار: يحدد هل تظهر أسئلة المشروع
  const [topic, setTopic] = useState("");
  const isProject = topic !== "" && topic !== GENERAL_TOPIC;

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;
    setStatus("sending");
    try {
      await api("/api/contact", { method: "POST", body: JSON.stringify(data) });
      form.reset();
      setTopic("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <section id={id} className={`${SITE} scroll-mt-6 py-12 sm:py-16`}>
      {/* نفس ترتيب الأقسام الأخرى: CONTACT يسارًا، والمحتوى من منتصف الصفحة، وINQUIRY أقصى اليمين */}
      <div className="grid gap-6 lg:grid-cols-2">
        <p className={`${MONO} font-medium`}>{CONTACT_TEXT.label}</p>

        <div>
          <div className="flex items-start justify-between gap-6">
            <h2 className="font-sans text-[clamp(2rem,3.4vw,4rem)] font-medium uppercase leading-[0.9] tracking-[-0.06em]">
              {CONTACT_TEXT.heading}
            </h2>
            <p className={`${MONO} mt-1 shrink-0 font-medium`}>
              {CONTACT_TEXT.side}
            </p>
          </div>
          <p className="mt-8 max-w-xs font-sans text-[15px] font-medium normal-case leading-snug tracking-normal">
            {CONTACT_TEXT.intro}
          </p>

          <form onSubmit={send} className="mt-14 flex flex-col gap-8 sm:mt-16">
            {/* فخ للبرامج الآلية: مخفي عن الزوار وقارئات الشاشة، فلا يملؤه إلا برنامج */}
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            <label>
              <span className={LABEL}>Name</span>
              <input
                name="name"
                required
                autoComplete="name"
                placeholder="Jane Smith"
                className={`${FIELD} mt-3`}
              />
            </label>

            <label>
              <span className={LABEL}>Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                className={`${FIELD} mt-3`}
              />
            </label>

            <label>
              <span className={LABEL}>Topic</span>
              {/* القائمة المنسدلة بسهم مرسوم بدل سهم المتصفح، حتى يبدو نفس الشكل في كل المتصفحات */}
              <span className="relative mt-3 block">
                <select
                  name="topic"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`${FIELD} cursor-pointer appearance-none pr-8 invalid:text-black/35`}>
                  <option value="" disabled>
                    Select topic
                  </option>
                  {TOPICS.map((t) => (
                    <option key={t} value={t} className="text-black">
                      {t}
                    </option>
                  ))}
                </select>
                <Chevron />
              </span>
            </label>

            {/* أسئلة المشروع: تظهر بعد اختيار موضوع مشروع، وكلها اختيارية */}
            <AnimatePresence initial={false}>
              {isProject && (
                <motion.fieldset
                  key="details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="-mt-2 overflow-hidden">
                  <legend className={`${MONO} pt-2 text-black/50`}>
                    About your book — optional
                  </legend>
                  <div className="mt-6 grid gap-8 sm:grid-cols-3 sm:gap-6">
                    {PROJECT_DETAILS.map((d) => (
                      <DetailSelect
                        key={d.name}
                        name={d.name}
                        label={d.label}
                        options={d.options}
                      />
                    ))}
                  </div>
                </motion.fieldset>
              )}
            </AnimatePresence>

            <label>
              <span className={LABEL}>Your message</span>
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Type here..."
                className={`${FIELD} mt-3 resize-y`}
              />
            </label>

            <div className="flex flex-wrap items-center gap-6">
              <button
                type="submit"
                disabled={status === "sending"}
                className={`${MONO} cursor-pointer font-medium underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:opacity-50`}>
                {status === "sending" ? "[ Sending… ]" : "[ Submit ]"}
              </button>

              {/* بعد الإرسال: تأكيد، أو سبب الفشل مع البريد مكتوبًا كبديل */}
              <AnimatePresence mode="wait">
                {status === "sent" && (
                  <motion.p
                    key="sent"
                    role="status"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${MONO} font-medium text-black/55`}>
                    Thank you — your message was sent.
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${MONO} font-medium text-red-700`}>
                    {error}.
                    {EMAIL && (
                      <>
                        {" "}
                        You can also write to{" "}
                        <a
                          href={`mailto:${EMAIL}`}
                          className="text-black underline underline-offset-[3px]">
                          {EMAIL}
                        </a>
                      </>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* رسالة مباشرة: المحادثة على الهاتف، وصفحة الحساب على الحاسوب (انظر instagramLink) */}
          {settings.instagram && (
            <p
              className={`${MONO} mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-black/10 pt-6 font-medium`}>
              <span className="text-black/50">Prefer a quick chat?</span>
              <a
                href={instagramLink(settings.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-[3px] hover:underline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black">
                [ Message me on Instagram ↗ ]
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
