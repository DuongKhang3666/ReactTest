import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { confirmBooking, getAdminBookings } from "../../../api/adminBookingApi";

export default function AdminBookingsPage() {
  const [status, setStatus] = useState("PENDING");
  const queryClient = useQueryClient();
  const bookings = useQuery({
    queryKey: ["admin-bookings", status],
    queryFn: () => getAdminBookings(status),
  });
  const confirmation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  return (
    <main>
      <h1>Quản lý booking</h1>
      <label>Trạng thái
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </label>
      {bookings.isPending && <p>Đang tải booking...</p>}
      {bookings.isError && <p role="alert">Không thể tải danh sách booking.</p>}
      {confirmation.isError && <p role="alert">{confirmation.error.response?.data?.message ?? "Không thể xác nhận booking."}</p>}
      {bookings.data?.data.length === 0 && <p>Không có booking phù hợp.</p>}
      {bookings.data?.data.map((booking) => (
        <article key={booking.id}>
          <h2>{booking.bookingCode}</h2>
          <p>Chuyến #{booking.tripId} · {booking.status} · {booking.totalAmount.toLocaleString("vi-VN")} VND</p>
          <ul>{booking.tickets.map((ticket) => <li key={ticket.id}>Ghế {ticket.seatNumber} · {ticket.passengerName} · {ticket.status}</li>)}</ul>
          {booking.status === "PENDING" && booking.tickets.some((ticket) => ticket.status === "RESERVED") && (
            <button disabled={confirmation.isPending} onClick={() => confirmation.mutate(booking.id)}>
              {confirmation.isPending && confirmation.variables === booking.id ? "Đang xác nhận..." : "Xác nhận booking"}
            </button>
          )}
        </article>
      ))}
    </main>
  );
}
