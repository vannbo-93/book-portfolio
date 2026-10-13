/** @format */
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { api } from "../lib/api";
import { AuthContext, type AdminUser } from "./auth";
import Login from "./Login";
import Layout from "./Layout";
import Books from "./pages/Books";
import BookEditor from "./pages/BookEditor";
import ContentList from "./pages/ContentList";
import Settings from "./pages/Settings";
import FanCovers from "./pages/FanCovers";
import Messages from "./pages/Messages";
import Account from "./pages/Account";
import { MONO_SM } from "./ui";

// لوحة التحكم (/admin): منفصلة عن الموقع (بلا شاشة الدخول ولا التمرير الناعم ولا انتقالات الصفحات)،
// وتُحمَّل فقط حين تُفتح، فلا تُثقل الموقع على الزوار.

const AdminApp = () => {
  // undefined: نتحقق من الجلسة. null: غير مسجل. وإلا: الأدمن
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    api<{ admin: AdminUser }>("/api/auth/me")
      .then((d) => alive && setAdmin(d.admin))
      .catch(() => alive && setAdmin(null));
    return () => {
      alive = false;
    };
  }, []);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAdmin(null);
  };

  return (
    <>
      {/* محركات البحث لا تفهرس لوحة التحكم */}
      <meta name="robots" content="noindex, nofollow" />
      <title>Dashboard</title>
      {admin === undefined ? (
        <p className={`${MONO_SM} p-8`}>Loading…</p>
      ) : admin === null ? (
        <Login onLogin={setAdmin} />
      ) : (
        <AuthContext value={{ admin, logout }}>
          <Layout>
            <Routes>
              <Route index element={<Navigate to="/admin/books" replace />} />
              <Route path="books" element={<Books />} />
              <Route path="books/:id" element={<BookEditor />} />
              <Route path="content/:type" element={<ContentList />} />
              <Route path="fan" element={<FanCovers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="messages" element={<Messages />} />
              <Route path="account" element={<Account />} />
              <Route
                path="*"
                element={<Navigate to="/admin/books" replace />}
              />
            </Routes>
          </Layout>
        </AuthContext>
      )}
    </>
  );
};

export default AdminApp;
