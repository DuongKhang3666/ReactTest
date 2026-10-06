package com.example.backend.dto.seat;

import com.example.backend.enums.SeatStatus;

public record SeatResponse(
        Long seatId,
        String seatNumber,
        String seatType,
        Integer floorNumber,
        Integer rowNumber,
        Integer columnNumber,
        String status
) {
}
