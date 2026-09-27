package com.example.backend.controller;

import com.example.backend.entity.Trip;
import com.example.backend.service.TripService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class PublicTripController {

    private final TripService tripService;

    public PublicTripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<Trip> searchTrips(
            @RequestParam("from") String departureCity,
            @RequestParam("to") String destinationCity,
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return tripService.searchTrips(
                departureCity,
                destinationCity,
                date
        );
    }

    @GetMapping("/{id}")
    public Trip getTripById(@PathVariable Long id) {
        return tripService.getTripById(id);
    }
}