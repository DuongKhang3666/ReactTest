package com.example.backend.repository;

import com.example.backend.entity.Ticket;
import com.example.backend.enums.TicketStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.id = :id")
    Optional<Ticket> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.trip.id = :tripId and t.seat.id = :seatId order by t.id")
    List<Ticket> findForSeatForUpdate(@Param("tripId") Long tripId, @Param("seatId") Long seatId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.booking.id = :bookingId order by t.seat.id, t.id")
    List<Ticket> findByBookingIdForUpdate(@Param("bookingId") Long bookingId);

    Optional<Ticket> findByBookingIdAndSeatId(Long bookingId, Long seatId);

    List<Ticket> findByBookingIdOrderById(Long bookingId);

    List<Ticket> findByTripIdAndStatusIn(Long tripId, Collection<TicketStatus> statuses);

    @Query("select t.id from Ticket t where t.status = :status and t.expiresAt <= :now order by t.trip.id, t.seat.id")
    List<Long> findExpiredIds(@Param("status") TicketStatus status, @Param("now") LocalDateTime now);

    @Query("select t.seat.id, t.status, t.expiresAt from Ticket t where t.trip.id = :tripId and t.status in :statuses")
    List<Object[]> findAvailabilityRows(
            @Param("tripId") Long tripId,
            @Param("statuses") Collection<TicketStatus> statuses
    );
}