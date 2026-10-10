import { useQuery } from "@tanstack/react-query";

import { getTripById } from "../../../api/tripApi";

import {
  formatDateTime,
  formatPrice,
  getStatusLabel,
} from "./bookingUtils";

function BookingDetailModal({
  booking,
  onClose,
  onConfirm,
  isConfirming,
}) {
  const {
    data: tripResponse,
    isPending: tripLoading,
  } = useQuery({
    queryKey: ["trip", booking.tripId],
    queryFn: () => getTripById(booking.tripId),
  });

  const trip = tripResponse?.data;
  const tickets = booking.tickets ?? [];

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="booking-detail-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="detail-modal-header">
          <div>
            <span className="page-eyebrow">
              BOOKING DETAIL
            </span>

            <h2>{booking.bookingCode}</h2>

            <p>Booking #{booking.id}</p>
          </div>

          <span
            className={`status-badge status-${booking.status.toLowerCase()}`}
          >
            <span className="status-dot" />
            {getStatusLabel(booking.status)}
          </span>
        </div>

        <section className="detail-section">
          <h3>Thông tin booking</h3>

          <div className="detail-grid">
            <div className="detail-item">
              <span>Mã booking</span>
              <strong>{booking.bookingCode}</strong>
            </div>

            <div className="detail-item">
              <span>Trip ID</span>
              <strong>#{booking.tripId}</strong>
            </div>

            <div className="detail-item">
              <span>Ngày đặt</span>
              <strong>
                {formatDateTime(booking.bookedAt)}
              </strong>
            </div>

            <div className="detail-item">
              <span>Tổng tiền</span>
              <strong>
                {formatPrice(booking.totalAmount)}
              </strong>
            </div>
          </div>

          {booking.cancelledAt && (
            <div className="booking-message booking-message-danger">
              Đã hủy lúc:{" "}
              {formatDateTime(booking.cancelledAt)}
            </div>
          )}

          {booking.message && (
            <div className="booking-message">
              {booking.message}
            </div>
          )}
        </section>

        <section className="detail-section">
          <h3>Thông tin chuyến xe</h3>

          {tripLoading ? (
            <p className="detail-loading">
              Đang tải thông tin chuyến...
            </p>
          ) : trip ? (
            <div className="detail-grid">
              <div className="detail-item">
                <span>Tuyến</span>
                <strong>
                  {trip.route?.departureCity ?? "-"} →{" "}
                  {trip.route?.destinationCity ?? "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Điểm đi</span>
                <strong>
                  {trip.route?.departureStation ?? "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Điểm đến</span>
                <strong>
                  {trip.route?.destinationStation ?? "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Xe</span>
                <strong>
                  {trip.bus?.licensePlate ?? "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Khởi hành</span>
                <strong>
                  {formatDateTime(trip.departureTime)}
                </strong>
              </div>

              <div className="detail-item">
                <span>Đến</span>
                <strong>
                  {formatDateTime(trip.arrivalTime)}
                </strong>
              </div>
            </div>
          ) : (
            <p className="detail-empty">
              Không thể tải thông tin chuyến.
            </p>
          )}
        </section>

        <section className="detail-section">
          <h3>Danh sách vé</h3>

          {tickets.length === 0 ? (
            <div className="detail-empty">
              Booking chưa có vé.
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div
                  className="ticket-item"
                  key={ticket.id}
                >
                  <div className="ticket-top">
                    <strong>
                      Vé #{ticket.id}
                    </strong>

                    <span
                      className={`ticket-status ticket-status-${ticket.status.toLowerCase()}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="ticket-grid">
                    <div>
                      <span>Ghế</span>
                      <strong>
                        {ticket.seatNumber ?? "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Hành khách</span>
                      <strong>
                        {ticket.passengerName ?? "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Số điện thoại</span>
                      <strong>
                        {ticket.passengerPhone ?? "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Giá</span>
                      <strong>
                        {formatPrice(ticket.price)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="detail-modal-footer">
          {booking.status === "PENDING" && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={isConfirming}
              onClick={() => onConfirm(booking.id)}
            >
              {isConfirming
                ? "Đang xác nhận..."
                : "✓ Xác nhận booking"}
            </button>
          )}

          <button
            type="button"
            className="modal-secondary-btn"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingDetailModal;