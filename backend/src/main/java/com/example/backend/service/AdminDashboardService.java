package com.example.backend.service;

import com.example.backend.dto.admin.AdminDashboardResponse;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            BusRepository busRepository,
            RouteRepository routeRepository,
            TripRepository tripRepository
    ) {
        this.userRepository = userRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.tripRepository = tripRepository;
    }

    public AdminDashboardResponse getDashboard() {
        return new AdminDashboardResponse(
                userRepository.count(),
                busRepository.count(),
                routeRepository.count(),
                tripRepository.count()
        );
    }
}