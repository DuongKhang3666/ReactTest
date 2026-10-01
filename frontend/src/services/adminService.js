import apiClient, { USE_MOCK } from "./apiClient";
import { buildDashboardStats, mockDelay } from "./mock/mockDb";

/*
 * Contract (FE1 đề xuất - BE1/BE2 xác nhận):
 *  GET /admin/dashboard -> {
 *    totalUsers, totalBuses, totalRoutes, totalTrips, totalBookings, totalRevenue,
 *    bookingsByStatus: { PENDING, CONFIRMED, CANCELLED },
 *    revenueLast7Days: [{ date, revenue, bookings }],
 *    upcomingTrips: Trip[],
 *    recentBookings: [{ id, bookingCode, customerName, route, totalAmount, status, bookedAt }]
 *  }
 */
export async function getDashboardStats() {
  if (!USE_MOCK) return (await apiClient.get("/admin/dashboard")).data;
  await mockDelay(450);
  return buildDashboardStats();
}
