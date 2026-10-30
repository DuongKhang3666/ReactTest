package com.example.backend.service;

import com.example.backend.entity.Route;
import com.example.backend.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tuyến đường"));
    }

    public Route createRoute(Route route) {
        if (routeRepository.existsByDepartureCityAndDestinationCity(
                route.getDepartureCity(),
                route.getDestinationCity())) {
            throw new RuntimeException("Tuyến đường đã tồn tại");
        }

        return routeRepository.save(route);
    }

    public Route updateRoute(Long id, Route updatedRoute) {
        Route existingRoute = getRouteById(id);

        boolean pathChanged =
                !existingRoute.getDepartureCity()
                        .equals(updatedRoute.getDepartureCity())
                || !existingRoute.getDestinationCity()
                        .equals(updatedRoute.getDestinationCity());

        if (pathChanged
                && routeRepository.existsByDepartureCityAndDestinationCity(
                        updatedRoute.getDepartureCity(),
                        updatedRoute.getDestinationCity())) {

            throw new RuntimeException("Tuyến đường đã tồn tại");
        }

        existingRoute.setDepartureCity(updatedRoute.getDepartureCity());
        existingRoute.setDestinationCity(updatedRoute.getDestinationCity());
        existingRoute.setDepartureStation(updatedRoute.getDepartureStation());
        existingRoute.setDestinationStation(updatedRoute.getDestinationStation());
        existingRoute.setDistanceKm(updatedRoute.getDistanceKm());
        existingRoute.setDurationMinutes(updatedRoute.getDurationMinutes());
        existingRoute.setStatus(updatedRoute.getStatus());

        return routeRepository.save(existingRoute);
    }

    public void deleteRoute(Long id) {
        Route route = getRouteById(id);
        routeRepository.delete(route);
    }
}