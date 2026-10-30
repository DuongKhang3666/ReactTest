import axiosClient from "../api/axiosClient";

/*
 * Dashboard lấy dữ liệu từ các API admin có sẵn của backend:
 *   GET /admin/dashboard  ->  { totalUsers, totalBuses, totalRoutes, totalTrips }
 *   GET /admin/bookings   ->  BookingResponse[] { id, bookingCode, tripId, totalAmount, status, bookedAt, tickets[] }
 *   GET /admin/trips      ->  Trip[] (kèm route, bus)
 * Các thống kê còn lại (doanh thu, vé theo trạng thái, chuyến sắp chạy, vé gần đây) được tính ngay trên giao diện.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-20" theo giờ địa phương
function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getDashboard() {
  const [totalsRes, bookingsRes, tripsRes] = await Promise.all([
    axiosClient.get("/admin/dashboard"),
    axiosClient.get("/admin/bookings"),
    axiosClient.get("/admin/trips"),
  ]);

  const totals = totalsRes.data;
  const bookings = bookingsRes.data ?? [];
  const trips = tripsRes.data ?? [];
  const tripById = new Map(trips.map((trip) => [trip.id, trip]));

  // Doanh thu chỉ tính vé đã được admin xác nhận
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const totalRevenue = confirmed.reduce(
    (sum, b) => sum + Number(b.totalAmount || 0),
    0,
  );

  const bookingsByStatus = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0 };
  bookings.forEach((b) => {
    bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1;
  });

  // Doanh thu 7 ngày gần nhất (theo ngày đặt)
  const today = new Date();
  const revenueLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getTime() - (6 - i) * DAY_MS);
    return { date: dayKey(date), revenue: 0, bookings: 0 };
  });
  confirmed.forEach((b) => {
    if (!b.bookedAt) return;
    const day = revenueLast7Days.find(
      (d) => d.date === dayKey(new Date(b.bookedAt)),
    );
    if (day) {
      day.revenue += Number(b.totalAmount || 0);
      day.bookings += 1;
    }
  });

  // 5 chuyến sắp khởi hành
  const now = Date.now();
  const upcomingTrips = trips
    .filter((trip) => new Date(trip.departureTime).getTime() > now)
    .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
    .slice(0, 5);

  // 5 vé đặt gần đây
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.tickets?.[0]?.passengerName ?? "-",
      route: tripById.get(b.tripId)?.route,
      totalAmount: b.totalAmount,
      status: b.status,
    }));

  return {
    ...totals,
    totalBookings: bookings.length,
    totalRevenue,
    bookingsByStatus,
    revenueLast7Days,
    upcomingTrips,
    recentBookings,
  };
}
