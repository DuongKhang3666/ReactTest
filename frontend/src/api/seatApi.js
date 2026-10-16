import axiosClient from "./axiosClient";

export const getTripSeats = (tripId) =>
  axiosClient.get(`/trips/${tripId}/seats`);
