package com.example.backend.service;

import com.example.backend.entity.Bus;
import com.example.backend.entity.Route;
import com.example.backend.entity.Trip;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;

    public TripService(
            TripRepository tripRepository,
            RouteRepository routeRepository,
            BusRepository busRepository
    ) {
        this.tripRepository = tripRepository;
        this.routeRepository = routeRepository;
        this.busRepository = busRepository;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public Trip createTrip(Trip trip) {
        validateTrip(trip);

        Long routeId = trip.getRoute().getId();
        Long busId = trip.getBus().getId();

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        trip.setRoute(route);
        trip.setBus(bus);

        Trip savedTrip = tripRepository.save(trip);

        return tripRepository.findById(savedTrip.getId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public Trip updateTrip(Long id, Trip updatedTrip) {
        validateTrip(updatedTrip);

        Trip existingTrip = getTripById(id);

        Long routeId = updatedTrip.getRoute().getId();
        Long busId = updatedTrip.getBus().getId();

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        existingTrip.setRoute(route);
        existingTrip.setBus(bus);
        existingTrip.setDepartureTime(updatedTrip.getDepartureTime());
        existingTrip.setArrivalTime(updatedTrip.getArrivalTime());
        existingTrip.setPrice(updatedTrip.getPrice());
        existingTrip.setStatus(updatedTrip.getStatus());
        existingTrip.setNotes(updatedTrip.getNotes());

        Trip savedTrip = tripRepository.save(existingTrip);

        return tripRepository.findById(savedTrip.getId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public void deleteTrip(Long id) {
        Trip trip = getTripById(id);
        tripRepository.delete(trip);
    }

    public List<Trip> getTripsByRouteAndDate(
            Long routeId,
            LocalDate date
    ) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        return tripRepository.findByRouteIdAndDepartureTimeBetween(
                routeId,
                start,
                end
        );
    }

    private void validateTrip(Trip trip) {

        if (trip.getRoute() == null || trip.getRoute().getId() == null) {
            throw new RuntimeException("Route is required");
        }

        if (trip.getBus() == null || trip.getBus().getId() == null) {
            throw new RuntimeException("Bus is required");
        }

        if (trip.getDepartureTime() == null || trip.getArrivalTime() == null) {
            throw new RuntimeException("Departure and arrival time are required");
        }

        if (!trip.getArrivalTime().isAfter(trip.getDepartureTime())) {
            throw new RuntimeException(
                    "Arrival time must be after departure time"
            );
        }

        if (trip.getPrice() == null || trip.getPrice().signum() < 0) {
            throw new RuntimeException("Price must be greater than or equal to 0");
        }
    }

    public List<Trip> searchTrips(
            String departureCity,
            String destinationCity,
            LocalDate date
    ) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        return tripRepository
                .findByRoute_DepartureCityAndRoute_DestinationCityAndDepartureTimeBetween(
                        departureCity,
                        destinationCity,
                        start,
                        end
                );
    }
}