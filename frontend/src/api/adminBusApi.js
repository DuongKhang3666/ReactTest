import axiosClient from "./axiosClient";

export const getAdminBuses = () => {
  return axiosClient.get("/admin/buses");
};