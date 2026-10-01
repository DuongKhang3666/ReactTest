import { cityLabel } from "../../utils/cities";

export const mockDelay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

/** Lỗi giả lập có hình dạng giống lỗi axios để getErrorMessage dùng chung. */
export class MockError extends Error {
  constructor(status, message) {
    super(message);
    this.response = { status, data: { message } };
  }
}

/* ---------------- Users (lưu localStorage để Register/Login mock hoạt động) ---------------- */
const USERS_KEY = "mock_users";
const SEED_USERS = [
  { id: 1, username: "admin", email: "admin@example.com", password: "admin123", role: "ADMIN", fullName: "Quản trị viên", phone: "0900000000" },
  { id: 2, username: "nguyenvana", email: "a@example.com", password: "123456", role: "CUSTOMER", fullName: "Nguyễn Văn A", phone: "0901234567" },
];

export const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* dữ liệu hỏng -> seed lại */
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
};
export const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
export const toPublicUser = (user) => {
  const copy = { ...user };
  delete copy.password;
  return copy;
};

/* ---------------- Trips (sinh xác định theo ngày nên id ổn định) ---------------- */
// [routeId, from, to, phút, km, giá cơ bản]
const ROUTES = [
  [1, "TPHCM", "DaNang", 1000, 960, 450000],
  [2, "DaNang", "TPHCM", 1000, 960, 450000],
  [3, "TPHCM", "DaLat", 420, 300, 280000],
  [4, "DaLat", "TPHCM", 420, 300, 280000],
  [5, "TPHCM", "NhaTrang", 500, 430, 320000],
  [6, "TPHCM", "CanTho", 210, 170, 160000],
  [7, "TPHCM", "VungTau", 150, 100, 130000],
  [8, "HaNoi", "DaNang", 840, 770, 420000],
  [9, "DaNang", "HaNoi", 840, 770, 420000],
  [10, "DaNang", "Hue", 150, 100, 110000],
  [11, "HaNoi", "Hue", 720, 660, 380000],
  [12, "NhaTrang", "DaLat", 240, 140, 150000],
];
const SLOTS = [
  { h: 6, m: 0, type: "Ghế ngồi 29 chỗ", seats: 29, k: 0.8 },
  { h: 8, m: 30, type: "Limousine 22 chỗ", seats: 22, k: 1.25 },
  { h: 12, m: 0, type: "Giường nằm 40 chỗ", seats: 40, k: 1.0 },
  { h: 15, m: 30, type: "Ghế ngồi 29 chỗ", seats: 29, k: 0.85 },
  { h: 19, m: 0, type: "Giường nằm 40 chỗ", seats: 40, k: 1.1 },
  { h: 21, m: 30, type: "Limousine 22 chỗ", seats: 22, k: 1.35 },
];
const STATIONS = {
  TPHCM: "Bến xe Miền Đông", HaNoi: "Bến xe Mỹ Đình", DaNang: "Bến xe Trung tâm Đà Nẵng",
  DaLat: "Bến xe Liên tỉnh Đà Lạt", NhaTrang: "Bến xe phía Nam Nha Trang", CanTho: "Bến xe Cần Thơ",
  Hue: "Bến xe phía Nam Huế", VungTau: "Bến xe Vũng Tàu",
};

const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const rnd = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const localISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

const buildTrip = (date, route, slotIdx) => {
  const [routeId, from, to, duration, km, basePrice] = route;
  const slot = SLOTS[slotIdx];
  const dep = new Date(date.getFullYear(), date.getMonth(), date.getDate(), slot.h, slot.m);
  const arr = new Date(dep.getTime() + duration * 60000);
  // id = yyyymmdd + routeId(2 số) + slotIdx  -> giải mã ngược được (xem findMockTripById)
  const id = Number(`${dayKey(date)}${pad(routeId)}${slotIdx}`);
  const price = Math.round((basePrice * slot.k) / 10000) * 10000;
  const availableSeats = Math.max(0, Math.floor(rnd(id) * (slot.seats + 1)) - 2);
  return {
    id,
    departureTime: localISO(dep),
    arrivalTime: localISO(arr),
    price,
    status: "SCHEDULED",
    availableSeats,
    route: {
      id: routeId, departureCity: from, destinationCity: to,
      departureStation: STATIONS[from], destinationStation: STATIONS[to],
      distanceKm: km, durationMinutes: duration,
    },
    bus: { id: routeId * 10 + slotIdx, licensePlate: `51B-${10000 + routeId * 137 + slotIdx * 11}`, busType: slot.type, seatCount: slot.seats },
  };
};

export const generateTrips = (date) => {
  const trips = [];
  ROUTES.forEach((route) => SLOTS.forEach((_, i) => trips.push(buildTrip(date, route, i))));
  return trips;
};

export const findMockTripById = (id) => {
  const s = String(id);
  if (!/^\d{11}$/.test(s)) return null;
  const date = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
  const route = ROUTES.find((r) => r[0] === Number(s.slice(8, 10)));
  const slotIdx = Number(s.slice(10));
  if (!route || !SLOTS[slotIdx]) return null;
  return buildTrip(date, route, slotIdx);
};

export const popularRoutes = () =>
  ROUTES.slice(0, 8).map(([, from, to, duration, , price]) => ({
    from, to, fromLabel: cityLabel(from), toLabel: cityLabel(to), durationMinutes: duration, fromPrice: price,
  }));

/* ---------------- Dashboard ---------------- */
export const buildDashboardStats = () => {
  const today = new Date();
  const revenueLast7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { date: localISO(d).slice(0, 10), revenue: Math.round(8 + rnd(i + 3) * 22) * 100000, bookings: 5 + Math.floor(rnd(i + 9) * 20) };
  });
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const upcomingTrips = [...generateTrips(today), ...generateTrips(tomorrow)]
    .filter((t) => new Date(t.departureTime) > today)
    .slice(0, 5);
  const names = ["Nguyễn Văn A", "Trần Thị B", "Lê Minh C", "Phạm Quốc D", "Hoàng Anh E"];
  const statuses = ["CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED", "CONFIRMED"];
  const recentBookings = upcomingTrips.map((t, i) => ({
    id: 100 + i, bookingCode: `BK${20261000 + i * 37}`, customerName: names[i % 5],
    route: `${cityLabel(t.route.departureCity)} - ${cityLabel(t.route.destinationCity)}`,
    totalAmount: t.price * (1 + (i % 3)), status: statuses[i % 5], bookedAt: localISO(new Date(today.getTime() - i * 3600000 * 5)),
  }));
  return {
    totalUsers: 128, totalBuses: 18, totalRoutes: ROUTES.length, totalTrips: 246, totalBookings: 512,
    totalRevenue: 184500000,
    bookingsByStatus: { PENDING: 24, CONFIRMED: 431, CANCELLED: 57 },
    revenueLast7Days, upcomingTrips, recentBookings,
  };
};
