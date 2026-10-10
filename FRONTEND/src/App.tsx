/** @format */
import type { ReactNode } from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import SmoothScroll from "./components/SmoothScroll";
import PageMeta from "./components/PageMeta";
import RevealOnScroll from "./components/RevealOnScroll";
import PageSlide from "./components/PageSlide";
import { PAGE_EXITED } from "./lib/scroll";
import Home from "./pages/Home";
import Works from "./pages/Works";
import Book from "./pages/Book";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import Process from "./pages/Process";
import NotFound from "./pages/NotFound";
import { SITE } from "./layout";

// الصفحات التي محتواها كله داخل حدود الموقع
const Bounded = ({ children }: { children: ReactNode }) => (
  <div className={SITE}>{children}</div>
);

const App = () => {
  const location = useLocation();

  return (
    // overflow-x-clip: لا يظهر شريط تمرير أفقي والصفحة خارج الشاشة أثناء الانزلاق
    <div className="relative isolate min-h-screen overflow-x-clip">
      {/* شاشة الدخول السوداء مع اسم الموقع (عند كل فتح أو تحديث) */}
      <Intro />
      {/* التمرير الناعم للموقع كله */}
      <SmoothScroll />
      {/* عنوان تبويب المتصفح لكل صفحة */}
      <PageMeta />
      <Navbar />

      {/* الانتقال بين الصفحات: القديمة تنزلق يسارًا والجديدة تدخل ملتصقة بها من اليمين (PageSlide) */}
      <AnimatePresence
        initial={false}
        onExitComplete={() => window.dispatchEvent(new Event(PAGE_EXITED))}>
        <PageSlide key={location.pathname} location={location}>
          {/* ظهور العناوين أثناء التمرير: يعمل مع ظهور كل صفحة */}
          <RevealOnScroll />
          <Routes location={location}>
            {/* الصفحة الرئيسية تضع الحدود بنفسها لكل قسم، لأن بعض أقسامها تمتد لعرض الشاشة */}
            <Route path="/" element={<Home />} />
            <Route
              path="/work"
              element={
                <Bounded>
                  <Works />
                </Bounded>
              }
            />
            <Route
              path="/books/:slug"
              element={
                <Bounded>
                  <Book />
                </Bounded>
              }
            />
            {/* صفحة ABOUT (عن المصمم وخدماته): أقسامها تضع الحدود بنفسها (القسم الأول بعرض الشاشة) */}
            <Route path="/about" element={<ServicesPage />} />
            {/* /services (زر View all وروابط Services): نفس الصفحة، تبدأ مباشرة من بطاقات الخدمات (SECTION_ROUTES) */}
            <Route path="/services" element={<ServicesPage />} />
            {/* صفحة التواصل: النموذج وشريط الأغلفة بعرض الشاشة */}
            <Route path="/contact" element={<ContactPage />} />
            {/* صفحة مراحل العمل */}
            <Route path="/process" element={<Process />} />
            {/* أي رابط آخر */}
            <Route
              path="*"
              element={
                <Bounded>
                  <NotFound />
                </Bounded>
              }
            />
          </Routes>
          {/* الفوتر داخل الصفحة: ينزلق معها */}
          <Footer />
        </PageSlide>
      </AnimatePresence>
    </div>
  );
};

export default App;
