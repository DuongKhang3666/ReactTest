export const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value ?? 0);

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });

export const formatDate = (iso) => new Date(iso).toLocaleDateString("vi-VN");

export const formatDateTime = (iso) => `${formatTime(iso)} ${formatDate(iso)}`;

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
};

export const toDateInputValue = (date = new Date()) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
};

/** Lấy message lỗi thân thiện từ lỗi axios / Error */
export const getErrorMessage = (error, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.") => {
  if (!error) return fallback;
  if (error.response) {
    const data = error.response.data;
    if (typeof data === "string" && data) return data;
    if (data?.message) return data.message;
    if (error.response.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    if (error.response.status === 404) return "Không tìm thấy dữ liệu.";
    if (error.response.status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  } else if (error.code === "ERR_NETWORK") {
    return "Không kết nối được máy chủ. Kiểm tra backend hoặc bật VITE_USE_MOCK=true.";
  }
  return error.message || fallback;
};
