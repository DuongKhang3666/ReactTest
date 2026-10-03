import axiosClient from "./axiosClient";

export const getMyBookings = () => {
  return axiosClient.get("/bookings/my");
};

export const getBookingById = (bookingId) => {
  return axiosClient.get(`/bookings/${bookingId}`);
};

export const createBooking = (booking) => {
  return axiosClient.post("/bookings", booking);
};

export const cancelBooking = (bookingId) => {
  return axiosClient.patch(`/bookings/${bookingId}/cancel`);
};

export const cancelTicket = (bookingId, ticketId) => {
  return axiosClient.patch(`/bookings/${bookingId}/tickets/${ticketId}/cancel`);
};