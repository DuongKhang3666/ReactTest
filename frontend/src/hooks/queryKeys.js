const idKey = (id) => String(id ?? "");

export const queryKeys = {
  trips: {
    all: ["trips"],
    detail: (tripId) => ["trips", "detail", idKey(tripId)],
    search: (params) => ["trips", "search", params],
    admin: ["admin", "trips"],
    adminDetail: (tripId) => ["admin", "trips", idKey(tripId)],
  },
  seats: {
    trip: (tripId) => ["seats", "trip", idKey(tripId)],
  },
  buses: {
    all: ["admin", "buses"],
    detail: (busId) => ["admin", "buses", idKey(busId)],
  },
  routes: {
    all: ["admin", "routes"],
    detail: (routeId) => ["admin", "routes", idKey(routeId)],
  },
  users: {
    all: ["admin", "users"],
    detail: (userId) => ["admin", "users", idKey(userId)],
  },
};
