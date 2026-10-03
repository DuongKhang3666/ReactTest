import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyBookings } from "../../../api/bookingApi";

function MyBookingsPage() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: getMyBookings,
  });

  if (isPending) {
    return <p>Đang tải danh sách booking...</p>;
  }

  if (isError) {
    return (
      <div>
        <h1>Vé của tôi</h1>
        <p>Không thể tải danh sách booking.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const bookings = data.data;

  return (
    <div>
      <h1>Vé của tôi</h1>

      {bookings.length === 0 ? (
        <p>Bạn chưa có booking nào.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id}>
            <h2>{booking.bookingCode}</h2>

            <p>
              Trạng thái: {booking.status === "PENDING" ? "Chờ admin xác nhận" : booking.status === "CONFIRMED" ? "Đã xác nhận" : "Đã hủy"}
            </p>

            <p>
              Tổng tiền: {booking.totalAmount}
            </p>

            <p>
              Ngày đặt: {booking.bookedAt}
            </p>

            <Link to={`/my-bookings/${booking.id}`}>
              Xem chi tiết
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookingsPage;