/** @format */
import { createContext, useContext } from "react";

export interface AdminUser {
  id: string;
  email: string;
}

interface AuthValue {
  admin: AdminUser;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);

// الأدمن المسجل الآن، وزر الخروج (داخل لوحة التحكم فقط)
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside the admin app");
  return value;
};
