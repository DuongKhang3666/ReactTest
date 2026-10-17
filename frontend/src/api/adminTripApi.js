import axiosClient from "./axiosClient";

export const getAdminTrips = () => {
  return axiosClient.get("/admin/trips");
};

export const getAdminTripById = (tripId) => {
  return axiosClient.get(`/admin/trips/${tripId}`);
};

export const createAdminTrip = (trip) => {
  return axiosClient.post("/admin/trips", trip);
};

export const updateAdminTrip = (tripId, trip) => {
  return axiosClient.put(`/admin/trips/${tripId}`, trip);
};

export const deleteAdminTrip = (tripId) => {
  return axiosClient.delete(`/admin/trips/${tripId}`);
};