package com.example.backend.repository;

import com.example.backend.entity.Trip;
import com.example.backend.entity.TripStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {

    @Override
    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findAll();

    @Override
    @EntityGraph(attributePaths = {"route", "bus"})
    Optional<Trip> findById(Long id);

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByRouteId(Long routeId);

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByBusId(Long busId);

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByStatus(TripStatus status);

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByDepartureTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByRouteIdAndDepartureTimeBetween(
            Long routeId,
            LocalDateTime start,
            LocalDateTime end
    );

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByRoute_DepartureCityAndRoute_DestinationCityAndDepartureTimeBetween(
            String departureCity,
            String destinationCity,
            LocalDateTime start,
            LocalDateTime end
    );
}