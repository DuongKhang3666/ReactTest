import {
  formatDateTime,
  formatPrice,
  getStatusLabel,
} from "./bookingUtils";

function BookingTable({
  bookings,
  onView,
  onConfirm,
  isConfirming,
}) {
  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">□</div>

        <h3>Không tìm thấy booking</h3>

        <p>
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="bookings-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã booking</th>
            <th>Trip</th>
            <th>Số vé</th>
            <th>Tổng tiền</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => {
            const tickets = booking.tickets ?? [];

            return (
              <tr key={booking.id}>
                <td>
                  <span className="booking-id">
                    #{booking.id}
                  </span>
                </td>

                <td>
                  <strong>{booking.bookingCode}</strong>
                </td>

                <td>
                  <span className="trip-id-text">
                    Trip #{booking.tripId}
                  </span>
                </td>

                <td>
                  <strong>{tickets.length}</strong>
                </td>

                <td>
                  <strong className="price-text">
                    {formatPrice(booking.totalAmount)}
                  </strong>
                </td>

                <td>
                  <span className="date-time">
                    {formatDateTime(booking.bookedAt)}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge status-${booking.status.toLowerCase()}`}
                  >
                    <span className="status-dot" />
                    {getStatusLabel(booking.status)}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="icon-btn view-btn"
                      title="Xem chi tiết"
                      onClick={() => onView(booking)}
                    >
                      👁
                    </button>

                    {booking.status === "PENDING" && (
                      <button
                        type="button"
                        className="icon-btn confirm-btn"
                        title="Xác nhận"
                        disabled={isConfirming}
                        onClick={() =>
                          onConfirm(booking.id)
                        }
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BookingTable;