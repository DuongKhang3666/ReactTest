import axiosClient from "./axiosClient";

export const getAdminBookings = (status) => axiosClient.get("/admin/bookings", {
  params: status ? { status } : {},
});

export const confirmBooking = (bookingId) => axiosClient.post(
  `/admin/bookings/${bookingId}/confirm`,
);
