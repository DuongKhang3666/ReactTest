import { Link, useParams } from "react-router-dom";
import Card from "../../../components/common/Card.jsx";
import { useTrip } from "../../../hooks/useTrips";
import { useTripSeats } from "../../../hooks/useSeats";
import "./TripDetailsPage.css";
import {display, plugin, snowflake, water, wifi, toilet} from "../../../assets"

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatDateTime(value) {
    if (!value) return { time: "Chưa cập nhật", date: "" };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { time: "Chưa cập nhật", date: "" };
    return {
        time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString("vi-VN"),
    };
}

function formatDuration(departureTime, arrivalTime) {
    const duration = new Date(arrivalTime) - new Date(departureTime);
    if (!Number.isFinite(duration) || duration <= 0) return "Chưa cập nhật";
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours ? `${hours} giờ ${remainder ? `${remainder} phút` : ""}`.trim() : `${minutes} phút`;
}

function RouteStop({ label, value, station, tone }) {
    const dateTime = formatDateTime(value);
    return (
        <div className={`route-stop route-stop-${tone}`}>
            <span className="route-stop-label">{label}</span>
            <strong className="route-stop-time">{dateTime.time}</strong>
            <span className="route-stop-date">{dateTime.date}</span>
            <strong className="route-stop-name">{station || "Chưa cập nhật"}</strong>
        </div>
    );
}

export default function TripDetailsPage() {
    const { tripId } = useParams();
    const tripQuery = useTrip(tripId);
    const seatsQuery = useTripSeats(tripId);

    if (!tripId) {
        return (
            <main className="trip-details-page">
                <div className="trip-details-heading">
                    <h1>Chi tiết chuyến đi</h1>
                    <p>Vui lòng mở thông tin từ một chuyến xe hợp lệ.</p>
                </div>
            </main>
        );
    }

    if (tripQuery.isPending) {
        return <main className="trip-details-page" role="status">Đang tải thông tin chuyến xe...</main>;
    }

    if (tripQuery.isError) {
        return (
            <main className="trip-details-page">
                <div role="alert">Không thể tải chuyến xe: {tripQuery.error.message}</div>
                <button type="button" onClick={() => tripQuery.refetch()}>Thử lại</button>
            </main>
        );
    }

    const trip = tripQuery.data;
    const route = trip.route ?? {};
    const bus = trip.bus ?? {};
    const availableSeats = seatsQuery.data?.filter((seat) => seat.status === "AVAILABLE").length;
    const totalSeats = bus.seatCount ?? seatsQuery.data?.length;

    return (
        <main className="trip-details-page">
            <div className="trip-details-heading">
                <h1>Chi tiết chuyến đi</h1>
                <p>Xem đầy đủ thông tin trước khi đặt vé</p>
            </div>

            <div className="trip-details-layout">
                {/* Left */}
                <div className="trip-details-main">
                    <Card className="trip-card trip-overview-card" padding="20px">
                        <div className="operator-row">
                            <span className="operator-icon" aria-hidden="true">🚌</span>
                            <div className="operator-info">
                                <strong>{bus.busType || "Thông tin xe chưa cập nhật"}</strong>
                                <div className="operator-meta">
                                    <span className="vehicle-tag">{bus.licensePlate || "Chưa cập nhật biển số"}</span>
                                    <span className="vehicle-tag">Chuyến #{trip.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="route-stops">
                            <RouteStop
                                label="Bến đón"
                                value={trip.departureTime}
                                station={route.departureStation}
                                tone="departure"
                            />
                            <div className="route-connector" aria-hidden="true">
                                <span />
                                <div>Thời lượng {formatDuration(trip.departureTime, trip.arrivalTime)}</div>
                                <span />
                            </div>
                            <RouteStop
                                label="Bến trả"
                                value={trip.arrivalTime}
                                station={route.destinationStation}
                                tone="arrival"
                            />
                        </div>

                        <div className="trip-facts">
                            <div className="trip-fact">
                                <span>Tuyến</span>
                                <strong>{route.departureCity || "—"} → {route.destinationCity || "—"}</strong>
                            </div>
                            <div className="trip-fact">
                                <span>Trạng thái</span>
                                <strong>{trip.status || "—"}</strong>
                            </div>
                            <div className="trip-fact">
                                <span>Số ghế</span>
                                <strong>{totalSeats ?? "—"}</strong>
                            </div>
                        </div>
                    </Card>

                    <Card className="trip-card amenities-card" padding="20px">
                        <h2>Tiện ích trên xe</h2>

                        <div className="amenities-grid">
                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={wifi} alt="Wi-Fi" />
                                </span>
                                <span>Wi-Fi miễn phí</span>
                            </div>

                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={snowflake} alt="aircondition" />
                                </span>
                                <span>Điều hòa</span>
                            </div>

                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={water} alt="water" />
                                </span>
                                <span>Nước uống</span>
                            </div>

                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={plugin} alt="plugin" />
                                </span>
                                <span>Cổng USB</span>
                            </div>

                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={toilet} alt="restroom" />
                                </span>
                                <span>Nhà vệ sinh</span>
                            </div>

                            <div className="amenity-item">
                                <span className="amenity-icon">
                                    <img src={display} alt="monitor" />
                                </span>
                                <span>Màn hình</span>
                            </div>
                        </div>
                    </Card>
                </div>
                {/* right */}
                <Card className="trip-card price-card" padding="20px">
                    <div className="price-card-content">
                        <p className="price-eyebrow">GIÁ VÉ / GHẾ</p>
                        <strong className="ticket-price">{currencyFormatter.format(Number(trip.price) || 0)}đ</strong>
                        <div className="booking-details">
                            <div className="booking-detail">
                                <span>Tuyến</span>
                                <strong>{route.departureCity || "—"} → {route.destinationCity || "—"}</strong>
                            </div>
                            <div className="booking-detail">
                                <span>Khởi hành</span>
                                <strong>{formatDateTime(trip.departureTime).time}, {formatDateTime(trip.departureTime).date}</strong>
                            </div>
                            <div className="booking-detail">
                                <span>Loại xe</span>
                                <strong>{bus.busType || "Chưa cập nhật"}</strong>
                            </div>
                        </div>
                        {seatsQuery.isError ? (
                            <div className="availability-note" role="alert">
                                <p>Không thể tải số ghế trống: {seatsQuery.error.message}</p>
                            </div>
                        ) : (
                            <div className="availability-note">
                                <span aria-hidden="true">ϟ</span>
                                <p>
                                    Còn <strong>{seatsQuery.isPending ? "…" : availableSeats}</strong>
                                    {totalSeats == null ? "" : ` / ${totalSeats}`} ghế trống.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="price-card-actions">
                        <Link className="choose-seat-button" to={`/trips/${trip.id}/seats`}>
                            Chọn ghế <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
