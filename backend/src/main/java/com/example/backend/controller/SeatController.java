package com.example.backend.controller;

import com.example.backend.dto.seat.SeatAvailability;
import com.example.backend.service.SeatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/{tripId}/seats")
    public List<SeatAvailability> getTripSeats(
            @PathVariable Long tripId
    ) {
        return seatService.getAvailability(tripId);
    }
}
