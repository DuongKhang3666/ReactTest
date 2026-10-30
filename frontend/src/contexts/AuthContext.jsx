import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../hooks/useAuth";
import { ROLE_KEY, TOKEN_KEY, USER_KEY } from "../services/apiClient";
import * as authService from "../services/authService";

// Đọc user đã lưu (để F5 trang không bị đăng xuất)
function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient(); // dùng chung QueryClient đã tạo ở main.jsx
  const [user, setUser] = useState(readSavedUser);

  // Lưu token + user sau khi đăng nhập/đăng ký thành công
  const saveSession = ({ token, user: loggedInUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, loggedInUser.role); // để ProtectedRoute của main nhận ra quyền
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const login = async (credentials) => saveSession(await authService.login(credentials));
  const register = async (data) => saveSession(await authService.register(data));

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    queryClient.clear(); // xóa dữ liệu đã cache của người dùng cũ
  };

  // Dùng khi sửa hồ sơ xong: cập nhật user hiển thị trên giao diện
  const updateUser = (updatedUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
