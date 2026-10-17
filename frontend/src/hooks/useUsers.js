import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAdminUserById,
  getAdminUsers,
  updateAdminUserRole,
} from "../api/adminUserApi";
import { queryKeys } from "./queryKeys";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => (await getAdminUsers()).data,
  });
}

export function useUser(userId) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => (await getAdminUserById(userId)).data,
    enabled: Boolean(userId),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => updateAdminUserRole(userId, role),
    onSuccess: async (response, { userId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        queryClient.setQueryData(
          queryKeys.users.detail(userId),
          response.data,
        ),
      ]),
  });
}
