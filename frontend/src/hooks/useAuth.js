import { createContext, useContext } from "react";

// Nơi chứa thông tin đăng nhập dùng chung cho cả app (xem contexts/AuthContext.jsx)
export const AuthContext = createContext(null);

// Dùng trong component: const { user, isAdmin, login, logout } = useAuth();
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return value;
}
