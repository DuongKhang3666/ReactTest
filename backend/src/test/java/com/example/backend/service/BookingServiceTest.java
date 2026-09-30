package com.example.backend.service;

import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.dto.booking.CreateBookingRequest;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Bus;
import com.example.backend.entity.Route;
import com.example.backend.entity.Seat;
import com.example.backend.entity.Ticket;
import com.example.backend.entity.Trip;
import com.example.backend.entity.User;
import com.example.backend.enums.BookingStatus;
import com.example.backend.enums.BusStatus;
import com.example.backend.enums.Role;
import com.example.backend.enums.RouteStatus;
import com.example.backend.enums.SeatStatus;
import com.example.backend.enums.SeatType;
import com.example.backend.enums.TicketStatus;
import com.example.backend.enums.TripStatus;
import com.example.backend.exception.HoldExpiredException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SeatRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private TripRepository tripRepository;
    @Mock
    private UserRepository userRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository, ticketRepository, seatRepository, tripRepository, userRepository, 10
        );
    }

    @Test
    void repeatedReserveKeepsTicketAndHoldExpiry() {
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(4);
        Bus bus = new Bus("TST-001", "Sleeper", 1, null, BusStatus.ACTIVE);
        Route route = new Route("A", "B", null, null, null, null, RouteStatus.ACTIVE);
        Trip trip = new Trip(route, bus, LocalDateTime.now().plusHours(2),
                LocalDateTime.now().plusHours(5), BigDecimal.valueOf(100), TripStatus.SCHEDULED, null);
        setId(bus, 5L);
        setId(trip, 11L);
        Seat seat = Seat.builder().id(31L).bus(bus).seatNumber("A01").seatType(SeatType.REGULAR)
                .status(SeatStatus.ACTIVE).floorNumber(1).build();
        User user = mock(User.class);
        when(user.getId()).thenReturn(3L);
        Booking booking = new Booking();
        booking.setId(7L);
        booking.setUser(user);
        booking.setTrip(trip);
        booking.setBookingCode("BK-7");
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(BigDecimal.valueOf(100));
        Ticket ticket = new Ticket();
        ticket.setId(41L);
        ticket.setBooking(booking);
        ticket.setTrip(trip);
        ticket.setSeat(seat);
        ticket.setPrice(BigDecimal.valueOf(100));
        ticket.setStatus(TicketStatus.RESERVED);
        ticket.setExpiresAt(expiresAt);

        when(tripRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(trip));
        when(bookingRepository.findByUserIdOrderByBookedAtDesc(3L)).thenReturn(List.of(booking));
        when(ticketRepository.findByBookingIdOrderById(7L)).thenReturn(List.of(ticket));
        when(seatRepository.findByIdForUpdate(31L)).thenReturn(Optional.of(seat));
        when(bookingRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(booking));
        when(ticketRepository.findByBookingIdForUpdate(7L)).thenReturn(List.of(ticket));
        when(ticketRepository.findForSeatForUpdate(11L, 31L)).thenReturn(List.of(ticket));

        BookingResponse response = bookingService.createBooking(3L,
                new CreateBookingRequest(11L, 31L, null, null));

        assertEquals(7L, response.id());
        assertEquals(1, response.tickets().size());
        assertEquals(41L, response.tickets().get(0).id());
        assertEquals(expiresAt, response.tickets().get(0).expiresAt());
        verify(ticketRepository).findForSeatForUpdate(11L, 31L);
    }

    @Test
    void expiredTicketPreventsPartialBookingConfirmation() {
        LocalDateTime now = LocalDateTime.now();
        Bus bus = new Bus("TST-003", "Sleeper", 2, null, BusStatus.ACTIVE);
        Route route = new Route("A", "B", null, null, null, null, RouteStatus.ACTIVE);
        Trip trip = new Trip(route, bus, now.plusHours(2), now.plusHours(5),
                BigDecimal.valueOf(100), TripStatus.SCHEDULED, null);
        setId(bus, 5L);
        setId(trip, 12L);
        Seat firstSeat = Seat.builder().id(31L).bus(bus).seatNumber("A01").seatType(SeatType.REGULAR)
                .status(SeatStatus.ACTIVE).floorNumber(1).build();
        Seat secondSeat = Seat.builder().id(32L).bus(bus).seatNumber("A02").seatType(SeatType.REGULAR)
                .status(SeatStatus.ACTIVE).floorNumber(1).build();
        User user = mock(User.class);
        when(user.getId()).thenReturn(3L);
        Booking booking = new Booking();
        booking.setId(8L);
        booking.setUser(user);
        booking.setTrip(trip);
        booking.setBookingCode("BK-8");
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(BigDecimal.valueOf(200));
        Ticket expired = ticket(51L, booking, trip, firstSeat, now.minusSeconds(1));
        Ticket live = ticket(52L, booking, trip, secondSeat, now.plusMinutes(5));

        when(bookingRepository.findById(8L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(booking));
        when(tripRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(trip));
        when(ticketRepository.findByBookingIdOrderById(8L)).thenReturn(List.of(expired, live));
        when(seatRepository.findByIdForUpdate(31L)).thenReturn(Optional.of(firstSeat));
        when(seatRepository.findByIdForUpdate(32L)).thenReturn(Optional.of(secondSeat));
        when(ticketRepository.findByBookingIdForUpdate(8L)).thenReturn(List.of(expired, live));

        assertThrows(HoldExpiredException.class, () -> bookingService.confirmBooking(3L, 8L, null));

        assertEquals(TicketStatus.AVAILABLE, expired.getStatus());
        assertEquals(null, expired.getExpiresAt());
        assertEquals(TicketStatus.RESERVED, live.getStatus());
        assertEquals(BookingStatus.PENDING, booking.getStatus());
        assertEquals(BigDecimal.valueOf(100), booking.getTotalAmount());
    }

    private Ticket ticket(Long id, Booking booking, Trip trip, Seat seat, LocalDateTime expiresAt) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setBooking(booking);
        ticket.setTrip(trip);
        ticket.setSeat(seat);
        ticket.setPrice(BigDecimal.valueOf(100));
        ticket.setPassengerName("Passenger");
        ticket.setStatus(TicketStatus.RESERVED);
        ticket.setExpiresAt(expiresAt);
        return ticket;
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