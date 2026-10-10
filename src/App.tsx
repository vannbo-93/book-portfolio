/** @format */
import { useLayoutEffect, type ReactNode } from "react";
import { Routes, Route, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import SmoothScroll from "./components/SmoothScroll";
import RevealOnScroll from "./components/RevealOnScroll";
import { jumpTo } from "./lib/scroll";
import Home from "./pages/Home";
import Works from "./pages/Works";
import Book from "./pages/Book";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import Process from "./pages/Process";
import NotFound from "./pages/NotFound";
import { SITE } from "./layout";

// عند الانتقال إلى صفحة أخرى نبدأ من أعلاها
// (بدونه تفتح صفحة الكتاب في نفس موضع التمرير الذي كنت فيه في الصفحة السابقة).
// وإن كان في الرابط # (مثل /about#services-list)، أو كان المسار في SECTION_ROUTES،
// نبدأ مباشرة من ذلك القسم.

// مسارات تفتح صفحة أخرى نازلة إلى قسم منها: /services = صفحة ABOUT عند بطاقات الخدمات
const SECTION_ROUTES: Record<string, string> = { "/services": "services-list" };

// موضع العنصر في الصفحة حسب مكانه الأصلي، دون حركات التمرير (transform) التي قد تزيحه مؤقتًا.
// (لو استعملنا مكانه الظاهر لتوقفنا في مكان خاطئ ثم احتجنا تصحيحًا، وهذا ما كان يسبب الاهتزاز)
const layoutTop = (el: HTMLElement) => {
  let top = 0;
  for (
    let n: HTMLElement | null = el;
    n;
    n = n.offsetParent as HTMLElement | null
  )
    top += n.offsetTop;
  return top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  // useLayoutEffect: قبل أن يرسم المتصفح الصفحة، فلا تظهر أعلاها لحظة ثم تقفز
  useLayoutEffect(() => {
    const id = hash ? hash.slice(1) : SECTION_ROUTES[pathname];
    const target = id ? document.getElementById(id) : null;
    jumpTo(target ? layoutTop(target) : 0);
  }, [pathname, hash]);
  return null;
};

// الصفحات التي محتواها كله داخل حدود الموقع
const Bounded = ({ children }: { children: ReactNode }) => (
  <div className={SITE}>{children}</div>
);

const App = () => (
  <div className="relative isolate min-h-screen">
    {/* شاشة الدخول السوداء مع اسم الموقع (مرة في كل زيارة) */}
    <Intro />
    {/* التمرير الناعم للموقع كله */}
    <SmoothScroll />
    <ScrollToTop />
    {/* ظهور العناوين أثناء التمرير، في كل الصفحات */}
    <RevealOnScroll />
    <Navbar />
    <Routes>
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
    <Footer />
  </div>
);

export default App;
