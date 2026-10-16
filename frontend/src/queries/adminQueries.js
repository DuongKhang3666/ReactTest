import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/adminService";

export function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
  });
}
