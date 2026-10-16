import axios from "axios";

// Tên khóa lưu trong localStorage
export const TOKEN_KEY = "bus_ticket_token";
export const USER_KEY = "bus_ticket_user";

// true = dùng dữ liệu giả (không cần backend). Đổi trong file .env
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
});

// Trước mỗi request: gắn JWT vào header để backend biết ai đang gọi
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sau mỗi response: nếu token hết hạn (401) thì xóa phiên và về trang đăng nhập
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
