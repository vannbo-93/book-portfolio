/** @format */
import Contact from "../components/Contact";
import CoverMarquee from "../components/CoverMarquee";
import { COVERS } from "../data/covers";

// صفحة التواصل (/contact): نفس آخر قسمين في الصفحة الرئيسية، النموذج ثم شريط الأغلفة.
// أي تعديل في Contact.tsx أو CoverMarquee.tsx يظهر هنا وفي الرئيسية معًا.
const ContactPage = () => (
  // pt: مسافة إضافية تحت الناف بار، لأن النموذج هنا أول ما في الصفحة
  <main className="pt-12 font-mono text-xs uppercase tracking-wide sm:pt-16">
    <Contact />
    <CoverMarquee items={COVERS} />
  </main>
);

export default ContactPage;
