// DỮ LIỆU GIẢ để chạy giao diện khi backend chưa xong (VITE_USE_MOCK=true).
// Khi có backend thật, các hàm trong tripService/adminService sẽ gọi API thay vì dùng file này.
import { cityLabel } from "../utils/cities";
import { toDateInputValue } from "../utils/format";

export const MOCK_USERS = [
  { id: 1, username: "admin", email: "admin@example.com", password: "admin123", role: "ADMIN", fullName: "Quản trị viên", phone: "0900000000" },
  { id: 2, username: "nguyenvana", email: "a@example.com", password: "123456", role: "CUSTOMER", fullName: "Nguyễn Văn A", phone: "0901234567" },
];

const STATIONS = {
  TPHCM: "Bến xe Miền Đông",
  HaNoi: "Bến xe Mỹ Đình",
  DaNang: "Bến xe Trung tâm Đà Nẵng",
  DaLat: "Bến xe Liên tỉnh Đà Lạt",
  NhaTrang: "Bến xe phía Nam Nha Trang",
  CanTho: "Bến xe Cần Thơ",
  VungTau: "Bến xe Vũng Tàu",
};

// Danh sách chuyến mẫu. time = giờ khởi hành, duration = số phút di chuyển.
const BASE_TRIPS = [
  { id: 1, from: "TPHCM", to: "DaNang", time: "06:00", duration: 1000, price: 360000, busType: "Ghế ngồi 29 chỗ", seats: 29, available: 12 },
  { id: 2, from: "TPHCM", to: "DaNang", time: "12:00", duration: 1000, price: 450000, busType: "Giường nằm 40 chỗ", seats: 40, available: 20 },
  { id: 3, from: "TPHCM", to: "DaNang", time: "21:30", duration: 1000, price: 610000, busType: "Limousine 22 chỗ", seats: 22, available: 4 },
  { id: 4, from: "DaNang", to: "TPHCM", time: "08:30", duration: 1000, price: 560000, busType: "Limousine 22 chỗ", seats: 22, available: 0 },
  { id: 5, from: "DaNang", to: "TPHCM", time: "19:00", duration: 1000, price: 500000, busType: "Giường nằm 40 chỗ", seats: 40, available: 15 },
  { id: 6, from: "TPHCM", to: "DaLat", time: "06:30", duration: 420, price: 220000, busType: "Ghế ngồi 29 chỗ", seats: 29, available: 9 },
  { id: 7, from: "TPHCM", to: "DaLat", time: "13:00", duration: 420, price: 280000, busType: "Giường nằm 40 chỗ", seats: 40, available: 25 },
  { id: 8, from: "TPHCM", to: "DaLat", time: "22:00", duration: 420, price: 380000, busType: "Limousine 22 chỗ", seats: 22, available: 7 },
  { id: 9, from: "TPHCM", to: "NhaTrang", time: "20:00", duration: 500, price: 320000, busType: "Giường nằm 40 chỗ", seats: 40, available: 18 },
  { id: 10, from: "TPHCM", to: "CanTho", time: "07:00", duration: 210, price: 130000, busType: "Ghế ngồi 29 chỗ", seats: 29, available: 14 },
  { id: 11, from: "TPHCM", to: "CanTho", time: "15:30", duration: 210, price: 200000, busType: "Limousine 22 chỗ", seats: 22, available: 6 },
  { id: 12, from: "TPHCM", to: "VungTau", time: "09:00", duration: 150, price: 110000, busType: "Ghế ngồi 29 chỗ", seats: 29, available: 21 },
  { id: 13, from: "HaNoi", to: "DaNang", time: "18:00", duration: 840, price: 420000, busType: "Giường nằm 40 chỗ", seats: 40, available: 11 },
  { id: 14, from: "HaNoi", to: "DaNang", time: "20:30", duration: 840, price: 560000, busType: "Limousine 22 chỗ", seats: 22, available: 3 },
];

// Chuyển dữ liệu mẫu thành đúng dạng Trip mà API trả về, gắn vào ngày được chọn
function toTrip(base, date) {
  const departure = new Date(`${date}T${base.time}:00`);
  const arrival = new Date(departure.getTime() + base.duration * 60000);
  return {
    id: base.id,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    price: base.price,
    status: "SCHEDULED",
    availableSeats: base.available,
    route: {
      id: base.id,
      departureCity: base.from,
      destinationCity: base.to,
      departureStation: STATIONS[base.from],
      destinationStation: STATIONS[base.to],
      durationMinutes: base.duration,
    },
    bus: { id: base.id, busType: base.busType, seatCount: base.seats },
  };
}

export function getMockTrips(date) {
  return BASE_TRIPS.map((base) => toTrip(base, date));
}

export function getMockTripById(id) {
  const base = BASE_TRIPS.find((t) => t.id === Number(id));
  return base ? toTrip(base, toDateInputValue()) : null;
}

export const MOCK_POPULAR_ROUTES = [
  { from: "TPHCM", to: "DaNang", durationMinutes: 1000, fromPrice: 360000 },
  { from: "TPHCM", to: "DaLat", durationMinutes: 420, fromPrice: 220000 },
  { from: "TPHCM", to: "NhaTrang", durationMinutes: 500, fromPrice: 320000 },
  { from: "TPHCM", to: "CanTho", durationMinutes: 210, fromPrice: 130000 },
  { from: "TPHCM", to: "VungTau", durationMinutes: 150, fromPrice: 110000 },
  { from: "HaNoi", to: "DaNang", durationMinutes: 840, fromPrice: 420000 },
  { from: "DaNang", to: "TPHCM", durationMinutes: 1000, fromPrice: 500000 },
  { from: "DaLat", to: "TPHCM", durationMinutes: 420, fromPrice: 220000 },
];

export function getMockDashboard() {
  const revenues = [1200000, 2900000, 2500000, 2700000, 2700000, 2100000, 1200000];
  const revenueLast7Days = revenues.map((revenue, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    return { date: toDateInputValue(day), revenue, bookings: 6 + i * 2 };
  });

  const routeName = (trip) => `${cityLabel(trip.route.departureCity)} - ${cityLabel(trip.route.destinationCity)}`;
  const upcomingTrips = getMockTrips(toDateInputValue()).slice(0, 5);
  const customers = ["Nguyễn Văn A", "Trần Thị B", "Lê Minh C", "Phạm Quốc D", "Hoàng Anh E"];
  const statuses = ["CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED", "CONFIRMED"];

  return {
    totalUsers: 128,
    totalBuses: 18,
    totalRoutes: 12,
    totalTrips: 246,
    totalBookings: 512,
    totalRevenue: 184500000,
    bookingsByStatus: { PENDING: 24, CONFIRMED: 431, CANCELLED: 57 },
    revenueLast7Days,
    upcomingTrips,
    recentBookings: upcomingTrips.map((trip, i) => ({
      id: i + 1,
      bookingCode: `BK00${i + 1}`,
      customerName: customers[i],
      route: routeName(trip),
      totalAmount: trip.price * (1 + (i % 3)),
      status: statuses[i],
    })),
  };
}
