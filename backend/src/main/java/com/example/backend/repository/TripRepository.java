package com.example.backend.repository;

import com.example.backend.entity.Trip;
import com.example.backend.enums.TripStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(
            value = "SELECT * FROM trips WHERE id = :id FOR UPDATE",
            nativeQuery = true
    )
    Optional<Trip> findByIdForUpdate(@Param("id") Long id);

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
    List<Trip> findByRouteIdAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThan(
            Long routeId,
            LocalDateTime start,
            LocalDateTime end
    );

    @EntityGraph(attributePaths = {"route", "bus"})
    List<Trip> findByRoute_DepartureCityAndRoute_DestinationCityAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThan(
            String departureCity,
            String destinationCity,
            LocalDateTime start,
            LocalDateTime end
    );
}