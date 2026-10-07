import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";

import { getTripById } from "../../../api/tripApi";
import {
  cancelBooking,
  cancelTicket,
  getBookingById,
} from "../../../api/bookingApi";

import "./BookingDetailPage.css";

const ACTIVE_TICKET_STATUSES = [
  "RESERVED",
  "CONFIRMED",
];

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function getBookingStatusLabel(status) {
  const labels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
  };

  return labels[status] ?? status;
}

function getTicketStatusLabel(status) {
  const labels = {
    RESERVED: "Đang giữ chỗ",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
  };

  return labels[status] ?? status;
}

function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /*
   * 1. Lấy Booking Detail 
   */
  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: Boolean(bookingId),
  });

  const booking = bookingQuery.data?.data;

  /*
   * 2. Lấy Trip Detail 
   */
  const tripQuery = useQuery({
    queryKey: ["trip", booking?.tripId],
    queryFn: () => getTripById(booking.tripId),
    enabled: Boolean(booking?.tripId),
  });

  /*
   * 3. Hủy một Ticket
   */
  const cancelTicketMutation = useMutation({
    mutationFn: ({ ticketId }) =>
      cancelTicket(bookingId, ticketId),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["booking", bookingId],
        response,
      );

      queryClient.invalidateQueries({
        queryKey: ["bookings", "me"],
      });
    },
  });

  /*
   * 4. Hủy toàn bộ Booking
   */
  const cancelBookingMutation = useMutation({
    mutationFn: () => cancelBooking(bookingId),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["booking", bookingId],
        response,
      );

      queryClient.invalidateQueries({
        queryKey: ["bookings", "me"],
      });
    },
  });

  if (bookingQuery.isPending) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state">
          <div className="state-spinner" />
          <p>Đang tải thông tin booking...</p>
        </div>
      </div>
    );
  }

  if (bookingQuery.isError) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state error">
          <h2>Không thể tải booking</h2>

          <p>
            {bookingQuery.error?.message ??
              "Đã xảy ra lỗi."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
          >
            Quay lại vé của tôi
          </button>
        </div>
      </div>
    );
  }

  if (!booking?.tripId) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state error">
          <h2>Dữ liệu booking không hợp lệ</h2>

          <p>
            Booking không có thông tin tripId.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Chờ Trip Detail từ BE1.
   */
  if (tripQuery.isPending) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state">
          <div className="state-spinner" />
          <p>Đang tải thông tin chuyến xe...</p>
        </div>
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state error">
          <h2>Không thể tải thông tin chuyến xe</h2>

          <p>
            {tripQuery.error?.message ??
              "Đã xảy ra lỗi."}
          </p>
        </div>
      </div>
    );
  }

  const trip = tripQuery.data.data;

  const tickets = booking.tickets ?? [];

  const hasActiveTickets = tickets.some((ticket) =>
    ACTIVE_TICKET_STATUSES.includes(ticket.status),
  );

  const canCancelBooking =
    booking.status !== "CANCELLED" &&
    hasActiveTickets;

  const handleCancelTicket = (ticketId) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn hủy vé này?",
    );

    if (!confirmed) {
      return;
    }

    cancelTicketMutation.mutate({ ticketId });
  };

  const handleCancelBooking = () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn hủy toàn bộ booking này?",
    );

    if (!confirmed) {
      return;
    }

    cancelBookingMutation.mutate();
  };

  return (
    <div className="booking-detail-page">
      <div className="booking-detail-container">
        {/* Header */}
        <header className="booking-detail-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/my-bookings")}
          >
            ← Vé của tôi
          </button>

          <div className="header-content">
            <div>
              <span className="page-eyebrow">
                BOOKING DETAIL
              </span>

              <h1>
                Booking #{booking.bookingCode}
              </h1>

              <p>
                Chi tiết booking và các vé đã đặt.
              </p>
            </div>

            <span
              className={`booking-status booking-status-${booking.status.toLowerCase()}`}
            >
              {getBookingStatusLabel(
                booking.status,
              )}
            </span>
          </div>
        </header>

        {/* Booking Summary */}
        <section className="detail-card">
          <div className="detail-card-title">
            <h2>Thông tin booking</h2>
          </div>

          <div className="summary-grid">
            <div>
              <span>Mã booking</span>

              <strong>
                {booking.bookingCode}
              </strong>
            </div>

            <div>
              <span>Ngày đặt</span>

              <strong>
                {formatDateTime(
                  booking.bookedAt,
                )}
              </strong>
            </div>

            <div>
              <span>Trạng thái</span>

              <strong>
                {getBookingStatusLabel(
                  booking.status,
                )}
              </strong>
            </div>

            <div>
              <span>Tổng tiền</span>

              <strong className="total-price">
                {formatMoney(
                  booking.totalAmount,
                )}
              </strong>
            </div>

            {booking.cancelledAt && (
              <div>
                <span>Ngày hủy</span>

                <strong>
                  {formatDateTime(
                    booking.cancelledAt,
                  )}
                </strong>
              </div>
            )}
          </div>
        </section>

        {/* Trip Detail */}
        <section className="detail-card">
          <div className="detail-card-title">
            <h2>Thông tin chuyến xe</h2>
          </div>

          <div className="trip-route-detail">
            <div>
              <span>Điểm đi</span>

              <strong>
                {trip.route?.departureCity}
              </strong>

              <small>
                {trip.route?.departureStation ??
                  "Chưa cập nhật"}
              </small>

              <strong className="trip-time">
                {formatDateTime(
                  trip.departureTime,
                )}
              </strong>
            </div>

            <div className="route-line">
              <span>→</span>
            </div>

            <div>
              <span>Điểm đến</span>

              <strong>
                {trip.route?.destinationCity}
              </strong>

              <small>
                {trip.route?.destinationStation ??
                  "Chưa cập nhật"}
              </small>

              <strong className="trip-time">
                {formatDateTime(
                  trip.arrivalTime,
                )}
              </strong>
            </div>
          </div>

          <div className="trip-meta">
            <div>
              <span>Xe</span>
              <strong>
                {trip.bus?.licensePlate}
              </strong>
            </div>

            <div>
              <span>Loại xe</span>
              <strong>
                {trip.bus?.busType}
              </strong>
            </div>

            <div>
              <span>Giá mỗi ghế</span>
              <strong>
                {formatMoney(trip.price)}
              </strong>
            </div>
          </div>
        </section>

        {/* Tickets */}
        <section className="detail-card">
          <div className="detail-card-title tickets-heading">
            <div>
              <h2>Các vé đã đặt</h2>

              <p>
                {tickets.length} vé trong booking này
              </p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="empty-tickets">
              Không có ticket nào.
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => {
                const active =
                  ACTIVE_TICKET_STATUSES.includes(
                    ticket.status,
                  );

                const cancelling =
                  cancelTicketMutation.isPending;

                return (
                  <article
                    className="ticket-card"
                    key={ticket.id}
                  >
                    <div className="ticket-header">
                      <div>
                        <span className="ticket-number">
                          TICKET #{ticket.id}
                        </span>

                        <h3>
                          Ghế {ticket.seatNumber}
                        </h3>
                      </div>

                      <span
                        className={`ticket-status ticket-status-${ticket.status.toLowerCase()}`}
                      >
                        {getTicketStatusLabel(
                          ticket.status,
                        )}
                      </span>
                    </div>

                    <div className="ticket-info-grid">
                      <div>
                        <span>Hành khách</span>

                        <strong>
                          {ticket.passengerName}
                        </strong>
                      </div>

                      <div>
                        <span>Số điện thoại</span>

                        <strong>
                          {ticket.passengerPhone ||
                            "-"}
                        </strong>
                      </div>

                      <div>
                        <span>Seat ID</span>

                        <strong>
                          #{ticket.seatId}
                        </strong>
                      </div>

                      <div>
                        <span>Giá vé</span>

                        <strong>
                          {formatMoney(
                            ticket.price,
                          )}
                        </strong>
                      </div>

                      {ticket.cancelledAt && (
                        <div>
                          <span>Ngày hủy</span>

                          <strong>
                            {formatDateTime(
                              ticket.cancelledAt,
                            )}
                          </strong>
                        </div>
                      )}
                    </div>

                    {active && (
                      <div className="ticket-actions">
                        <button
                          type="button"
                          className="cancel-ticket-button"
                          disabled={cancelling}
                          onClick={() =>
                            handleCancelTicket(
                              ticket.id,
                            )
                          }
                        >
                          {cancelling
                            ? "Đang hủy..."
                            : "Hủy vé này"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Actions */}
        {canCancelBooking && (
          <section className="booking-actions-card">
            <div>
              <h3>Hủy booking</h3>

              <p>
                Hành động này sẽ hủy tất cả vé còn
                hiệu lực trong booking.
              </p>
            </div>

            <button
              type="button"
              className="cancel-booking-button"
              disabled={
                cancelBookingMutation.isPending
              }
              onClick={handleCancelBooking}
            >
              {cancelBookingMutation.isPending
                ? "Đang hủy..."
                : "Hủy toàn bộ booking"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default BookingDetailPage;