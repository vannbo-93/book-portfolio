/** @format */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App";
import SiteDataProvider from "./components/SiteDataProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* المحتوى من الخادم: يُحمَّل أولًا، ثم يظهر الموقع */}
      <SiteDataProvider>
        <App />
      </SiteDataProvider>
    </BrowserRouter>
  </StrictMode>,
);
