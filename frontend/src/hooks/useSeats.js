import { useQuery } from "@tanstack/react-query";
import { getTripSeats } from "../api/seatApi";
import { queryKeys } from "./queryKeys";

export function useTripSeats(tripId) {
  return useQuery({
    queryKey: queryKeys.seats.trip(tripId),
    queryFn: async () => (await getTripSeats(tripId)).data,
    enabled: Boolean(tripId),
  });
}
