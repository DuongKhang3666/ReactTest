import { useQuery } from "@tanstack/react-query";
import { getPopularRoutes, getTripById, searchTrips } from "../services/tripService";

// Mỗi hook = một "câu truy vấn" lấy dữ liệu từ server.
// queryKey là "tên" của dữ liệu trong cache: đổi from/to/date thì tự gọi lại API.

export function useSearchTrips(from, to, date) {
  return useQuery({
    queryKey: ["trips", from, to, date],
    queryFn: () => searchTrips({ from, to, date }),
  });
}

export function useTrip(tripId) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripById(tripId),
    enabled: Boolean(tripId),
  });
}

export function usePopularRoutes() {
  return useQuery({
    queryKey: ["trips", "popular-routes"],
    queryFn: getPopularRoutes,
  });
}
