import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SeatMap from "../../../components/seats/SeatMap";
import { useTripSeats } from "../../../hooks/useSeats";
import { useTrip } from "../../../hooks/useTrips";
import "./SeatsPage.css";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export default function SeatSelectPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const tripQuery = useTrip(tripId);
    const seatsQuery = useTripSeats(tripId);
    const [selection, setSelection] = useState({ tripId, seatIds: [] });
    const selectedSeats = selection.tripId === tripId ? selection.seatIds : [];
    const setSelectedSeats = (update) => {
        setSelection((current) => {
            const currentSeatIds = current.tripId === tripId ? current.seatIds : [];
            return {
                tripId,
                seatIds: typeof update === "function" ? update(currentSeatIds) : update,
            };
        });
    };

    const seats = useMemo(
        () => (seatsQuery.data ?? []).map((seat) => ({
            ...seat,
            id: seat.seatId,
            status: seat.status === "AVAILABLE" ? "ACTIVE" : seat.status,
        })),
        [seatsQuery.data],
    );
    const total = selectedSeats.length * (Number(tripQuery.data?.price) || 0);
    const layout = useMemo(() => ({
        floors: Math.max(1, ...seats.map((seat) => Number(seat.floorNumber) || 1)),
        columnsPerFloor: Math.max(1, ...seats.map((seat) => Number(seat.columnNumber) || 1)),
    }), [seats]);

    if (!tripId) {
        return (
            <main className="seats-page">
                <p role="alert">Không tìm thấy mã chuyến xe.</p>
                <Link to="/">Quay lại</Link>
            </main>
        );
    }

    if (tripQuery.isPending || seatsQuery.isPending) {
        return <main className="seats-page" role="status">Đang tải sơ đồ ghế...</main>;
    }

    if (tripQuery.isError || seatsQuery.isError) {
        const error = tripQuery.error ?? seatsQuery.error;
        return (
            <main className="seats-page">
                <p role="alert">Không thể tải sơ đồ ghế: {error.message}</p>
                <button type="button" onClick={() => {
                    tripQuery.refetch();
                    seatsQuery.refetch();
                }}>Thử lại</button>
            </main>
        );
    }

    const handleContinue = () => {
        navigate("/booking", {
            state: {
                tripId: Number(tripId),
                selectedSeatIds: selectedSeats,
            },
        });
    };

    return (
        <main className="seats-page">
            <header className="seats-page__header">
                <Link to={`/trips/${tripId}`}>← Chi tiết chuyến</Link>
                <h1>Chọn ghế cho chuyến #{tripId}</h1>
                <p>
                    {tripQuery.data.route?.departureCity} → {tripQuery.data.route?.destinationCity}
                    {" · "}
                    {Number(tripQuery.data.price).toLocaleString("vi-VN")}đ / ghế
                </p>
            </header>

            <div className="seats-page__wrapper">
                {seats.length === 0 ? (
                    <p role="status">Chuyến xe chưa có sơ đồ ghế.</p>
                ) : (
                    <SeatMap
                        seats={seats}
                        seatCount={seats.length}
                        layout={layout}
                        selectedSeats={selectedSeats}
                        setSelectedSeats={setSelectedSeats}
                    />
                )}

                <hr />

                <div className="seats-page__total">
                    <div aria-live="polite" aria-atomic="true">
                        Đã chọn {selectedSeats.length} ghế · Tổng cộng:{" "}
                        <strong>{currencyFormatter.format(total)}đ</strong>
                    </div>
                    <button
                        type="button"
                        disabled={selectedSeats.length === 0}
                        onClick={handleContinue}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </main>
    );
}
