/** @format */
import { useEffect, type ReactNode } from "react";
import { Routes, Route, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Works from "./pages/Works";
import Book from "./pages/Book";
import NotFound from "./pages/NotFound";
import { SITE } from "./layout";

// عند الانتقال إلى صفحة أخرى نبدأ من أعلاها
// (بدونه تفتح صفحة الكتاب في نفس موضع التمرير الذي كنت فيه في الصفحة السابقة)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// الصفحات التي محتواها كله داخل حدود الموقع
const Bounded = ({ children }: { children: ReactNode }) => (
  <div className={SITE}>{children}</div>
);

const App = () => (
  <div className="relative isolate min-h-screen">
    <ScrollToTop />
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
      {/* أي رابط آخر (ومنها About وContact وServices وProcess حتى نبنيها) */}
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
