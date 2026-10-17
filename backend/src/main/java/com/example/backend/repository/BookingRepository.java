package com.example.backend.repository;

import com.example.backend.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByTripId(Long tripId);

    @Query(
        value = "SELECT * FROM bookings WHERE id = :id FOR UPDATE",
        nativeQuery = true
    )
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = {"trip", "trip.route", "trip.bus"})
    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);
}
