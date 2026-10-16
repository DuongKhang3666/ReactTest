package com.example.backend.service;

import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.dto.booking.TicketResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Ticket;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public AdminBookingService(
            BookingRepository bookingRepository,
            TicketRepository ticketRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private BookingResponse toResponse(Booking booking) {
        List<TicketResponse> tickets = ticketRepository
                .findByBookingIdOrderById(booking.getId())
                .stream()
                .map(this::toTicketResponse)
                .toList();

        return new BookingResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getTrip().getId(),
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getBookedAt(),
                booking.getCancelledAt(),
                tickets
        );
    }

    private TicketResponse toTicketResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getSeat().getId(),
                ticket.getSeat().getSeatNumber(),
                ticket.getPassengerName(),
                ticket.getPassengerPhone(),
                ticket.getPrice(),
                ticket.getStatus(),
                ticket.getCancelledAt()
        );
    }
}
