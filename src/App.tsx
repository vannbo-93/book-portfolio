/** @format */
import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Book from "./pages/Book";

const App = () => (
  <div className="relative isolate min-h-screen">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books/:slug" element={<Book />} />
    </Routes>
  </div>
);

export default App;
