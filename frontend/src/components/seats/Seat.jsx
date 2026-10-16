import "./Seat.css";

import armchair from "../../assets/armchair.png";
import selectedBox from "../../assets/selected_box.png";
import unavailable from "../../assets/unavailable.png";

export default function Seat({ seat, selected = false, onClick }) {
    const isUnavailable = !["ACTIVE", "AVAILABLE"].includes(seat.status);

    let image = armchair;

    if (isUnavailable) {
        image = unavailable;
    } else if (selected) {
        image = selectedBox;
    }

    const handleClick = () => {
        if (isUnavailable) return;
        onClick?.(seat);
    };

    return (
        <button
            type="button"
            className={`seat ${isUnavailable ? "seat--unavailable" : ""}`}
            onClick={handleClick}
            disabled={isUnavailable}
            aria-label={`Ghế ${seat.seatNumber}`}
            aria-pressed={!isUnavailable && selected}
        >
            <img src={image} alt="" className="seat__icon" />

            <span className="seat__number">
                {seat.seatNumber}
            </span>
        </button>
    );
}
