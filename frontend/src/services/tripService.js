import apiClient from "./apiClient";

/*
 * API của backend:
 *   GET /trips?from=TP.HCM&to=Đà Nẵng&date=2026-10-05   ->  Trip[]   (bắt buộc đủ from, to, date;
 *                                                          from/to là tên thành phố đúng như trong bảng routes)
 *   GET /trips/{id}                                    ->  Trip
 * Trip = { id, departureTime, arrivalTime, price, status,
 *          route: { departureCity, destinationCity, departureStation, destinationStation, durationMinutes },
 *          bus:   { busType, seatCount } }
 * (Backend chưa trả số chỗ trống nên availableSeats có thể không có.)
 */

export async function searchTrips({ from, to, date }) {
  if (!from || !to) throw new Error("Vui lòng chọn cả điểm đi và điểm đến để tìm chuyến.");
  const response = await apiClient.get("/trips", { params: { from, to, date } });
  return response.data;
}

export async function getTripById(id) {
  const response = await apiClient.get(`/trips/${id}`);
  return response.data;
}
