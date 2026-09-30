import axiosClient from "./axiosClient";

export const getAdminRoutes = () => {
  return axiosClient.get("/admin/routes");
};