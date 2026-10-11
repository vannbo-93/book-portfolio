/** @format */
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import App from "./App";
import SiteDataProvider from "./components/SiteDataProvider";
import ErrorBoundary from "./components/ErrorBoundary";

// لوحة التحكم: تُحمَّل فقط عند فتح /admin (زوار الموقع لا ينزّلون كودها)
const AdminApp = lazy(() => import("./admin/AdminApp"));

// أعلى مستوى في التطبيق: لوحة التحكم على /admin، والموقع على كل ما عداه
const Root = () => (
  <Routes>
    <Route
      path="/admin/*"
      element={
        <Suspense>
          <AdminApp />
        </Suspense>
      }
    />
    {/* الموقع: المحتوى من الخادم يُحمَّل أولًا، ثم يظهر */}
    <Route
      path="*"
      element={
        <ErrorBoundary
          fallback={
            <p className="p-8 font-mono text-xs uppercase">
              Something went wrong. Please reload the page.
            </p>
          }>
          <SiteDataProvider>
            <App />
          </SiteDataProvider>
        </ErrorBoundary>
      }
    />
  </Routes>
);

export default Root;
