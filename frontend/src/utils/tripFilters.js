// Lọc và sắp xếp danh sách chuyến ở phía giao diện (không gọi lại API)

export const TIME_SLOTS = [
  { id: "night", label: "Sáng sớm 00:00 - 06:00", from: 0, to: 6 },
  { id: "morning", label: "Buổi sáng 06:00 - 12:00", from: 6, to: 12 },
  { id: "afternoon", label: "Buổi chiều 12:00 - 18:00", from: 12, to: 18 },
  { id: "evening", label: "Buổi tối 18:00 - 24:00", from: 18, to: 24 },
];

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả", min: 0, max: Infinity },
  { id: "low", label: "Dưới 300.000đ", min: 0, max: 300000 },
  { id: "mid", label: "300.000đ - 500.000đ", min: 300000, max: 500000 },
  { id: "high", label: "Trên 500.000đ", min: 500000, max: Infinity },
];

export const SORT_OPTIONS = [
  { value: "time-asc", label: "Giờ đi sớm nhất" },
  { value: "time-desc", label: "Giờ đi muộn nhất" },
  { value: "price-asc", label: "Giá thấp nhất" },
  { value: "price-desc", label: "Giá cao nhất" },
  { value: "duration-asc", label: "Thời gian ngắn nhất" },
];

export const DEFAULT_FILTERS = { slots: [], busTypes: [], priceRange: "all", hideSoldOut: false };

export function filterTrips(trips, filters) {
  const priceRange = PRICE_RANGES.find((range) => range.id === filters.priceRange);

  return trips.filter((trip) => {
    // Giờ đi: thuộc ít nhất một khung giờ đã chọn
    if (filters.slots.length > 0) {
      const hour = new Date(trip.departureTime).getHours();
      const inSelectedSlot = TIME_SLOTS.some((slot) => filters.slots.includes(slot.id) && hour >= slot.from && hour < slot.to);
      if (!inSelectedSlot) return false;
    }
    // Loại xe
    if (filters.busTypes.length > 0 && !filters.busTypes.includes(trip.bus.busType)) return false;
    // Khoảng giá
    if (trip.price < priceRange.min || trip.price >= priceRange.max) return false;
    // Ẩn chuyến hết chỗ
    if (filters.hideSoldOut && trip.availableSeats <= 0) return false;
    return true;
  });
}

export function sortTrips(trips, sortBy) {
  const sorted = [...trips]; // sao chép để không làm thay đổi mảng gốc
  const time = (trip) => new Date(trip.departureTime).getTime();

  if (sortBy === "time-asc") sorted.sort((a, b) => time(a) - time(b));
  if (sortBy === "time-desc") sorted.sort((a, b) => time(b) - time(a));
  if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "duration-asc") sorted.sort((a, b) => a.route.durationMinutes - b.route.durationMinutes);
  return sorted;
}
