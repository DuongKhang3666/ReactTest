import { STATUS_OPTIONS } from "./bookingUtils";

function BookingFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  resultCount,
}) {
  return (
    <>
      <div className="bookings-card-header">
        <div>
          <h2>Danh sách booking</h2>
          <p>{resultCount} booking được hiển thị</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Tìm theo mã booking, ID, trip, hành khách..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
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
    </>
  );
}

export default BookingFilters;