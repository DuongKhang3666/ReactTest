import { queryOptions } from "@tanstack/react-query";
import { getMe } from "../services/authService";

export const authKeys = {
  me: () => ["users", "me"],
};

export const meQuery = () =>
  queryOptions({ queryKey: authKeys.me(), queryFn: getMe, retry: false });
