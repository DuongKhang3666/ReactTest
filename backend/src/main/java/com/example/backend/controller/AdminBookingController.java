package com.example.backend.controller;

import com.example.backend.dto.booking.BookingResponse;
import com.example.backend.service.AdminBookingService;
import com.example.backend.service.BookingService;
import com.example.backend.enums.BookingStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService mutations;
    private final AdminBookingService bookingService;

    public AdminBookingController(AdminBookingService bookingService, BookingService mutations) {
        this.mutations = mutations;
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<BookingResponse> getAllBookings(@RequestParam(required = false) BookingStatus status) {
        return bookingService.getAllBookings().stream()
                .filter(booking -> status == null || booking.status() == status).toList();
    }

    @PostMapping("/{id}/confirm")
    public BookingResponse confirm(@PathVariable Long id) {
        return mutations.confirmBooking(id);
    }
}
