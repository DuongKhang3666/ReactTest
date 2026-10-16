import { Link } from "react-router-dom";
import Icon from "./Icon";
import RouteLabel from "./RouteLabel";
import { cityLabel } from "../../utils/cities";
import { formatDuration, formatPrice, formatTime } from "../../utils/format";

export default function TripCard({ trip }) {
  const { route, bus } = trip;
  const soldOut = trip.availableSeats <= 0;

  return (
    <article className="card row">
      <div>
        <p className="big">
          {formatTime(trip.departureTime)} <Icon name="arrow-right" size={16} /> {formatTime(trip.arrivalTime)}{" "}
          <small>({formatDuration(route.durationMinutes)})</small>
        </p>
        <p><RouteLabel from={cityLabel(route.departureCity)} to={cityLabel(route.destinationCity)} /></p>
        <p className="muted">{bus.busType} · {route.departureStation} <Icon name="arrow-right" size={12} /> {route.destinationStation}</p>
      </div>

      <div className="right">
        <p className="price">{formatPrice(trip.price)}</p>
        <p>
          <span className={soldOut ? "badge badge--danger" : "badge badge--ok"}>
            {soldOut ? "Hết chỗ" : `Còn ${trip.availableSeats} chỗ`}
          </span>
        </p>
        {soldOut ? (
          <button type="button" className="btn" disabled>Hết chỗ</button>
        ) : (
          <Link to={`/trips/${trip.id}`} className="btn">Xem chuyến</Link>
        )}
      </div>
    </article>
  );
}
