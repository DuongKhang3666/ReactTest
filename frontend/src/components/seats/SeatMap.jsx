import { useState } from "react";

import BusFloor from "./BusFloor";
import SeatNote from "./SeatNote";

import { toggleSeatSelection } from "./seatClickHandler";
import { getSeatLayout } from "./seatLayout";

import "./SeatMap.css";

export default function SeatMap({
    seats = [],
    seatCount = seats.length,
    layout = getSeatLayout(seatCount),
    selectedSeats,
    setSelectedSeats,
}) {
    const [internalSelectedSeats, setInternalSelectedSeats] = useState([]);
    const isControlled = selectedSeats !== undefined && setSelectedSeats !== undefined;
    const selection = isControlled ? selectedSeats : internalSelectedSeats;
    const setSelection = isControlled ? setSelectedSeats : setInternalSelectedSeats;

    const normalizedSeats = seats.map((seat) => ({
        ...seat,
        seatNumber: seat.seatNumber ?? seat.seat_number,
        floorNumber: seat.floorNumber ?? seat.floor_number,
        rowNumber: seat.rowNumber ?? seat.row_number,
        columnNumber: seat.columnNumber ?? seat.column_number,
    }));

    const floorSeats = Array.from(
        { length: layout.floors },
        (_, index) => ({
            floorNumber: index + 1,
            seats: normalizedSeats.filter((seat) => seat.floorNumber === index + 1),
        })
    );

    const handleSeatClick = (seat) => toggleSeatSelection(seat, setSelection);

    return (
        <div className="seat-section">
            <SeatNote />
            <div className="seat-map">
                {floorSeats.map((floor) => (
                    <BusFloor
                        key={floor.floorNumber}
                        floorNumber={floor.floorNumber}
                        seats={floor.seats}
                        columnsPerFloor={layout.columnsPerFloor}
                        selectedSeats={selection}
                        onSeatClick={handleSeatClick}
                    />
                ))}
            </div>

        </div>
    );
}
