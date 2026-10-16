import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAdminBus,
  deleteAdminBus,
  getAdminBusById,
  getAdminBuses,
  updateAdminBus,
} from "../api/adminBusApi";
import { queryKeys } from "./queryKeys";

export function useBuses() {
  return useQuery({
    queryKey: queryKeys.buses.all,
    queryFn: async () => (await getAdminBuses()).data,
  });
}

export function useBus(busId) {
  return useQuery({
    queryKey: queryKeys.buses.detail(busId),
    queryFn: async () => (await getAdminBusById(busId)).data,
    enabled: Boolean(busId),
  });
}

export function useCreateBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminBus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.buses.all }),
  });
}

export function useUpdateBus(busId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bus) => updateAdminBus(busId, bus),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.buses.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.buses.detail(busId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.admin }),
      ]),
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminBus,
    onSuccess: (_, busId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.buses.all }),
        queryClient.removeQueries({ queryKey: queryKeys.buses.detail(busId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.admin }),
      ]),
  });
}
