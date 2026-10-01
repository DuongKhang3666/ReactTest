import axios from "axios";

export const TOKEN_KEY = "bus_ticket_token";
export const AUTH_EXPIRED_EVENT = "auth:expired";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Gắn JWT vào mọi request: Authorization: Bearer <token>
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 (token hết hạn / không hợp lệ) -> báo cho AuthContext đăng xuất
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
