/** @format */
import Contact from "../components/Contact";
import CoverMarquee from "../components/CoverMarquee";
import { useSiteData } from "../data/siteData";

// صفحة التواصل (/contact): نفس آخر قسمين في الصفحة الرئيسية، النموذج ثم شريط الأغلفة.
// أي تعديل في Contact.tsx أو CoverMarquee.tsx يظهر هنا وفي الرئيسية معًا.
const ContactPage = () => {
  const { covers } = useSiteData();
  return (
    // pt: مسافة إضافية تحت الناف بار، لأن النموذج هنا أول ما في الصفحة
    <main className="pt-12 font-mono text-xs uppercase tracking-wide sm:pt-16">
      <Contact />
      <CoverMarquee items={covers} />
    </main>
  );
};

export default ContactPage;
