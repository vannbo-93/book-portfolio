/** @format */
import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Book from "./pages/Book";
import { SITE } from "./layout";

const App = () => (
  <div className="relative isolate min-h-screen">
    {/* خطوط أعمدة الطباعة خلف كل الصفحات */}
    <Navbar />
    {/* كل الصفحات داخل حدود الموقع: لا يتجاوز محتواها العرض الأقصى مهما كبرت الشاشة */}
    <div className={SITE}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books/:slug" element={<Book />} />
      </Routes>
    </div>
  </div>
);

export default App;
