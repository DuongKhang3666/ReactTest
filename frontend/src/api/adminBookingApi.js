import axiosClient from "./axiosClient";

export const  getAllBookings = (status) => {
  const params = {};

  if (status) {
    params.status = status;
  }

  return axiosClient.get("/admin/bookings", {
    params,
  });
};

export const confirmAdminBooking = (bookingId) => {
  return axiosClient.post(
    `/admin/bookings/${bookingId}/confirm`
  );
};