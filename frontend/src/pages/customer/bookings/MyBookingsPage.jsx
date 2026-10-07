import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getMyBookings } from "../../../api/bookingApi";

import "./MyBookingsPage.css";

function formatMoney(value) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

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

function getBookingStatusLabel(status) {
  const labels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
  };

  return labels[status] ?? status;
}

function getBookingStatusClass(status) {
  return `booking-status booking-status-${String(
    status,
  ).toLowerCase()}`;
}

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
    return (
      <div className="my-bookings-page">
        <div className="my-bookings-state">
          <div className="state-spinner" />
          <p>Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-bookings-page">
        <div className="my-bookings-state error">
          <h2>Không thể tải danh sách booking</h2>

          <p>
            {error?.response?.data?.message ??
              error?.message ??
              "Đã xảy ra lỗi."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const bookings = Array.isArray(data?.data)
    ? data.data
    : [];

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <header className="my-bookings-header">
          <span className="page-eyebrow">
            MY BOOKINGS
          </span>

          <h1>Vé của tôi</h1>

          <p>
            Xem lại tất cả booking và các chuyến xe bạn
            đã đặt.
          </p>
        </header>

        {bookings.length === 0 ? (
          <section className="empty-bookings">
            <div className="empty-icon">□</div>

            <h2>Chưa có booking nào</h2>

            <p>
              Bạn chưa đặt chuyến xe nào.
            </p>

            <Link
              to="/"
              className="browse-trip-button"
            >
              Tìm chuyến xe
            </Link>
          </section>
        ) : (
          <section className="booking-list">
            {bookings.map((booking) => {
              /*
               * BE2 trả BookingResponse.
               * Tùy tên component của BookingResponse,
               * danh sách ticket có thể là ticketResponses
               * hoặc tickets. Dùng fallback để frontend
               * không phụ thuộc cứng vào tên này.
               */
              const tickets =
                booking.ticketResponses ??
                booking.tickets ??
                [];

              const activeTicketCount =
                tickets.filter(
                  (ticket) =>
                    ticket.status === "RESERVED" ||
                    ticket.status === "CONFIRMED",
                ).length;

              return (
                <article
                  className="booking-card"
                  key={booking.id}
                >
                  <div className="booking-card-header">
                    <div>
                      <span className="booking-code-label">
                        BOOKING
                      </span>

                      <h2>
                        #{booking.bookingCode}
                      </h2>
                    </div>

                    <span
                      className={getBookingStatusClass(
                        booking.status,
                      )}
                    >
                      {getBookingStatusLabel(
                        booking.status,
                      )}
                    </span>
                  </div>

                  <div className="booking-summary-grid">
                    <div>
                      <span>Trip ID</span>
                      <strong>
                        #{booking.tripId}
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
                      <span>Số vé còn hiệu lực</span>
                      <strong>
                        {activeTicketCount}
                      </strong>
                    </div>

                    <div>
                      <span>Tổng tiền</span>
                      <strong className="booking-price">
                        {formatMoney(
                          booking.totalAmount,
                        )}
                      </strong>
                    </div>
                  </div>

                  {tickets.length > 0 && (
                    <div className="booking-ticket-preview">
                      <span className="preview-label">
                        Ghế đã đặt
                      </span>

                      <div className="seat-list">
                        {tickets.map((ticket) => (
                          <span
                            className={
                              ticket.status ===
                              "CANCELLED"
                                ? "seat-tag cancelled"
                                : "seat-tag"
                            }
                            key={ticket.id}
                          >
                            {ticket.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="booking-card-footer">
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="detail-button"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;