package com.example.backend.repository;

import com.example.backend.entity.Booking;
import com.example.backend.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.user.id = :userId and b.trip.id = :tripId and b.status = :status")
    Optional<Booking> findPendingForUpdate(
            @Param("userId") Long userId,
            @Param("tripId") Long tripId,
            @Param("status") BookingStatus status
    );

    @EntityGraph(attributePaths = {"trip", "trip.route", "trip.bus"})
    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);

    @Query("select b.id from Booking b where b.status = :status and b.trip.arrivalTime <= :now")
    List<Long> findIdsForEndedTrips(@Param("status") BookingStatus status, @Param("now") LocalDateTime now);
}