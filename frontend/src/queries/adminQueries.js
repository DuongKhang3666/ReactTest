import { queryOptions } from "@tanstack/react-query";
import { getDashboardStats } from "../services/adminService";

export const adminKeys = {
  dashboard: () => ["admin", "dashboard"],
};

export const dashboardQuery = () =>
  queryOptions({
    queryKey: adminKeys.dashboard(),
    queryFn: getDashboardStats,
    staleTime: 1000 * 30,
  });
