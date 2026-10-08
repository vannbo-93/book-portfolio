/** @format */
import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Book from "./pages/Book";
import { SITE } from "./layout";

const App = () => (
  <div className="relative isolate min-h-screen">
    <Navbar />
    <Routes>
      {/* الصفحة الرئيسية تضع الحدود بنفسها لكل قسم، لأن بعض أقسامها تمتد لعرض الشاشة */}
      <Route path="/" element={<Home />} />
      {/* صفحة الكتاب كلها داخل حدود الموقع */}
      <Route
        path="/books/:slug"
        element={
          <div className={SITE}>
            <Book />
          </div>
        }
      />
    </Routes>
    <Footer />
  </div>
);

export default App;
