import axiosClient from "./axiosClient";

export const getMyBookings = () => {
  return axiosClient.get("/bookings/me");
};

export const getBookingById = (bookingId) => {
  return axiosClient.get(`/bookings/${bookingId}`);
};

export const createBooking = (booking) => {
  return axiosClient.post("/bookings", booking);
};

export const cancelBooking = (bookingId) => {
  return axiosClient.put(`/bookings/${bookingId}/cancel`);
};