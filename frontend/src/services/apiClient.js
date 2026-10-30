import axiosClient from "../api/axiosClient";

// Tên khóa lưu trong localStorage.
// TOKEN_KEY và ROLE_KEY PHẢI trùng với utils/auth.js + api/axiosClient.js
// (ProtectedRoute và các trang FE2/FE3 đọc token/role từ đúng 2 khóa này).
export const TOKEN_KEY = "accessToken";
export const ROLE_KEY = "userRole";
export const USER_KEY = "bus_ticket_user";

// Cả dự án dùng CHUNG một axios client (api/axiosClient.js): cùng địa chỉ backend,
// cùng cách gắn JWT, cùng cách xử lý 401.
export default axiosClient;
