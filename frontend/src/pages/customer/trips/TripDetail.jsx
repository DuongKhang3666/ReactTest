import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking } from "../../../api/bookingApi";
import { getTripById, getTripSeats } from "../../../api/tripApi";

function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const inFlight = useRef(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [passengers, setPassengers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [conflictSeats, setConflictSeats] = useState([]);

  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripById(tripId),
  });
  const seatsQuery = useQuery({
    queryKey: ["trip-seats", tripId],
    queryFn: () => getTripSeats(tripId),
  });

  const trip = tripQuery.data?.data;
  const seats = seatsQuery.data?.data ?? [];
  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.seatId));

  const changeSelection = (seatId) => {
    setMessage("");
    setSelectedSeatIds((current) => current.includes(seatId)
      ? current.filter((id) => id !== seatId)
      : [...current, seatId]);
  };

  const changePassenger = (seatId, field, value) => {
    setPassengers((current) => ({
      ...current,
      [seatId]: { ...current[seatId], [field]: value },
    }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    if (selectedSeatIds.length === 0 || selectedSeats.some((seat) => !passengers[seat.seatId]?.name?.trim())) {
      setMessage("Chọn ít nhất một ghế và nhập tên hành khách cho từng ghế.");
      return;
    }
    if (selectedSeats.length !== selectedSeatIds.length || selectedSeats.some((seat) => seat.status !== "AVAILABLE")) {
      setMessage("Một số ghế đã không còn trống. Vui lòng bỏ chọn ghế đó và chọn lại.");
      return;
    }
    inFlight.current = true;

    setSubmitting(true);
    setMessage("");
    setConflictSeats([]);
    try {
      const response = await createBooking({
        tripId: Number(tripId),
        seatIds: selectedSeatIds,
        passengers: selectedSeats.map((seat) => ({
          seatId: seat.seatId,
          passengerName: passengers[seat.seatId].name.trim(),
          passengerPhone: passengers[seat.seatId].phone?.trim() || null,
        })),
      });
      navigate(`/my-bookings/${response.data.id}`);
    } catch (error) {
      if (error.response?.status === 409) {
        const conflicts = error.response.data?.conflictSeats ?? [];
        const conflictIds = conflicts.map((seat) => seat.seatId);
            setConflictSeats(conflicts);
        setSelectedSeatIds((current) => current.filter((seatId) => !conflictIds.includes(seatId)));
        setMessage("Ghế đã được đặt trong lúc gửi yêu cầu. Vui lòng điều chỉnh lựa chọn trước khi gửi lại.");
        const refreshed = await seatsQuery.refetch();
        if (!refreshed.isError) {
          const availableIds = refreshed.data.data.filter((seat) => seat.status === "AVAILABLE").map((seat) => seat.seatId);
          setSelectedSeatIds((current) => current.filter((id) => availableIds.includes(id)));
        }
      } else {
        setMessage(error.response?.data?.message ?? "Không thể gửi yêu cầu. Hãy thử lại.");
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (tripQuery.isPending || seatsQuery.isPending) return <p>Đang tải chuyến xe...</p>;
  if (tripQuery.isError || seatsQuery.isError) {
    return <p>Không thể tải chuyến xe hoặc tình trạng ghế.</p>;
  }

  return (
    <main>
      <h1>Đặt vé chuyến xe</h1>
      <p>Chuyến #{trip.id} · {trip.price?.toLocaleString("vi-VN")} VND / ghế</p>
      <p>Chọn ghế chỉ thay đổi lựa chọn trên thiết bị này; ghế được giữ sau khi gửi yêu cầu thành công, chờ admin xác nhận.</p>
      <button type="button" onClick={() => seatsQuery.refetch()} disabled={seatsQuery.isFetching}>
        {seatsQuery.isFetching ? "Đang cập nhật..." : "Làm mới tình trạng ghế"}
      </button>

      <section aria-label="Danh sách ghế">
        {seats.map((seat) => {
          const unavailable = seat.status !== "AVAILABLE";
          return (
            <button
              key={seat.seatId}
              type="button"
              disabled={(unavailable && !selectedSeatIds.includes(seat.seatId)) || submitting}
              aria-pressed={selectedSeatIds.includes(seat.seatId)}
              onClick={() => changeSelection(seat.seatId)}
            >
              {seat.seatNumber} · {unavailable ? seat.status : selectedSeatIds.includes(seat.seatId) ? "Đã chọn" : "Còn"}
            </button>
          );
        })}
      </section>

      <form onSubmit={submitBooking}>
        {selectedSeats.map((seat) => (
          <fieldset key={seat.seatId} disabled={submitting}>
            <legend>Ghế {seat.seatNumber}</legend>
            <label>
              Họ tên hành khách
              <input
                required
                maxLength={120}
                value={passengers[seat.seatId]?.name ?? ""}
                onChange={(event) => changePassenger(seat.seatId, "name", event.target.value)}
              />
            </label>
            <label>
              Số điện thoại
              <input
                maxLength={20}
                value={passengers[seat.seatId]?.phone ?? ""}
                onChange={(event) => changePassenger(seat.seatId, "phone", event.target.value)}
              />
            </label>
          </fieldset>
        ))}
        <p>Tổng tiền: {((trip.price ?? 0) * selectedSeatIds.length).toLocaleString("vi-VN")} VND</p>
        <button type="submit" disabled={submitting || selectedSeatIds.length === 0}>
          {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt vé"}
        </button>
      </form>
      {message && <p role="alert">{message}</p>}
      {conflictSeats.length > 0 && <p>Ghế xung đột: {conflictSeats.map((seat) => seat.seatNumber ?? seat.seatId).join(", ")}</p>}
    </main>
  );
}

export default TripDetail;
