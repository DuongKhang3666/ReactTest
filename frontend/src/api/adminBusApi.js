import axiosClient from "./axiosClient";

export const getAdminBuses = () => {
  return axiosClient.get("/admin/buses");
};

export const getAdminBusById = (busId) =>
  axiosClient.get(`/admin/buses/${busId}`);

export const createAdminBus = (bus) =>
  axiosClient.post("/admin/buses", bus);

export const updateAdminBus = (busId, bus) =>
  axiosClient.put(`/admin/buses/${busId}`, bus);

export const deleteAdminBus = (busId) =>
  axiosClient.delete(`/admin/buses/${busId}`);