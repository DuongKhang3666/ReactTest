
import axios from "axios";

// Khóa lưu phiên đăng nhập (dùng chung với utils/auth.js và contexts/AuthContext.jsx)
const TOKEN_KEY = "accessToken";
const ROLE_KEY = "userRole";
const USER_KEY = "bus_ticket_user";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Đăng ký/đăng nhập không gửi JWT cũ
// Các API khác vẫn gửi JWT nếu có
axiosClient.interceptors.request.use(
    (config) => {
        const isAuthRequest = /\/auth\/(register|login)\/?$/.test(
            config.url ?? ""
        );

        if (isAuthRequest) {
            config.headers.delete?.("Authorization");
            delete config.headers.Authorization;
            return config;
        }

        const token = localStorage.getItem(TOKEN_KEY);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// Nếu API cần xác thực trả 401, xóa phiên đăng nhập
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes("/auth/");

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ROLE_KEY);
            localStorage.removeItem(USER_KEY);

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
