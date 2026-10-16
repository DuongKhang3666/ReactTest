import apiClient, { USE_MOCK } from "./apiClient";
import { MOCK_POPULAR_ROUTES, getMockTripById, getMockTrips } from "./mockData";
import { toDateInputValue } from "../utils/format";

/*
 * API:
 *   GET /trips?from=TPHCM&to=DaNang&date=2026-10-05   ->  Trip[]
 *   GET /trips/{id}                                   ->  Trip
 *   GET /trips/popular-routes                         ->  [{ from, to, durationMinutes, fromPrice }]
 * Trip = { id, departureTime, arrivalTime, price, status, availableSeats,
 *          route: { departureCity, destinationCity, departureStation, destinationStation, durationMinutes },
 *          bus:   { busType, seatCount } }
 */

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchTrips({ from, to, date }) {
  if (!USE_MOCK) {
    const response = await apiClient.get("/trips", { params: { from, to, date } });
    return response.data;
  }

  await wait();
  return getMockTrips(date || toDateInputValue()).filter(
    (trip) => (!from || trip.route.departureCity === from) && (!to || trip.route.destinationCity === to),
  );
}

export async function getTripById(id) {
  if (!USE_MOCK) {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  }

  await wait();
  const trip = getMockTripById(id);
  if (!trip) throw new Error("Không tìm thấy chuyến xe.");
  return trip;
}

export async function getPopularRoutes() {
  if (!USE_MOCK) {
    const response = await apiClient.get("/trips/popular-routes");
    return response.data;
  }

  await wait(200);
  return MOCK_POPULAR_ROUTES;
}
