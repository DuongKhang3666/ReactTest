package com.example.backend.service;

import com.example.backend.entity.Bus;
import com.example.backend.entity.Route;
import com.example.backend.entity.Trip;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    private static final BigDecimal MAX_PRICE = new BigDecimal("9999999999.99");

    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public TripService(
            TripRepository tripRepository,
            RouteRepository routeRepository,
            BusRepository busRepository,
            BookingRepository bookingRepository,
            TicketRepository ticketRepository
    ) {
        this.tripRepository = tripRepository;
        this.routeRepository = routeRepository;
        this.busRepository = busRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));
    }

    @Transactional
    public Trip createTrip(Trip trip) {
        if (trip.getId() != null) {
            throw new BadRequestException("Do not supply an id when creating a trip");
        }
        validateTrip(trip);

        Long routeId = trip.getRoute().getId();
        Long busId = trip.getBus().getId();

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + routeId));

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found: " + busId));

        trip.setRoute(route);
        trip.setBus(bus);

        Trip savedTrip = tripRepository.save(trip);

        return tripRepository.findById(savedTrip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + savedTrip.getId()));
    }

    @Transactional
    public Trip updateTrip(Long id, Trip updatedTrip) {
        validateTrip(updatedTrip);
        if (updatedTrip.getStatus() == null) {
            throw new BadRequestException("Trip status is required when updating a trip");
        }

        Trip existingTrip = getTripForUpdate(id);

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
  
    private Trip getTripForUpdate(Long id) {
        return tripRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));
    }

    private boolean hasBookingOrTicket(Long tripId) {
        return bookingRepository.existsByTripId(tripId) || ticketRepository.existsByTripId(tripId);
    }

    public List<Trip> getTripsByRouteAndDate(
            Long routeId,
            LocalDate date
    ) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        return tripRepository.findByRouteIdAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThan(
                routeId,
                start,
                end
        );
    }

    private void validateTrip(Trip trip) {

        if (trip.getRoute() == null || trip.getRoute().getId() == null) {
            throw new BadRequestException("Route is required");
        }

        if (trip.getBus() == null || trip.getBus().getId() == null) {
            throw new BadRequestException("Bus is required");
        }

        if (trip.getDepartureTime() == null || trip.getArrivalTime() == null) {
            throw new BadRequestException("Departure and arrival time are required");
        }

        if (!trip.getArrivalTime().isAfter(trip.getDepartureTime())) {
            throw new BadRequestException(
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
                .findByRoute_DepartureCityAndRoute_DestinationCityAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThan(
                        departureCity,
                        destinationCity,
                        start,
                        end
                );
    }
}
