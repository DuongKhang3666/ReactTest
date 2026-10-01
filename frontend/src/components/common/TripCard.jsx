import { Link } from "react-router-dom";
import Icon from "./Icon";
import { cityLabel } from "../../utils/cities";
import { formatDuration, formatPrice, formatTime } from "../../utils/format";

export default function TripCard({ trip }) {
  const { route, bus } = trip;
  const soldOut = trip.availableSeats <= 0;
  return (
    <article className="trip-card">
      <div className="trip-card__main">
        <div className="trip-card__times">
          <div>
            <div className="trip-card__time">{formatTime(trip.departureTime)}</div>
            <div className="muted">{cityLabel(route.departureCity)}</div>
          </div>
          <div className="trip-card__line" aria-label={`Thời gian di chuyển ${formatDuration(route.durationMinutes)}`}>
            <span>{formatDuration(route.durationMinutes)}</span>
          </div>
          <div>
            <div className="trip-card__time">{formatTime(trip.arrivalTime)}</div>
            <div className="muted">{cityLabel(route.destinationCity)}</div>
          </div>
        </div>
        <div className="muted trip-card__meta">
          {bus.busType} · {route.departureStation} <Icon name="arrow-right" size={13} className="route-label__arrow" /> {route.destinationStation}
        </div>
      </div>
      <div className="trip-card__side">
        <div className="trip-card__price">{formatPrice(trip.price)}</div>
        <div className={soldOut ? "badge badge--danger" : "badge badge--ok"}>
          {soldOut ? "Hết chỗ" : `Còn ${trip.availableSeats} chỗ`}
        </div>
        {soldOut ? (
          <button type="button" className="btn" disabled>Hết chỗ</button>
        ) : (
          <Link to={`/trips/${trip.id}`} className="btn">Xem chuyến</Link>
        )}
      </div>
    </article>
  );
}
