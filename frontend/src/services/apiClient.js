import axios from "axios";

// Tên khóa lưu trong localStorage.
// TOKEN_KEY và ROLE_KEY PHẢI trùng với utils/auth.js + api/axiosClient.js của nhánh main
// (ProtectedRoute và các trang FE2/FE3 đọc token/role từ đúng 2 khóa này).
export const TOKEN_KEY = "accessToken";
export const ROLE_KEY = "userRole";
export const USER_KEY = "bus_ticket_user";

// true = dùng dữ liệu giả (không cần backend). Mặc định TẮT để dùng backend thật,
// vì các trang của FE2/FE3 luôn gọi backend thật. Muốn bật mock: VITE_USE_MOCK=true trong .env
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

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
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
