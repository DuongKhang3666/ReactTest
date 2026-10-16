// Các hàm định dạng dữ liệu để hiển thị

export function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export function formatDateTime(iso) {
  return `${formatTime(iso)} ${formatDate(iso)}`;
}

// 1000 phút -> "16h40"
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
}

// Ngày dạng yyyy-mm-dd (theo giờ máy), dùng cho <input type="date"> và tham số API
export function toDateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Lấy câu thông báo lỗi để hiển thị cho người dùng
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message; // lỗi do backend trả về
  if (error?.code === "ERR_NETWORK") return "Không kết nối được máy chủ. Hãy kiểm tra backend hoặc bật VITE_USE_MOCK=true.";
  return error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
