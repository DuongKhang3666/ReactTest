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

function AdminBookingsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data,
    isPending,
    isError,
    error,
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

  const bookings = data?.data ?? [];

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return bookings.filter((booking) => {
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

      return (
        matchesStatus &&
        (bookingText.includes(normalizedSearch) ||
          ticketText.includes(normalizedSearch))
      );
    });
  }, [bookings, search, statusFilter]);

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

          <p>{error?.message}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "bookings"],
              })
            }
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
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            resultCount={filteredBookings.length}
          />

          {confirmMutation.isError && (
            <div className="action-error">
              Xác nhận booking thất bại:{" "}
              {confirmMutation.error?.message}
            </div>
          )}

          <BookingTable
            bookings={filteredBookings}
            onView={setSelectedBooking}
            onConfirm={handleConfirm}
            isConfirming={confirmMutation.isPending}
          />
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