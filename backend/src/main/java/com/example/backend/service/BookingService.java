package com.example.backend.service;

import com.example.backend.dto.booking.AddTicketRequest;
import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.dto.booking.ConfirmBookingRequest;
import com.example.backend.dto.booking.CreateBookingRequest;
import com.example.backend.dto.booking.PassengerDetails;
import com.example.backend.dto.booking.TicketResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Seat;
import com.example.backend.entity.Ticket;
import com.example.backend.entity.Trip;
import com.example.backend.entity.User;
import com.example.backend.enums.BookingStatus;
import com.example.backend.enums.BusStatus;
import com.example.backend.enums.RouteStatus;
import com.example.backend.enums.SeatStatus;
import com.example.backend.enums.TicketStatus;
import com.example.backend.enums.TripStatus;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.HoldExpiredException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.SeatConflictException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SeatRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final SeatRepository seatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final long holdDurationMinutes;

    public BookingService(
            BookingRepository bookingRepository,
            TicketRepository ticketRepository,
            SeatRepository seatRepository,
            TripRepository tripRepository,
            UserRepository userRepository,
            @Value("${booking.hold-duration-minutes:10}") long holdDurationMinutes
    ) {
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.seatRepository = seatRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.holdDurationMinutes = holdDurationMinutes;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest request) {
        return reserve(userId, request.tripId(), null, request.seatId(), request.passengerName(), request.passengerPhone());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.findByUserIdOrderByBookedAtDesc(userId).stream()
                .map(booking -> response(booking, ticketRepository.findByBookingIdOrderById(booking.getId()), now))
                .filter(response -> response.status() != BookingStatus.PENDING
                        || response.tickets().stream().anyMatch(ticket -> ticket.status() == TicketStatus.RESERVED
                        && ticket.expiresAt() != null && ticket.expiresAt().isAfter(now)))
                .toList();
    }

    @Transactional
    public BookingResponse getBookingDetail(Long userId, Long bookingId) {
        Booking booking = getOwnedBooking(userId, bookingId);
        return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
    }

    @Transactional
    public BookingResponse reserveSeat(Long userId, Long bookingId, AddTicketRequest request) {
        Booking preview = findBooking(bookingId);
        return reserve(userId, preview.getTrip().getId(), bookingId, request.seatId(),
                request.passengerName(), request.passengerPhone());
    }

    @Transactional
    public BookingResponse releaseSeat(Long userId, Long bookingId, Long ticketId) {
        Booking preview = findBooking(bookingId);
        Ticket ticketPreview = findTicket(ticketId);
        if (!ticketPreview.getBooking().getId().equals(bookingId)) {
            throw new ResourceNotFoundException("Ticket not found in booking: " + ticketId);
        }
        
        getOwnedBooking(userId, bookingId);

        Trip trip = lockTrip(preview.getTrip().getId());
        lockSeats(trip, List.of(ticketPreview.getSeat().getId()));
        Booking booking = lockOwnedPendingBooking(userId, bookingId);
        Ticket ticket = ticketRepository.findByIdForUpdate(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        if (ticket.getStatus() == TicketStatus.RESERVED) {
            ticket.setStatus(TicketStatus.AVAILABLE);
            ticket.setExpiresAt(null);
            ticketRepository.save(ticket);
            updateTotal(booking, ticketRepository.findByBookingIdForUpdate(bookingId));
        } else if (ticket.getStatus() != TicketStatus.AVAILABLE) {
            throw new BadRequestException("Only a pending reserved ticket can be released");
        }
        return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
    }

    @Transactional(noRollbackFor = HoldExpiredException.class)
    public BookingResponse confirmBooking(Long userId, Long bookingId, ConfirmBookingRequest request) {
        Booking preview = findBooking(bookingId);
        if (preview.getStatus() == BookingStatus.CONFIRMED) {
            requireOwner(userId, preview);
            return response(preview, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
        }

        etOwnedBooking(userId, bookingId);
        
        List<Ticket> previews = ticketRepository.findByBookingIdOrderById(bookingId);
        Trip trip = lockTrip(preview.getTrip().getId());
        lockSeats(trip, seatIds(previews));
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
        }
        requirePending(booking);
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        LocalDateTime now = LocalDateTime.now();
        Map<Long, PassengerDetails> passengers = passengerMap(request);
        List<Ticket> reserved = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.RESERVED).toList();
        if (reserved.isEmpty()) {
            throw new BadRequestException("Booking has no reserved tickets to confirm");
        }
        boolean expired = false;
        for (Ticket ticket : reserved) {
            if (ticket.getExpiresAt() == null || !ticket.getExpiresAt().isAfter(now)) {
                if (ticket.getExpiresAt() != null) {
                    ticket.setStatus(TicketStatus.AVAILABLE);
                    ticket.setExpiresAt(null);
                }
                expired = true;
            }
        }
        if (expired) {
            updateTotal(booking, tickets);
            ticketRepository.saveAll(tickets);
            throw new HoldExpiredException("A seat hold has expired; reserve the seat again before confirming");
        }
        for (Long ticketId : passengers.keySet()) {
            if (reserved.stream().noneMatch(ticket -> ticket.getId().equals(ticketId))) {
                throw new BadRequestException("Passenger details reference a ticket that is not reserved");
            }
        }
        for (Ticket ticket : reserved) {
            PassengerDetails passenger = passengers.get(ticket.getId());
            if (passenger != null) {
                ticket.setPassengerName(passenger.passengerName().trim());
                ticket.setPassengerPhone(normalize(passenger.passengerPhone()));
            }
            if (ticket.getPassengerName() == null || ticket.getPassengerName().isBlank()) {
                throw new BadRequestException("Passenger name is required for ticket " + ticket.getId());
            }
        }
        for (Ticket ticket : reserved) {
            ticket.setStatus(TicketStatus.CONFIRMED);
            ticket.setExpiresAt(null);
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalAmount(sumPrices(reserved));
        ticketRepository.saveAll(reserved);
        bookingRepository.save(booking);
        ticketRepository.flush();
        return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), now);
    }

    @Transactional
    public BookingResponse cancelBooking(Long userId, Long bookingId) {
        Booking preview = findBooking(bookingId);

        getOwnedBooking(userId, bookingId);

        List<Ticket> previews = ticketRepository.findByBookingIdOrderById(bookingId);
        Trip trip = lockTrip(preview.getTrip().getId());
        lockSeats(trip, seatIds(previews));
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
        }
        ensureCancellationAllowed(booking.getTrip());
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == TicketStatus.RESERVED || ticket.getStatus() == TicketStatus.CONFIRMED) {
                ticket.setStatus(TicketStatus.CANCELLED);
                ticket.setExpiresAt(null);
                ticket.setCancelledAt(now);
            }
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setTotalAmount(BigDecimal.ZERO);
        booking.setCancelledAt(now);
        ticketRepository.saveAll(tickets);
        bookingRepository.save(booking);
        return response(booking, tickets, now);
    }

    @Transactional
    public BookingResponse cancelTicket(Long userId, Long bookingId, Long ticketId) {
        Booking preview = findBooking(bookingId);
        Ticket ticketPreview = findTicket(ticketId);
        if (!ticketPreview.getBooking().getId().equals(bookingId)) {
            throw new ResourceNotFoundException("Ticket not found in booking: " + ticketId);
        }

        getOwnedBooking(userId, bookingId);

        Trip trip = lockTrip(preview.getTrip().getId());
        lockSeats(trip, List.of(ticketPreview.getSeat().getId()));
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
        }
        ensureCancellationAllowed(booking.getTrip());
        Ticket ticket = ticketRepository.findByIdForUpdate(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            return response(booking, ticketRepository.findByBookingIdOrderById(bookingId), LocalDateTime.now());
        }
        if (ticket.getStatus() != TicketStatus.CONFIRMED) {
            throw new BadRequestException("Only a confirmed ticket can be cancelled");
        }
        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setCancelledAt(now);
        ticket.setExpiresAt(null);
        ticketRepository.save(ticket);
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        boolean hasConfirmed = tickets.stream().anyMatch(item -> item.getStatus() == TicketStatus.CONFIRMED);
        booking.setTotalAmount(sumPrices(tickets.stream()
                .filter(item -> item.getStatus() == TicketStatus.CONFIRMED).toList()));
        if (!hasConfirmed) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(now);
        }
        bookingRepository.save(booking);
        return response(booking, tickets, now);
    }

    @Scheduled(fixedDelayString = "${booking.cleanup-interval-ms:30000}")
    @Transactional
    public void cleanupExpiredHolds() {
        LocalDateTime now = LocalDateTime.now();
        for (Long ticketId : ticketRepository.findExpiredIds(TicketStatus.RESERVED, now)) {
            Ticket preview = ticketRepository.findById(ticketId).orElse(null);
            if (preview == null) {
                continue;
            }
            Trip trip = lockTrip(preview.getTrip().getId());
            lockSeats(trip, List.of(preview.getSeat().getId()));
            Booking booking = bookingRepository.findByIdForUpdate(preview.getBooking().getId()).orElse(null);
            Ticket ticket = ticketRepository.findByIdForUpdate(ticketId).orElse(null);
            if (booking != null && ticket != null && ticket.getStatus() == TicketStatus.RESERVED
                    && ticket.getExpiresAt() != null && !ticket.getExpiresAt().isAfter(now)) {
                ticket.setStatus(TicketStatus.AVAILABLE);
                ticket.setExpiresAt(null);
                ticketRepository.save(ticket);
                updateTotal(booking, ticketRepository.findByBookingIdForUpdate(booking.getId()));
            }
        }
        for (Long bookingId : bookingRepository.findIdsForEndedTrips(BookingStatus.PENDING, now)) {
            cancelPendingBookingAfterTrip(bookingId, now);
        }
    }

private BookingResponse reserve(
        Long userId,
        Long tripId,
        Long requestedBookingId,
        Long seatId,
        String passengerName,
        String passengerPhone
) {
    // Find the booking before acquiring any trip/seat locks.
    // If the caller explicitly provided a booking ID, verify ownership first.
    Booking preview = requestedBookingId == null
            ? bookingRepository.findByUserIdOrderByBookedAtDesc(userId).stream()
                .filter(item -> item.getTrip().getId().equals(tripId)
                        && item.getStatus() == BookingStatus.PENDING)
                .findFirst()
                .orElse(null)
            : findBooking(requestedBookingId);

    if (requestedBookingId != null) {
        // Ownership pre-check: reject unauthorized requests before acquiring locks.
        requireOwner(userId, preview);
    }

    Trip trip = lockTrip(tripId);
    ensureTripBookable(trip);

    if (preview != null && !preview.getTrip().getId().equals(tripId)) {
        throw new BadRequestException("Booking belongs to a different trip");
    }

    List<Ticket> previewTickets = preview == null
            ? List.of()
            : ticketRepository.findByBookingIdOrderById(preview.getId());

    List<Long> seatIds = new ArrayList<>(seatIds(previewTickets));
    seatIds.add(seatId);

    Map<Long, Seat> lockedSeats = lockSeats(trip, seatIds);

    Seat seat = lockedSeats.get(seatId);
    if (seat == null || seat.getStatus() != SeatStatus.ACTIVE) {
        throw new BadRequestException("Seat is not active for this trip");
    }

    Booking booking;

    if (requestedBookingId != null) {
        booking = lockBooking(requestedBookingId);

        // Ownership re-check after acquiring locks.
        requireOwner(userId, booking);
        requirePending(booking);

    } else if (preview != null) {
        booking = bookingRepository.findByIdForUpdate(preview.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found: " + preview.getId()
                        )
                );

        // Ownership re-check after acquiring locks.
        requireOwner(userId, booking);
        requirePending(booking);

    } else {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + userId
                        )
                );

        booking = new Booking();
        booking.setBookingCode(
                "BK" + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 20)
        );
        booking.setUser(user);
        booking.setTrip(trip);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(BigDecimal.ZERO);

        booking = bookingRepository.saveAndFlush(booking);
    }

    List<Ticket> bookingTickets =
            ticketRepository.findByBookingIdForUpdate(booking.getId());

    LocalDateTime now = LocalDateTime.now();

    for (Ticket item : bookingTickets) {
        if (item.getStatus() == TicketStatus.RESERVED
                && item.getExpiresAt() != null
                && !item.getExpiresAt().isAfter(now)) {

            item.setStatus(TicketStatus.AVAILABLE);
            item.setExpiresAt(null);
        }
    }

    ticketRepository.saveAll(bookingTickets);
    ticketRepository.flush();

    List<Ticket> seatTickets =
            ticketRepository.findForSeatForUpdate(tripId, seatId);

    for (Ticket other : seatTickets) {
        if (other.getStatus() == TicketStatus.RESERVED
                && other.getExpiresAt() != null
                && !other.getExpiresAt().isAfter(now)) {

            other.setStatus(TicketStatus.AVAILABLE);
            other.setExpiresAt(null);
            ticketRepository.saveAndFlush(other);

        } else if (other.getStatus() == TicketStatus.CONFIRMED
                || other.getStatus() == TicketStatus.RESERVED
                && other.getExpiresAt() != null
                && other.getExpiresAt().isAfter(now)) {

            if (other.getBooking().getId().equals(booking.getId())
                    && other.getStatus() == TicketStatus.RESERVED) {

                return response(
                        booking,
                        ticketRepository.findByBookingIdOrderById(
                                booking.getId()
                        ),
                        now
                );
            }

            throw new SeatConflictException(
                    "Seat " + seat.getSeatNumber() + " is no longer available"
            );
        }
    }

    Ticket ticket = ticketRepository
            .findByBookingIdAndSeatId(booking.getId(), seatId)
            .orElse(null);

    if (ticket != null && ticket.getStatus() == TicketStatus.CANCELLED) {
        throw new SeatConflictException(
                "This ticket was cancelled and cannot be reused"
        );
    }

    if (ticket == null) {
        ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setTrip(trip);
        ticket.setSeat(seat);
        ticket.setPrice(trip.getPrice());
    }

    ticket.setPassengerName(normalize(passengerName));
    ticket.setPassengerPhone(normalize(passengerPhone));
    ticket.setStatus(TicketStatus.RESERVED);

    LocalDateTime expiresAt = now.plusMinutes(holdDurationMinutes);
    ticket.setExpiresAt(expiresAt);

    try {
        ticketRepository.saveAndFlush(ticket);
    } catch (DataIntegrityViolationException exception) {
        throw new SeatConflictException(
                "Seat " + seat.getSeatNumber() + " is no longer available",
                exception
        );
    }

    List<Ticket> refreshedTickets =
            ticketRepository.findByBookingIdForUpdate(booking.getId());

    for (Ticket item : refreshedTickets) {
        if (item.getStatus() == TicketStatus.RESERVED) {
            item.setExpiresAt(expiresAt);
        }
    }

    updateTotal(booking, refreshedTickets);
    ticketRepository.saveAll(refreshedTickets);
    bookingRepository.save(booking);

    return response(booking, refreshedTickets, now);
}


    private void cancelPendingBookingAfterTrip(Long bookingId, LocalDateTime now) {
        Booking preview = bookingRepository.findById(bookingId).orElse(null);
        if (preview == null) {
            return;
        }
        Trip trip = lockTrip(preview.getTrip().getId());
        List<Ticket> previewTickets = ticketRepository.findByBookingIdOrderById(bookingId);
        lockSeats(trip, seatIds(previewTickets));
        Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElse(null);
        if (booking == null || booking.getStatus() != BookingStatus.PENDING
                || booking.getTrip().getArrivalTime().isAfter(now)) {
            return;
        }
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == TicketStatus.RESERVED) {
                ticket.setStatus(TicketStatus.AVAILABLE);
                ticket.setExpiresAt(null);
            }
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(now);
        booking.setTotalAmount(BigDecimal.ZERO);
        ticketRepository.saveAll(tickets);
        bookingRepository.save(booking);
    }

    private void updateTotal(Booking booking, Collection<Ticket> tickets) {
        booking.setTotalAmount(sumPrices(tickets.stream()
                .filter(ticket -> ticket.getStatus() == TicketStatus.RESERVED
                        || ticket.getStatus() == TicketStatus.CONFIRMED)
                .toList()));
        bookingRepository.save(booking);
    }

    private BigDecimal sumPrices(Collection<Ticket> tickets) {
        return tickets.stream().map(Ticket::getPrice).filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BookingResponse response(Booking booking, List<Ticket> tickets, LocalDateTime now) {
        List<TicketResponse> visibleTickets = tickets.stream()
                .filter(ticket -> ticket.getStatus() != TicketStatus.AVAILABLE)
                .filter(ticket -> ticket.getStatus() != TicketStatus.RESERVED
                        || ticket.getExpiresAt() != null && ticket.getExpiresAt().isAfter(now))
                .map(ticket -> new TicketResponse(
                        ticket.getId(), ticket.getSeat().getId(), ticket.getSeat().getSeatNumber(),
                        ticket.getPassengerName(), ticket.getPassengerPhone(), ticket.getPrice(), ticket.getStatus(),
                        ticket.getExpiresAt(), ticket.getCancelledAt()
                ))
                .toList();
        return new BookingResponse(booking.getId(), booking.getBookingCode(), booking.getTrip().getId(),
                booking.getTotalAmount(), booking.getStatus(), booking.getBookedAt(), booking.getCancelledAt(),
                visibleTickets);
    }

    private Map<Long, PassengerDetails> passengerMap(ConfirmBookingRequest request) {
        Map<Long, PassengerDetails> passengers = new LinkedHashMap<>();
        if (request == null || request.passengers() == null) {
            return passengers;
        }
        for (PassengerDetails passenger : request.passengers()) {
            if (passengers.putIfAbsent(passenger.ticketId(), passenger) != null) {
                throw new BadRequestException("Passenger details contain a duplicate ticket");
            }
        }
        return passengers;
    }

    private Trip lockTrip(Long tripId) {
        return tripRepository.findByIdForUpdate(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
    }

    private Map<Long, Seat> lockSeats(Trip trip, Collection<Long> seatIds) {
        Map<Long, Seat> locked = new HashMap<>();
        seatIds.stream().distinct().sorted().forEach(seatId -> {
            Seat seat = seatRepository.findByIdForUpdate(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + seatId));
            if (!seat.getBus().getId().equals(trip.getBus().getId())) {
                throw new BadRequestException("Seat does not belong to this trip's bus");
            }
            locked.put(seatId, seat);
        });
        return locked;
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
    }

    private Ticket findTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
    }

    private Booking getOwnedBooking(Long userId, Long bookingId) {
        Booking booking = findBooking(bookingId);
        requireOwner(userId, booking);
        return booking;
    }

    private Booking lockBooking(Long bookingId) {
        return bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
    }

    private Booking lockOwnedPendingBooking(Long userId, Long bookingId) {
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);
        requirePending(booking);
        return booking;
    }

    private void requireOwner(Long userId, Booking booking) {
        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You cannot access this booking");
        }
    }

    private void requirePending(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only a pending booking can be changed");
        }
    }

    private void ensureTripBookable(Trip trip) {
        LocalDateTime now = LocalDateTime.now();
        if (trip.getStatus() != TripStatus.SCHEDULED || !trip.getDepartureTime().isAfter(now)) {
            throw new BadRequestException("Trip is not open for booking");
        }
        if (trip.getBus().getStatus() != BusStatus.ACTIVE
                || trip.getRoute().getStatus() != RouteStatus.ACTIVE) {
            throw new BadRequestException("Trip is not open for booking");
        }
    }

    private void ensureCancellationAllowed(Trip trip) {
        if (!trip.getDepartureTime().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Tickets can no longer be cancelled after trip departure");
        }
    }

    private List<Long> seatIds(List<Ticket> tickets) {
        return tickets.stream().map(ticket -> ticket.getSeat().getId()).distinct().sorted().toList();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}