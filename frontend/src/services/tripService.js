import apiClient, { USE_MOCK } from "./apiClient";
import { MockError, findMockTripById, generateTrips, mockDelay, popularRoutes } from "./mock/mockDb";

/*
 * Contract:
 *  GET /trips?from=TPHCM&to=DaNang&date=2026-10-05 -> Trip[]
 *  GET /trips/{id}                                 -> Trip
 *  Trip = { id, departureTime, arrivalTime, price, status, availableSeats,
 *           route: { id, departureCity, destinationCity, departureStation,
 *                    destinationStation, distanceKm, durationMinutes },
 *           bus:   { id, licensePlate, busType, seatCount } }
 */

export async function searchTrips({ from, to, date }) {
  if (!USE_MOCK) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (date) params.date = date;
    return (await apiClient.get("/trips", { params })).data;
  }
  await mockDelay();
  const day = date ? new Date(`${date}T00:00:00`) : new Date();
  const now = new Date();
  return generateTrips(day).filter(
    (t) =>
      (!from || t.route.departureCity === from) &&
      (!to || t.route.destinationCity === to) &&
      new Date(t.departureTime) > now,
  );
}

// Dùng chung cho FE2 (Trip Detail)
export async function getTripById(id) {
  if (!USE_MOCK) return (await apiClient.get(`/trips/${id}`)).data;
  await mockDelay();
  const trip = findMockTripById(id);
  if (!trip) throw new MockError(404, "Không tìm thấy chuyến xe.");
  return trip;
}

export async function getPopularRoutes() {
  if (!USE_MOCK) return (await apiClient.get("/trips/popular-routes")).data;
  await mockDelay(200);
  return popularRoutes();
}
