import axiosClient from "./axiosClient";

export const searchTrips = ({
  from,
  to,
  date,
}) => {
  return axiosClient.get("/trips", {
    params: {
      from,
      to,
      date,
    },
  });
};

export const getTripById = (tripId) => {
  return axiosClient.get(`/trips/${tripId}`);
};