import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./authContextValue";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from "../services/apiClient";
import * as authService from "../services/authService";
import { authKeys, meQuery } from "../queries/authQueries";

/**
 * Auth = token (localStorage) + user hiện tại (server state -> TanStack Query ["users","me"]).
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const { data, isPending } = useQuery({ ...meQuery(), enabled: Boolean(token) });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear(); // bỏ toàn bộ cache của người dùng cũ
  }, [queryClient]);

  // Token hết hạn / bị từ chối (apiClient phát sự kiện khi gặp 401)
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const saveSession = useCallback(
    ({ token: newToken, user }) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      queryClient.setQueryData(authKeys.me(), user);
      return user;
    },
    [queryClient],
  );

  const login = useCallback(async (credentials) => saveSession(await authService.login(credentials)), [saveSession]);
  const register = useCallback(async (payload) => saveSession(await authService.register(payload)), [saveSession]);

  const value = useMemo(
    () => ({
      user: token ? (data ?? null) : null,
      isAuthenticated: Boolean(token && data),
      isAdmin: data?.role === "ADMIN",
      isLoading: Boolean(token) && isPending, // đang xác thực token khi tải lại trang
      login,
      register,
      logout,
    }),
    [token, data, isPending, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
