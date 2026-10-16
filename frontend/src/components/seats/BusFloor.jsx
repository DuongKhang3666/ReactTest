import Seat from "./Seat";
import steeringWheel from "../../assets/volang.png";

import "./BusFloor.css";

export default function BusFloor({
    floorNumber,
    seats,
    selectedSeats = [],
    onSeatClick,
    rowsPerFloor = 1,
}) {
    const maxColumn = Math.max(1, ...seats.map((seat) => seat.columnNumber));
    const maxRow = Math.max(rowsPerFloor, ...seats.map((seat) => seat.rowNumber));
    const title = floorNumber === 1 ? "Tầng dưới" : "Tầng trên";

    return (
        <section className="bus-floor" aria-label={title}>
            <h3 className="floor-title">{title}</h3>

            <div className="bus-floor__body">
                <div className="bus-floor__front">
                    <img
                        src={steeringWheel}
                        alt={floorNumber === 1 ? "Vô lăng" : ""}
                        aria-hidden={floorNumber !== 1}
                        className={`bus-floor__wheel${floorNumber !== 1 ? " bus-floor__wheel--placeholder" : ""}`}
                    />
                </div>

                <div
                    className="bus-layout"
                    style={{
                        gridTemplateColumns: `repeat(${maxColumn}, 34px)`,
                        gridTemplateRows: `repeat(${maxRow}, 46px)`,
                    }}
                >
                    {seats.map((seat) => {
                        const isSelected = selectedSeats.includes(seat.id);

                        return (
                            <div
                                key={seat.id}
                                className="seat-position"
                                style={{
                                    gridRow: seat.rowNumber,
                                    gridColumn: seat.columnNumber,
                                }}
                            >
                                <Seat seat={seat} selected={isSelected} onClick={onSeatClick} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
