import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAdminTrip,
  deleteAdminTrip,
  getAdminTripById,
  getAdminTrips,
  updateAdminTrip,
} from "../api/adminTripApi";
import { getTripById, searchTrips } from "../api/tripApi";
import { queryKeys } from "./queryKeys";

export function useTrip(tripId) {
  return useQuery({
    queryKey: queryKeys.trips.detail(tripId),
    queryFn: async () => (await getTripById(tripId)).data,
    enabled: Boolean(tripId),
  });
}

export function useTripSearch(params) {
  return useQuery({
    queryKey: queryKeys.trips.search(params),
    queryFn: async () => (await searchTrips(params)).data,
    enabled: Boolean(params?.from && params?.to && params?.date),
  });
}

export function useAdminTrips() {
  return useQuery({
    queryKey: queryKeys.trips.admin,
    queryFn: async () => (await getAdminTrips()).data,
  });
}

export function useAdminTrip(tripId) {
  return useQuery({
    queryKey: queryKeys.trips.adminDetail(tripId),
    queryFn: async () => (await getAdminTripById(tripId)).data,
    enabled: Boolean(tripId),
  });
}

export function useCreateAdminTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminTrip,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.admin }),
  });
}

export function useUpdateAdminTrip(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trip) => updateAdminTrip(tripId, trip),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.admin }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.trips.adminDetail(tripId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.trips.detail(tripId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.seats.trip(tripId),
        }),
      ]);
    },
  });
}

export function useDeleteAdminTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminTrip,
    onSuccess: (_, tripId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.admin }),
        queryClient.removeQueries({
          queryKey: queryKeys.trips.adminDetail(tripId),
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.trips.detail(tripId),
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.seats.trip(tripId),
        }),
      ]),
  });
}
