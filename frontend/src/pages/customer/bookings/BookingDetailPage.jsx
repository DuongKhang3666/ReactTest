import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { cancelTicket, getBookingById } from "../../../api/bookingApi";
import CancelBookingButton from "./CancelBookingButton";

function CancelTicketButton({ bookingId, ticketId }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelTicket(bookingId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", String(bookingId)] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      queryClient.invalidateQueries({ queryKey: ["trip-seats"] });
    },
  });

  return (
    <div>
    <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? "Đang hủy vé..." : "Hủy vé"}
    </button>
    {mutation.isError && <p role="alert">{mutation.error.response?.data?.message ?? "Không thể hủy vé."}</p>}
    </div>
  );
}

function BookingDetailPage() {
  const { bookingId } = useParams();

  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId),
  });

  if (isPending) {
    return <p>Đang tải booking...</p>;
  }

  if (isError) {
    return (
      <div>
        <h1>Chi tiết booking</h1>
        <p>Không thể tải booking.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const booking = data.data;

  return (
    <div>
      <h1>Chi tiết booking</h1>

      <p>
        Mã booking: {booking.bookingCode}
      </p>

      <p>
        Trạng thái: {booking.status}
      </p>

      <p>
        Tổng tiền: {booking.totalAmount}
      </p>

      <p>
        Ngày đặt: {booking.bookedAt}
      </p>

      {booking.status === "PENDING" && <p role="status">Đã tiếp nhận yêu cầu, đang chờ admin xác nhận. Chưa có vé chính thức.</p>}
      <h2>Ghế và trạng thái vé</h2>
      {booking.tickets.map((ticket) => (
        <article key={ticket.id}>
          <p>Ghế {ticket.seatNumber} · {ticket.passengerName} · {ticket.status}</p>
          <p>{ticket.price} VND</p>
          {ticket.status === "CONFIRMED" && <p>Vé chính thức · #{ticket.id}</p>}
          {["RESERVED", "CONFIRMED"].includes(ticket.status) && <CancelTicketButton bookingId={booking.id} ticketId={ticket.id} />}
        </article>
      ))}
      {["PENDING", "CONFIRMED"].includes(booking.status) && <CancelBookingButton bookingId={booking.id} />}
    </div>
  );
}

export default BookingDetailPage;
