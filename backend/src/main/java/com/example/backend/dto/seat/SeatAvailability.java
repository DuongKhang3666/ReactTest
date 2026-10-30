package com.example.backend.dto.seat;

import com.example.backend.entity.Seat;

public record SeatAvailability(
        Long seatId,
        String seatNumber,
        String seatType,
        Integer floorNumber,
        Integer rowNumber,
        Integer columnNumber,
        String status
) {
    public static SeatAvailability from(Seat seat, String availability) {
        return new SeatAvailability(
                seat.getId(), seat.getSeatNumber(), seat.getSeatType().name(), seat.getFloorNumber(),
                seat.getRowNumber(), seat.getColumnNumber(), availability
        );
    }
}