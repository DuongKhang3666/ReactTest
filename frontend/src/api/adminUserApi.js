import axiosClient from "./axiosClient";

export const getAdminUsers = () => axiosClient.get("/admin/users");

export const getAdminUserById = (userId) =>
  axiosClient.get(`/admin/users/${userId}`);

export const updateAdminUserRole = (userId, role) =>
  axiosClient.put(`/admin/users/${userId}/role`, { role });
