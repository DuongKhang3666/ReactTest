import axiosClient from "./axiosClient";

export const getAdminRoutes = () => {
  return axiosClient.get("/admin/routes");
};

export const getAdminRouteById = (routeId) =>
  axiosClient.get(`/admin/routes/${routeId}`);

export const createAdminRoute = (route) =>
  axiosClient.post("/admin/routes", route);

export const updateAdminRoute = (routeId, route) =>
  axiosClient.put(`/admin/routes/${routeId}`, route);

export const deleteAdminRoute = (routeId) =>
  axiosClient.delete(`/admin/routes/${routeId}`);