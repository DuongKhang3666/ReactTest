import apiClient, { USE_MOCK } from "./apiClient";
import { getMockDashboard } from "./mockData";

/*
 * API: GET /admin/dashboard  ->  backend hiện chỉ trả { totalUsers, totalBuses, totalRoutes, totalTrips }.
 * Các trường còn lại bên dưới là TUỲ CHỌN: có thì Dashboard hiển thị, không có thì tự ẩn.
 *   totalBookings, totalRevenue,
 *   bookingsByStatus: { PENDING, CONFIRMED, CANCELLED },
 *   revenueLast7Days: [{ date, revenue, bookings }],
 *   upcomingTrips: Trip[],
 *   recentBookings: [{ id, bookingCode, customerName, route, totalAmount, status }]
 * }
 */
export async function getDashboard() {
  if (!USE_MOCK) {
    const response = await apiClient.get("/admin/dashboard");
    return response.data;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockDashboard();
}
