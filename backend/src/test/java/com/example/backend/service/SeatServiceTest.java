package com.example.backend.service;

import com.example.backend.dto.seat.SeatAvailability;
import com.example.backend.entity.Bus;
import com.example.backend.entity.Route;
import com.example.backend.entity.Seat;
import com.example.backend.entity.Trip;
import com.example.backend.enums.BusStatus;
import com.example.backend.enums.RouteStatus;
import com.example.backend.enums.SeatStatus;
import com.example.backend.enums.SeatType;
import com.example.backend.enums.TripStatus;
import com.example.backend.repository.SeatRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private TripRepository tripRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private TicketRepository ticketRepository;
    @InjectMocks
    private SeatService seatService;

    @Test
    void availabilityContainsReservedAndConfirmedBookingsAsOccupied() {
        Bus bus = new Bus("TST-002", "Sleeper", 3, null, BusStatus.ACTIVE);
        setId(bus, 5L);
        Route route = new Route("A", "B", null, null, null, null, RouteStatus.ACTIVE);
        Trip trip = new Trip(route, bus, LocalDateTime.now().plusHours(2),
                LocalDateTime.now().plusHours(5), BigDecimal.TEN, TripStatus.SCHEDULED, null);
        List<Seat> seats = List.of(
                seat(1L, bus, "A01", SeatStatus.ACTIVE),
                seat(2L, bus, "A02", SeatStatus.ACTIVE),
                seat(3L, bus, "A03", SeatStatus.INACTIVE)
        );
        when(tripRepository.findById(20L)).thenReturn(Optional.of(trip));
        when(ticketRepository.findOccupiedSeatIds(20L, List.of(com.example.backend.enums.TicketStatus.RESERVED, com.example.backend.enums.TicketStatus.CONFIRMED)))
                .thenReturn(List.of(2L));
        when(seatRepository.findByBusIdOrderByFloorNumberAscRowNumberAscColumnNumberAscSeatNumberAsc(5L))
                .thenReturn(seats);

        Map<Long, SeatAvailability> availability = seatService.getAvailability(20L).stream()
                .collect(Collectors.toMap(SeatAvailability::seatId, Function.identity()));

        assertEquals("AVAILABLE", availability.get(1L).status());
        assertEquals("BOOKED", availability.get(2L).status());
        assertEquals("INACTIVE", availability.get(3L).status());
        verify(ticketRepository).findOccupiedSeatIds(
                20L, List.of(com.example.backend.enums.TicketStatus.RESERVED, com.example.backend.enums.TicketStatus.CONFIRMED));
    }

    private Seat seat(Long id, Bus bus, String number, SeatStatus status) {
        return Seat.builder().id(id).bus(bus).seatNumber(number).seatType(SeatType.REGULAR)
                .status(status).floorNumber(1).build();
    }

    private void setId(Object entity, Long id) {
        try {
            var idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
}
