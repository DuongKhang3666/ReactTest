import { useState } from "react";

import SeatMap from "../../../components/seats/SeatMap";
import { getSeatLayout } from "../../../components/seats/seatLayout";

import "./SeatsPage.css";

function createFakeSeats(seatCount) {
    const {
        floors,
        columnsPerFloor,
    } = getSeatLayout(seatCount);

    const seatsPerFloor = Math.ceil(seatCount / floors);

    // Số hàng được suy ra từ tổng ghế của tầng
    // và số cột cố định của layout.
    const rowsPerFloor = Math.ceil(
        seatsPerFloor / columnsPerFloor
    );

    const seats = [];

    for (
        let floorNumber = 1;
        floorNumber <= floors;
        floorNumber += 1
    ) {
        let floorSeatNumber = 0;

        for (
            let rowNumber = 1;
            rowNumber <= rowsPerFloor;
            rowNumber += 1
        ) {
            for (
                let columnNumber = 1;
                columnNumber <= columnsPerFloor;
                columnNumber += 1
            ) {
                if (
                    floorSeatNumber >= seatsPerFloor ||
                    seats.length >= seatCount
                ) {
                    break;
                }

                floorSeatNumber += 1;

                const id = seats.length + 1;

                seats.push({
                    id,

                    seatNumber: `${
                        floorNumber === 1 ? "A" : "B"
                    }${String(floorSeatNumber).padStart(2, "0")}`,

                    floorNumber,
                    rowNumber,
                    columnNumber,

                    // Fake một số ghế không bán
                    status:
                        id % 5 === 1
                            ? "INACTIVE"
                            : "ACTIVE",
                });
            }
        }
    }

    return seats;
}

const demoSeatCounts = [12, 24, 36];

const fakeSeatsByCount = Object.fromEntries(
    demoSeatCounts.map((seatCount) => [
        seatCount,
        createFakeSeats(seatCount),
    ])
);

const fakeSeatPrice = 150000;

const currencyFormatter =
    new Intl.NumberFormat("vi-VN");

export default function SeatsPage() {
    const [seatCount, setSeatCount] = useState(24);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const seats = fakeSeatsByCount[seatCount];
    const total = selectedSeats.length * fakeSeatPrice;

    const handleSeatCountChange = (event) => {
        setSeatCount(Number(event.target.value));
        setSelectedSeats([]);
    };

    return (
        <div className="seats-page">
            {/*Test số lượng ghế*/}
            <label className="seats-page__controls"> Số ghế
                <select
                    value={seatCount}
                    onChange={handleSeatCountChange}
                >
                    {demoSeatCounts.map((count) => (
                        <option
                            key={count}
                            value={count}
                        >
                            {count} ghế
                        </option>
                    ))}
                </select>
            </label>

            <div className="seats-page__wrapper">
                <SeatMap
                    seats={seats}
                    seatCount={seatCount}
                    selectedSeats={selectedSeats}
                    setSelectedSeats={setSelectedSeats}
                />

                <hr />

                <div className="seats-page__total">
                    <div aria-live="polite" aria-atomic="true">
                        Tổng cộng:{" "}
                        <strong>
                            {currencyFormatter.format(total)}đ
                        </strong>
                    </div>

                    <button type = "button" disabled={selectedSeats.length === 0}>
                        Tiếp tục
                    </button>
                </div>

            </div>
        </div>
    );
}
