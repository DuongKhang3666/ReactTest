export const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(value) {
  return `${Number(value ?? 0).toLocaleString("vi-VN")} ₫`;
}

export function getStatusLabel(status) {
  const option = STATUS_OPTIONS.find(
    (item) => item.value === status,
  );

  return option?.label ?? status;
}