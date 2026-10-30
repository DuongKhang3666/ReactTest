import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getMyBookings } from "../../../api/bookingApi";

import "./MyBookingsPage.css";

const PAGE_SIZE = 10;
const EMPTY_BOOKINGS = [];

function sortBookingsByIdDescending(bookings) {
  return [...bookings].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );
}

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
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: getMyBookings,
  });

  const rawBookings = Array.isArray(data?.data)
    ? data.data
    : EMPTY_BOOKINGS;

  // Sắp xếp booking theo ID từ lớn đến nhỏ.
  const sortedBookings = useMemo(
    () => sortBookingsByIdDescending(rawBookings),
    [rawBookings],
  );

  // Tính số trang dựa trên tổng số booking.
  const totalPages = Math.max(
    1,
    Math.ceil(sortedBookings.length / PAGE_SIZE),
  );

  // Bảo đảm trang hiện tại vẫn hợp lệ khi dữ liệu thay đổi.
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Chỉ lấy tối đa 10 booking của trang hiện tại.
  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return sortedBookings.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [sortedBookings, safeCurrentPage]);

  // Hiển thị tối đa 5 nút số trang.
  const pageNumbers = useMemo(() => {
    const startPage = Math.max(
      1,
      Math.min(safeCurrentPage - 2, totalPages - 4),
    );

    const endPage = Math.min(
      totalPages,
      startPage + 4,
    );

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [safeCurrentPage, totalPages]);

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

          <p>Vui lòng thử lại sau.</p>

          <button
            type="button"
            onClick={() => refetch()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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

        {sortedBookings.length === 0 ? (
          <section className="empty-bookings">
            <div className="empty-icon">□</div>

            <h2>Chưa có booking nào</h2>

            <p>Bạn chưa đặt chuyến xe nào.</p>

            <Link
              to="/"
              className="browse-trip-button"
            >
              Tìm chuyến xe
            </Link>
          </section>
        ) : (
          <>
            <div className="my-bookings-result-info">
              Có {sortedBookings.length} booking
            </div>

            <section className="booking-list">
              {paginatedBookings.map((booking) => {
                const tickets = booking.tickets ?? [];

                const activeTicketCount = tickets.filter(
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

                        <h2>#{booking.bookingCode}</h2>
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
                        <span>Booking ID</span>
                        <strong>#{booking.id}</strong>
                      </div>

                      <div>
                        <span>Trip ID</span>
                        <strong>#{booking.tripId}</strong>
                      </div>

                      <div>
                        <span>Ngày đặt</span>
                        <strong>
                          {formatDateTime(booking.bookedAt)}
                        </strong>
                      </div>

                      <div>
                        <span>Số vé còn hiệu lực</span>
                        <strong>{activeTicketCount}</strong>
                      </div>

                      <div>
                        <span>Tổng tiền</span>
                        <strong className="booking-price">
                          {formatMoney(booking.totalAmount)}
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
                                ticket.status === "CANCELLED"
                                  ? "seat-tag cancelled"
                                  : "seat-tag"
                              }
                              key={ticket.id}
                            >
                              #{ticket.seatId}
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

            {/* Pagination */}
            <div className="my-bookings-pagination">
              <span className="pagination-info">
                Hiển thị{" "}
                {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  sortedBookings.length,
                )}{" "}
                / {sortedBookings.length} booking
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  Trước
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-btn ${
                      safeCurrentPage === page
                        ? "active"
                        : ""
                    }`}
                    aria-current={
                      safeCurrentPage === page
                        ? "page"
                        : undefined
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;