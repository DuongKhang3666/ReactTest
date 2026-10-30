import { useMemo, useState } from "react";
import {
  useDeleteAdminTrip,
  useAdminTrips,
} from "../../../hooks/useTrips";

import CreateTripForm from "./CreateTripForm";
import EditTripForm from "./EditTripForm";

import "./AdminTripsPage.css";

const PAGE_SIZE = 30;

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "DEPARTED", label: "Đã khởi hành" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const EMPTY_TRIPS = [];

function sortTripsByIdDescending(trips) {
  return [...trips].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("vi-VN")} ₫`;
}

function getStatusLabel(status) {
  const option = STATUS_OPTIONS.find(
    (item) => item.value === status,
  );

  return option?.label ?? status;
}

function getLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function AdminTripsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);

  const tripsQuery = useAdminTrips();
  const deleteMutation = useDeleteAdminTrip();

  const {
    isPending,
    isError,
    refetch,
  } = tripsQuery;

  const trips = tripsQuery.data ?? EMPTY_TRIPS;

  // Sắp xếp ID trip từ lớn đến nhỏ.
  const sortedTrips = useMemo(
    () => sortTripsByIdDescending(trips),
    [trips],
  );

  // Tìm kiếm và lọc trạng thái.
  const filteredTrips = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortedTrips.filter((trip) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        trip.status === statusFilter;

      if (!normalizedSearch) {
        return matchesStatus;
      }

      const routeText = [
        trip.route?.departureCity,
        trip.route?.destinationCity,
        trip.route?.departureStation,
        trip.route?.destinationStation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const busText = [
        trip.bus?.licensePlate,
        trip.bus?.busType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        routeText.includes(normalizedSearch) ||
        busText.includes(normalizedSearch) ||
        String(trip.id).includes(normalizedSearch);

      return matchesSearch && matchesStatus;
    });
  }, [sortedTrips, search, statusFilter]);

  // Thống kê theo toàn bộ danh sách trip, không chỉ trang hiện tại.
  const statistics = useMemo(
    () => ({
      total: trips.length,
      scheduled: trips.filter(
        (trip) => trip.status === "SCHEDULED",
      ).length,
      departed: trips.filter(
        (trip) => trip.status === "DEPARTED",
      ).length,
      completed: trips.filter(
        (trip) => trip.status === "COMPLETED",
      ).length,
      cancelled: trips.filter(
        (trip) => trip.status === "CANCELLED",
      ).length,
    }),
    [trips],
  );

  // Tính toán phân trang.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrips.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTrips = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredTrips.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredTrips, safeCurrentPage]);

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

  const handleDelete = (tripId) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa chuyến #${tripId}?`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(tripId);
  };

  if (isPending) {
    return (
      <div className="admin-trips-page">
        <div className="page-loading">
          <div className="loading-spinner" />
          <p>Đang tải danh sách chuyến...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-trips-page">
        <div className="page-error">
          <div className="error-icon">!</div>

          <h2>Không thể tải dữ liệu</h2>

          <p>
            Đã xảy ra lỗi khi tải danh sách chuyến xe.
            Vui lòng thử lại sau.
          </p>

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
    <div className="admin-trips-page">
      <div className="admin-trips-container">
        {/* Header */}
        <header className="page-header">
          <div>
            <span className="page-eyebrow">
              ADMINISTRATION
            </span>

            <h1>Quản lý chuyến xe</h1>

            <p>
              Theo dõi, tạo và quản lý các chuyến xe trong hệ thống.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary create-trip-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span>＋</span>
            Tạo chuyến mới
          </button>
        </header>

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              ▣
            </div>

            <div>
              <span className="stat-label">
                Tổng chuyến
              </span>

              <strong className="stat-value">
                {statistics.total}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">
              ◷
            </div>

            <div>
              <span className="stat-label">
                Đã lên lịch
              </span>

              <strong className="stat-value">
                {statistics.scheduled}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              ➜
            </div>

            <div>
              <span className="stat-label">
                Đã khởi hành
              </span>

              <strong className="stat-value">
                {statistics.departed}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              ✓
            </div>

            <div>
              <span className="stat-label">
                Hoàn thành
              </span>

              <strong className="stat-value">
                {statistics.completed}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-red">
              ❌
            </div>

            <div>
              <span className="stat-label">
                Đã hủy
              </span>

              <strong className="stat-value">
                {statistics.cancelled}
              </strong>
            </div>
          </div>
        </section>

        {/* Main card */}
        <section className="trips-card">
          <div className="trips-card-header">
            <div>
              <h2>Danh sách chuyến xe</h2>

              <p>
                {filteredTrips.length} chuyến được hiển thị
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Tìm theo tuyến, biển số hoặc ID..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delete error */}
          {deleteMutation.isError && (
            <div className="action-error">
              Xóa chuyến thất bại. Vui lòng thử lại.
            </div>
          )}

          {/* Table */}
          {filteredTrips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">□</div>

              <h3>Không tìm thấy chuyến xe</h3>

              <p>
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="trips-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tuyến</th>
                    <th>Xe</th>
                    <th>Khởi hành</th>
                    <th>Đến</th>
                    <th>Giá vé</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td>
                        <span className="trip-id">
                          #{trip.id}
                        </span>
                      </td>

                      <td>
                        <div className="route-cell">
                          <strong>
                            {trip.route?.departureCity}
                          </strong>

                          <span className="route-arrow">
                            →
                          </span>

                          <strong>
                            {trip.route?.destinationCity}
                          </strong>
                        </div>

                        <span className="station-text">
                          {trip.route?.departureStation ||
                            "Chưa cập nhật"}{" "}
                          →{" "}
                          {trip.route?.destinationStation ||
                            "Chưa cập nhật"}
                        </span>
                      </td>

                      <td>
                        <div className="bus-cell">
                          <strong>
                            {trip.bus?.licensePlate}
                          </strong>

                          <span>
                            {trip.bus?.busType}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="date-time">
                          {formatDateTime(
                            trip.departureTime,
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="date-time">
                          {formatDateTime(
                            trip.arrivalTime,
                          )}
                        </span>
                      </td>

                      <td>
                        <strong className="price-text">
                          {formatPrice(trip.price)}
                        </strong>
                      </td>

                      <td>
                        <span className="note-text">
                          {trip.notes || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${trip.status.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {getStatusLabel(trip.status)}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="icon-btn edit-btn"
                            title="Chỉnh sửa"
                            onClick={() =>
                              setEditingTripId(trip.id)
                            }
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="icon-btn delete-btn"
                            title="Xóa"
                            disabled={
                              deleteMutation.isPending
                            }
                            onClick={() =>
                              handleDelete(trip.id)
                            }
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredTrips.length > 0 && (
            <div className="table-pagination">
              <span className="pagination-info">
                Hiển thị{" "}
                {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredTrips.length,
                )}{" "}
                / {filteredTrips.length} chuyến
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

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowCreateModal(false)}
            >
              ×
            </button>

            <CreateTripForm
              onClose={() => setShowCreateModal(false)}
              today={getLocalDateTime()}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTripId !== null && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingTripId(null);
            }
          }}
        >
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setEditingTripId(null)}
            >
              ×
            </button>

            <EditTripForm
              key={editingTripId}
              tripId={editingTripId}
              onClose={() => setEditingTripId(null)}
              today={getLocalDateTime()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTripsPage;