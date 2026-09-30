import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBookingById } from "../../../api/bookingApi";
import CancelBookingButton from "./CancelBookingButton";

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

      {booking.status === "PENDING" || booking.status === "CONFIRMED" ?
       (
        <CancelBookingButton bookingId={booking.id} />
        ) : null }
    </div>
  );
}

export default BookingDetailPage;