package com.example.backend.dto.admin;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalBuses;
    private long totalRoutes;
    private long totalTrips;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalUsers,
            long totalBuses,
            long totalRoutes,
            long totalTrips
    ) {
        this.totalUsers = totalUsers;
        this.totalBuses = totalBuses;
        this.totalRoutes = totalRoutes;
        this.totalTrips = totalTrips;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalBuses() {
        return totalBuses;
    }

    public long getTotalRoutes() {
        return totalRoutes;
    }

    public long getTotalTrips() {
        return totalTrips;
    }
}