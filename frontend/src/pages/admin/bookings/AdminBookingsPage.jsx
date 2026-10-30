import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  confirmAdminBooking,
  getAllBookings,
} from "../../../api/adminBookingApi";

import BookingStats from "./BookingStats";
import BookingFilters from "./BookingFilters";
import BookingTable from "./BookingTable";
import BookingDetailModal from "./BookingDetailModal";

import "./AdminBookingsPage.css";

const PAGE_SIZE = 30;
const EMPTY_BOOKINGS = [];

function sortBookingsByIdDescending(bookings) {
  return [...bookings].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );
}

function AdminBookingsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: getAllBookings,
  });

  const confirmMutation = useMutation({
    mutationFn: confirmAdminBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "bookings"],
      });

      setSelectedBooking(null);
    },
  });

  const bookings = data?.data ?? EMPTY_BOOKINGS;

  // Sắp xếp ID booking từ lớn đến nhỏ.
  const sortedBookings = useMemo(
    () => sortBookingsByIdDescending(bookings),
    [bookings],
  );

  // Tìm kiếm và lọc trạng thái.
  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortedBookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const bookingText = [
        booking.id,
        booking.bookingCode,
        booking.tripId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const ticketText = (booking.tickets ?? [])
        .map((ticket) =>
          [
            ticket.passengerName,
            ticket.passengerPhone,
            ticket.seatNumber,
          ]
            .filter(Boolean)
            .join(" "),
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        bookingText.includes(normalizedSearch) ||
        ticketText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [sortedBookings, search, statusFilter]);

  // Tính toán phân trang.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredBookings.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredBookings, safeCurrentPage]);

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

  const handleConfirm = (bookingId) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xác nhận booking #${bookingId}?`,
    );

    if (!confirmed) {
      return;
    }

    confirmMutation.mutate(bookingId);
  };

  if (isPending) {
    return (
      <div className="admin-bookings-page">
        <div className="page-loading">
          <div className="loading-spinner" />
          <p>Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-bookings-page">
        <div className="page-error">
          <div className="error-icon">!</div>

          <h2>Không thể tải dữ liệu</h2>

          <p>Vui lòng thử lại sau.</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => refetch()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-container">
        <header className="page-header">
          <div>
            <span className="page-eyebrow">
              ADMINISTRATION
            </span>

            <h1>Quản lý booking</h1>

            <p>
              Theo dõi, xác nhận và xem chi tiết booking
              của khách hàng.
            </p>
          </div>
        </header>

        <BookingStats bookings={bookings} />

        <section className="bookings-card">
          <BookingFilters
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            resultCount={filteredBookings.length}
          />

          {confirmMutation.isError && (
            <div className="action-error">
              Xác nhận booking thất bại:{" "}
              {confirmMutation.error?.message}
            </div>
          )}

          <BookingTable
            bookings={paginatedBookings}
            onView={setSelectedBooking}
            onConfirm={handleConfirm}
            isConfirming={confirmMutation.isPending}
          />

          {/* Pagination */}
          {filteredBookings.length > 0 && (
            <div className="table-pagination">
              <span className="pagination-info">
                Hiển thị{" "}
                {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredBookings.length,
                )}{" "}
                / {filteredBookings.length} booking
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
                      safeCurrentPage === page ? "active" : ""
                    }`}
                    aria-current={
                      safeCurrentPage === page ? "page" : undefined
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
          )}
        </section>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirm}
          isConfirming={confirmMutation.isPending}
        />
      )}
    </div>
  );
}

export default AdminBookingsPage;