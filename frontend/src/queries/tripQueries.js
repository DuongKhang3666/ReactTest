import { queryOptions } from "@tanstack/react-query";
import { getPopularRoutes, getTripById, searchTrips } from "../services/tripService";

// Query key theo quy ước chung: ["trips", from, to, date] / ["trip", tripId]
export const tripKeys = {
  search: (from, to, date) => ["trips", from ?? "", to ?? "", date ?? ""],
  detail: (tripId) => ["trip", tripId],
  popularRoutes: () => ["trips", "popular-routes"],
};

export const searchTripsQuery = ({ from, to, date }) =>
  queryOptions({
    queryKey: tripKeys.search(from, to, date),
    queryFn: () => searchTrips({ from, to, date }),
    staleTime: 1000 * 60, // kết quả tìm kiếm đổi nhanh hơn dữ liệu tĩnh
  });

export const tripDetailQuery = (tripId) =>
  queryOptions({
    queryKey: tripKeys.detail(tripId),
    queryFn: () => getTripById(tripId),
    enabled: Boolean(tripId),
  });

export const popularRoutesQuery = () =>
  queryOptions({ queryKey: tripKeys.popularRoutes(), queryFn: getPopularRoutes, staleTime: 1000 * 60 * 30 });
