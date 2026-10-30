package com.example.backend.service;

import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.dto.booking.CreateBookingRequest;
import com.example.backend.dto.booking.PassengerDetails;
import com.example.backend.dto.booking.TicketResponse;
import com.example.backend.dto.error.ConflictSeat;
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
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.SeatConflictException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SeatRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.repository.TripRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolationException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingService {

    private static final BigDecimal MAX_TOTAL_AMOUNT = new BigDecimal("9999999999.99");

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final SeatRepository seatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final Validator validator;
    private final TransactionTemplate submissionTransaction;

    public BookingService(
            BookingRepository bookingRepository,
            TicketRepository ticketRepository,
            SeatRepository seatRepository,
            TripRepository tripRepository,
            UserRepository userRepository,
            Validator validator,
            PlatformTransactionManager transactionManager
    ) {
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.seatRepository = seatRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.validator = validator;
        this.submissionTransaction = new TransactionTemplate(transactionManager);
        this.submissionTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        // Seat row locks serialize competing requests for the same seat. READ_COMMITTED
        // avoids empty-range gap locks deadlocking inserts for unrelated seats in MySQL.
        this.submissionTransaction.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
    }

    public BookingResponse createBooking(
            Long userId,
            CreateBookingRequest request
    ) {
        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        try {
            return submissionTransaction.execute(status -> createBookingInTransaction(userId, request));
        } catch (DataIntegrityViolationException exception) {
            if (!OccupiedSeatConstraint.matches(exception)) {
                throw exception;
            }
            // execute() has rolled back the failed insert before this fresh transaction reads.
            List<ConflictSeat> conflicts = submissionTransaction.execute(status ->
                    ticketRepository.findConflictingSeats(request.tripId(), request.seatIds(),
                            List.of(TicketStatus.RESERVED, TicketStatus.CONFIRMED)));
            throw new SeatConflictException("Một hoặc nhiều ghế đã chọn không còn trống", conflicts);
        }
    }

    private BookingResponse createBookingInTransaction(Long userId, CreateBookingRequest request) {
        Map<Long, PassengerDetails> passengers = passengersBySeat(request);
        List<Long> orderedSeatIds = request.seatIds().stream().sorted().toList();

        // Share the trip lock with updates so its bus cannot change during checkout.
        Trip trip = tripRepository.findByIdForUpdate(request.tripId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chuyến xe có mã: " + request.tripId()
                ));

        ensureTripBookable(trip);

        Map<Long, Seat> seats = lockAndValidateSeats(trip, orderedSeatIds);

        
        List<String> activeStatuses = List.of(
                TicketStatus.RESERVED.name(),
                TicketStatus.CONFIRMED.name()
        );

        List<Long> conflictingSeatIds =
                ticketRepository.findOccupiedForSeatsForUpdate(
                                trip.getId(),
                                orderedSeatIds,
                                activeStatuses
                        )
                        .stream()
                        .map(ticket -> ticket.getSeat().getId())
                        .distinct()
                        .sorted()
                        .toList();

        if (!conflictingSeatIds.isEmpty()) {
            throw new SeatConflictException(
                    "Một hoặc nhiều ghế đã chọn không còn trống",
                    conflictingSeatIds.stream()
                            .map(id -> new ConflictSeat(
                                    id, seats.get(id).getSeatNumber()
                            ))
                            .toList()
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng có mã: " + userId
                ));

        BigDecimal totalAmount = trip.getPrice().multiply(BigDecimal.valueOf(orderedSeatIds.size()));
        if (totalAmount.compareTo(MAX_TOTAL_AMOUNT) > 0) {
            throw new BadRequestException("Tổng tiền đặt vé vượt quá mức tối đa cho phép là 9999999999.99");
        }

        Booking booking = new Booking();
        booking.setBookingCode(
                "BK" + UUID.randomUUID().toString().replace("-", "").substring(0, 20)
        );
        booking.setUser(user);
        booking.setTrip(trip);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);

        booking = bookingRepository.saveAndFlush(booking);

        List<Ticket> tickets = new ArrayList<>();

        for (Long seatId : orderedSeatIds) {
            PassengerDetails passenger = passengers.get(seatId);

            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setTrip(trip);
            ticket.setSeat(seats.get(seatId));
            ticket.setPassengerName(passenger.passengerName().trim());
            ticket.setPassengerPhone(normalize(passenger.passengerPhone()));
            ticket.setPrice(trip.getPrice());
            ticket.setStatus(TicketStatus.RESERVED);

            tickets.add(ticket);
        }

        ticketRepository.saveAllAndFlush(tickets);

        return response(booking, tickets);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookedAtDesc(userId).stream()
                .map(booking -> response(booking, ticketRepository.findByBookingIdOrderById(booking.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetail(Long userId, Long bookingId) {
        Booking booking = getOwnedBooking(userId, bookingId);
        return response(booking, ticketRepository.findByBookingIdOrderById(bookingId));
    }

    @Transactional
    public BookingResponse cancelBooking(Long userId, Long bookingId) {
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return response(booking, tickets);
        }
        ensureCancellationAllowed(booking.getTrip());
        LocalDateTime now = LocalDateTime.now().withNano(0);
        for (Ticket ticket : tickets) {
            if (isActive(ticket)) {
                ticket.setStatus(TicketStatus.CANCELLED);
                ticket.setCancelledAt(now);
            }
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setTotalAmount(BigDecimal.ZERO);
        booking.setCancelledAt(now);
        ticketRepository.saveAll(tickets);
        bookingRepository.save(booking);
        return response(booking, tickets);
    }

    @Transactional
    public BookingResponse cancelTicket(
            Long userId,
            Long bookingId,
            Long ticketId
    ) {
        Booking booking = lockBooking(bookingId);
        requireOwner(userId, booking);

        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);

        Ticket ticket = tickets.stream()
                .filter(item -> item.getId().equals(ticketId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy vé trong đơn đặt vé có mã vé: " + ticketId
                ));

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            return response(booking, tickets);
        }

        ensureCancellationAllowed(booking.getTrip());

        LocalDateTime now = LocalDateTime.now().withNano(0);
        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setCancelledAt(now);

        booking.setTotalAmount(sumActivePrices(tickets));

        if (tickets.stream().noneMatch(this::isActive)) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancelledAt(now);
        }

        ticketRepository.saveAll(tickets);
        bookingRepository.save(booking);

        return response(booking, tickets);
    }

    private Map<Long, PassengerDetails> passengersBySeat(CreateBookingRequest request) {
        if (request.seatIds().stream().distinct().count() != request.seatIds().size()) {
            throw new BadRequestException("Danh sách mã ghế không được chứa mã trùng lặp");
        }
        Map<Long, PassengerDetails> passengers = new HashMap<>();
        for (PassengerDetails passenger : request.passengers()) {
            if (passengers.putIfAbsent(passenger.seatId(), passenger) != null) {
                throw new BadRequestException("Thông tin hành khách chứa mã ghế trùng lặp");
            }
        }
        if (!passengers.keySet().equals(Set.copyOf(request.seatIds()))) {
            throw new BadRequestException("Phải cung cấp thông tin của đúng một hành khách cho mỗi ghế đã chọn");
        }
        return passengers;
    }

    private Map<Long, Seat> lockAndValidateSeats(Trip trip, List<Long> orderedSeatIds) {
        Map<Long, Seat> seats = new HashMap<>();
        for (Long seatId : orderedSeatIds) {
            Seat seat = seatRepository.findByIdForUpdate(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghế có mã: " + seatId));
            if (!seat.getBus().getId().equals(trip.getBus().getId())) {
                throw new BadRequestException("Ghế không thuộc xe của chuyến xe này");
            }
            if (seat.getStatus() != SeatStatus.ACTIVE) {
                throw new BadRequestException("Ghế không hoạt động, mã ghế: " + seatId);
            }
            seats.put(seatId, seat);
        }
        return seats;
    }

    private void lockSeats(Trip trip, List<Long> seatIds) {
        seatIds.stream().distinct().sorted().forEach(seatId -> {
            Seat seat = seatRepository.findByIdForUpdate(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghế có mã: " + seatId));
            if (!seat.getBus().getId().equals(trip.getBus().getId())) {
                throw new BadRequestException("Ghế không thuộc xe của chuyến xe này");
            }
        });
    }

    private Booking getOwnedBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé có mã: " + bookingId));
        requireOwner(userId, booking);
        return booking;
    }

    private void requireOwner(Long userId, Booking booking) {
        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền truy cập đơn đặt vé này");
        }
    }

    private void ensureTripBookable(Trip trip) {
        if (trip.getStatus() != TripStatus.SCHEDULED
                || !trip.getDepartureTime().isAfter(LocalDateTime.now())
                || trip.getBus().getStatus() != BusStatus.ACTIVE
                || trip.getRoute().getStatus() != RouteStatus.ACTIVE) {
            throw new BadRequestException("Chuyến xe chưa mở hoặc đã ngừng nhận đặt vé");
        }
    }

    private void ensureCancellationAllowed(Trip trip) {
        if (!trip.getDepartureTime().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Không thể hủy vé sau khi chuyến xe đã khởi hành");
        }
    }

    private BookingResponse response(Booking booking, List<Ticket> tickets) {
        List<TicketResponse> ticketResponses = tickets.stream()
                .map(ticket -> new TicketResponse(
                        ticket.getId(),
                        ticket.getSeat().getId(),
                        ticket.getSeat().getSeatNumber(),
                        ticket.getPassengerName(),
                        ticket.getPassengerPhone(),
                        ticket.getPrice(),
                        ticket.getStatus(),
                        ticket.getCancelledAt()
                ))
                .toList();
        return new BookingResponse(
                booking.getId(), booking.getBookingCode(), booking.getTrip().getId(),
                booking.getTotalAmount(), booking.getStatus(), booking.getBookedAt(),
                booking.getCancelledAt(), ticketResponses
        );
    }

    private BigDecimal sumActivePrices(List<Ticket> tickets) {
        return tickets.stream()
                .filter(this::isActive)
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean isActive(Ticket ticket) {
        return ticket.getStatus() == TicketStatus.RESERVED || ticket.getStatus() == TicketStatus.CONFIRMED;
    }

    // Every mutation locks all seats in ID order before booking and ticket rows.
    // Clear pre-lock entities so current locking reads see concurrent commits.
    private Booking lockBooking(Long bookingId) {
        Booking preview = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé có mã: " + bookingId));
        List<Long> seatIds = ticketRepository.findByBookingIdOrderById(bookingId).stream()
                .map(ticket -> ticket.getSeat().getId()).toList();
        lockSeats(preview.getTrip(), seatIds);
        entityManager.clear();
        return bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt vé có mã: " + bookingId));
    }

    @Transactional
    public BookingResponse confirmBooking(Long bookingId) {
        Booking booking = lockBooking(bookingId);
        List<Ticket> tickets = ticketRepository.findByBookingIdForUpdate(bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Không thể xác nhận đơn đặt vé đã hủy");
        }
        if (tickets.stream().noneMatch(this::isActive)) {
            throw new BadRequestException("Đơn đặt vé không có vé nào còn hiệu lực");
        }
        if (booking.getStatus() == BookingStatus.PENDING) {
            if (tickets.stream().noneMatch(ticket -> ticket.getStatus() == TicketStatus.RESERVED)) {
                throw new BadRequestException("Đơn đặt vé không có vé nào đang được giữ chỗ");
            }
            tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.RESERVED)
                    .forEach(ticket -> ticket.setStatus(TicketStatus.CONFIRMED));
            booking.setStatus(BookingStatus.CONFIRMED);
        }
        return response(booking, tickets);
    }
}
