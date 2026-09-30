package com.example.backend.service;

import com.example.backend.dto.seat.SeatAvailability;
import com.example.backend.entity.Seat;
import com.example.backend.entity.Trip;
import com.example.backend.enums.SeatStatus;
import com.example.backend.enums.TicketStatus;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.SeatRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SeatService {

    private final TripRepository tripRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;

    public SeatService(TripRepository tripRepository, SeatRepository seatRepository, TicketRepository ticketRepository) {
        this.tripRepository = tripRepository;
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public List<SeatAvailability> getAvailability(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        LocalDateTime now = LocalDateTime.now();
        Map<Long, String> occupied = new HashMap<>();
        for (Object[] row : ticketRepository.findAvailabilityRows(
                tripId, List.of(TicketStatus.RESERVED, TicketStatus.CONFIRMED))) {
            TicketStatus status = (TicketStatus) row[1];
            LocalDateTime expiresAt = (LocalDateTime) row[2];
            if (status == TicketStatus.CONFIRMED || (expiresAt != null && expiresAt.isAfter(now))) {
                occupied.put((Long) row[0], status == TicketStatus.CONFIRMED ? "BOOKED" : "HELD");
            }
        }
        return seatRepository.findByBusIdOrderByFloorNumberAscRowNumberAscColumnNumberAscSeatNumberAsc(
                        trip.getBus().getId())
                .stream()
                .map(seat -> {
                    String availability = seat.getStatus() == SeatStatus.INACTIVE
                            ? "INACTIVE"
                            : occupied.getOrDefault(seat.getId(), "AVAILABLE");
                    return SeatAvailability.from(seat, availability);
                })
                .toList();
    }
}