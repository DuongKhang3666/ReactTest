export function getSeatLayout(seatCount) {
    if (seatCount <= 12) {
        return { floors: 1, columnsPerFloor: 2 };
    }

    if (seatCount <= 24) {
        return { floors: 2, columnsPerFloor: 2 };
    }

    if (seatCount <= 36) {
        return { floors: 2, columnsPerFloor: 3 };
    }

    throw new RangeError("Seat layouts currently support up to 36 seats.");
}
