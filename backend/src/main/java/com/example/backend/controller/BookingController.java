package com.example.backend.controller;

import com.example.backend.dto.booking.AddTicketRequest;
import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.dto.booking.ConfirmBookingRequest;
import com.example.backend.dto.booking.CreateBookingRequest;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        BookingResponse response = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"", "/my"})
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.getMyBookings(userId);
    }

    @GetMapping("/{id}")
    public BookingResponse getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.getBookingDetail(userId, id);
    }

    @DeleteMapping("/{id}")
    public BookingResponse cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.cancelBooking(userId, id);
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancelBookingByContract(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.cancelBooking(userId, id);
    }

    @PostMapping("/{id}/tickets")
    public ResponseEntity<BookingResponse> addTicket(
            @PathVariable Long id,
            @Valid @RequestBody AddTicketRequest request,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        BookingResponse response = bookingService.reserveSeat(userId, id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/tickets/{ticketId}")
    public BookingResponse releaseTicket(
            @PathVariable Long id,
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.releaseSeat(userId, id, ticketId);
    }

    @PatchMapping("/{id}/tickets/{ticketId}/cancel")
    public BookingResponse cancelTicket(
            @PathVariable Long id,
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.cancelTicket(userId, id, ticketId);
    }

    @PostMapping("/{id}/confirm")
    public BookingResponse confirmBooking(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ConfirmBookingRequest request,
            Authentication authentication
    ) {
        Long userId = getAuthenticatedUserId(authentication);
        return bookingService.confirmBooking(userId, id, request);
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenException("Authentication is required");
        }
        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException e) {
            throw new ForbiddenException("Invalid authentication identifier: " + authentication.getName());
        }
    }
}

