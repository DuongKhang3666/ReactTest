package com.example.backend.repository;

import com.example.backend.dto.error.ConflictSeat;
import com.example.backend.entity.Ticket;
import com.example.backend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByTripId(Long tripId);

    @Query("select distinct new com.example.backend.dto.error.ConflictSeat(t.seat.id, t.seat.seatNumber) "
            + "from Ticket t where t.trip.id = :tripId and t.seat.id in :seatIds "
            + "and t.status in :statuses order by t.seat.id")
    List<ConflictSeat> findConflictingSeats(
            @Param("tripId") Long tripId, @Param("seatIds") Collection<Long> seatIds,
            @Param("statuses") Collection<TicketStatus> statuses);

    @Query(
      value = "SELECT * FROM tickets WHERE id = :id FOR UPDATE",
      nativeQuery = true
    )
    Optional<Ticket> findByIdForUpdate(@Param("id") Long id);


   @Query(value = """
        SELECT *
        FROM tickets
        WHERE trip_id = :tripId
          AND seat_id IN (:seatIds)
          AND status IN (:statuses)
        ORDER BY seat_id
        FOR UPDATE
        """, nativeQuery = true)
    List<Ticket> findOccupiedForSeatsForUpdate(
            @Param("tripId") Long tripId,
            @Param("seatIds") Collection<Long> seatIds,
            @Param("statuses") Collection<String> statuses
    );

    @Query(
      value = """
        SELECT *
        FROM tickets
        WHERE booking_id = :bookingId
        ORDER BY id
        FOR UPDATE
        """,
      nativeQuery = true
    )
    List<Ticket> findByBookingIdForUpdate(@Param("bookingId") Long bookingId);

    @Query("select t.seat.id from Ticket t where t.trip.id = :tripId and t.status in :statuses")
    List<Long> findOccupiedSeatIds(@Param("tripId") Long tripId,
                                   @Param("statuses") Collection<TicketStatus> statuses);

    Optional<Ticket> findByBookingIdAndSeatId(Long bookingId, Long seatId);

    List<Ticket> findByBookingIdOrderById(Long bookingId);

    List<Ticket> findByTripIdAndStatus(Long tripId, TicketStatus status);

    @Query("select t.seat.id from Ticket t where t.trip.id = :tripId and t.status = :status")
    List<Long> findSeatIdsByTripIdAndStatus(@Param("tripId") Long tripId, @Param("status") TicketStatus status);
}
