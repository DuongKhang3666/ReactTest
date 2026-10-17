import apiClient, { USE_MOCK } from "./apiClient";
import { MOCK_POPULAR_ROUTES, getMockTripById, getMockTrips } from "./mockData";
import { toDateInputValue } from "../utils/format";

/*
 * API:
 *   GET /trips?from=TP.HCM&to=Đà Nẵng&date=2026-10-05   ->  Trip[]
 *   GET /trips/{id}                                   ->  Trip
 *   GET /trips/popular-routes                         ->  (backend CHƯA có, chỉ dùng ở chế độ mock)
 * Backend bắt buộc đủ 3 tham số from, to, date (from/to là tên thành phố đúng như trong bảng routes).
 * Trip = { id, departureTime, arrivalTime, price, status, availableSeats (backend chưa trả),
 *          route: { departureCity, destinationCity, departureStation, destinationStation, durationMinutes },
 *          bus:   { busType, seatCount } }
 */

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchTrips({ from, to, date }) {
  if (!USE_MOCK) {
    if (!from || !to) throw new Error("Vui lòng chọn cả điểm đi và điểm đến để tìm chuyến.");
    const response = await apiClient.get("/trips", { params: { from, to, date } });
    return response.data;
  }

  await wait();
  return getMockTrips(date || toDateInputValue()).filter(
    (trip) => (!from || trip.route.departureCity === from) && (!to || trip.route.destinationCity === to),
  );
}

export async function getTripById(id) {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  }

  await wait();
  const trip = getMockTripById(id);
  if (!trip) throw new Error("Không tìm thấy chuyến xe.");
  return trip;
}

export async function getPopularRoutes() {
  // Backend chưa có API tuyến phổ biến (đường dẫn /trips/popular-routes sẽ bị hiểu là /trips/{id} và lỗi 400)
  // -> không gọi, trả về danh sách rỗng để trang chủ tự ẩn mục này.
  if (!USE_MOCK) return [];

  await wait(200);
  return MOCK_POPULAR_ROUTES;
}
