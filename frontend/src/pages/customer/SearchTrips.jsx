import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchForm from "../../components/common/SearchForm";
import TripCard from "../../components/common/TripCard";
import TripFilters from "../../components/common/TripFilters";
import RouteLabel from "../../components/common/RouteLabel";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useSearchTrips } from "../../queries/tripQueries";
import { cityLabel } from "../../utils/cities";
import { formatDate, toDateInputValue } from "../../utils/format";
import { DEFAULT_FILTERS, SORT_OPTIONS, filterTrips, sortTrips } from "../../utils/tripFilters";

export default function SearchTrips() {
  // Điều kiện tìm (from, to, date) nằm trên URL: /trips?from=TP.HCM&to=Đà Nẵng&date=2026-10-05
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const date = searchParams.get("date") ?? toDateInputValue();

  // DỮ LIỆU TỪ SERVER (server state) -> TanStack Query
  const { data: trips, isPending, isError, error, refetch } = useSearchTrips(from, to, date);

  // TRẠNG THÁI GIAO DIỆN (client state) -> useState
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("time-asc");

  const handleSearch = (condition) => {
    const params = new URLSearchParams();
    if (condition.from) params.set("from", condition.from);
    if (condition.to) params.set("to", condition.to);
    params.set("date", condition.date);
    setSearchParams(params);
  };

  // Lọc rồi sắp xếp danh sách chuyến đã tải về
  const busTypes = trips ? [...new Set(trips.map((trip) => trip.bus.busType))] : [];
  const visibleTrips = trips ? sortTrips(filterTrips(trips, filters), sortBy) : [];

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <SearchForm key={`${from}|${to}|${date}`} initial={{ from, to, date }} onSubmit={handleSearch} submitLabel="Tìm lại" />
      </div>

      <div className="row">
        <h1>{from && to ? <RouteLabel from={cityLabel(from)} to={cityLabel(to)} /> : "Tất cả chuyến xe"}</h1>
        <span className="muted">{formatDate(`${date}T00:00:00`)}</span>
      </div>

      {isPending && <Spinner label="Đang tìm chuyến..." />}
      {isError && <ErrorState error={error} onRetry={refetch} title="Không tìm được chuyến xe" />}

      {trips?.length === 0 && (
        <EmptyState title="Không có chuyến nào phù hợp">Hãy thử đổi ngày đi hoặc chọn tuyến khác.</EmptyState>
      )}

      {trips?.length > 0 && (
        <div className="results">
          <TripFilters filters={filters} busTypes={busTypes} onChange={setFilters} />

          <section>
            <div className="row" style={{ marginBottom: 12 }}>
              <span><strong>{visibleTrips.length}</strong> / {trips.length} chuyến</span>
              <label style={{ margin: 0 }}>
                Sắp xếp
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {visibleTrips.length === 0 ? (
              <EmptyState icon="search" title="Không có chuyến khớp bộ lọc">
                <button type="button" className="btn btn-outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Xóa bộ lọc</button>
              </EmptyState>
            ) : (
              visibleTrips.map((trip) => (
                <div key={trip.id} style={{ marginBottom: 12 }}><TripCard trip={trip} /></div>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
