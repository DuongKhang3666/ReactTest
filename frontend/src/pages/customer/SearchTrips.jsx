import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "../../components/common/SearchForm";
import TripCard from "../../components/common/TripCard";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import RouteLabel from "../../components/common/RouteLabel";
import { searchTripsQuery } from "../../queries/tripQueries";
import { cityLabel } from "../../utils/cities";
import { formatDate, formatPrice, toDateInputValue } from "../../utils/format";

const TIME_SLOTS = [
  { id: "night", label: "Sáng sớm 00:00–06:00", from: 0, to: 6 },
  { id: "morning", label: "Buổi sáng 06:00–12:00", from: 6, to: 12 },
  { id: "afternoon", label: "Buổi chiều 12:00–18:00", from: 12, to: 18 },
  { id: "evening", label: "Buổi tối 18:00–24:00", from: 18, to: 24 },
];

const SORTS = {
  "time-asc": { label: "Giờ đi sớm nhất", fn: (a, b) => new Date(a.departureTime) - new Date(b.departureTime) },
  "time-desc": { label: "Giờ đi muộn nhất", fn: (a, b) => new Date(b.departureTime) - new Date(a.departureTime) },
  "price-asc": { label: "Giá thấp nhất", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Giá cao nhất", fn: (a, b) => b.price - a.price },
  "duration-asc": { label: "Thời gian ngắn nhất", fn: (a, b) => a.route.durationMinutes - b.route.durationMinutes },
};

export default function SearchTrips() {
  const [params, setParams] = useSearchParams();
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const date = params.get("date") ?? toDateInputValue();

  // Server state: kết quả tìm kiếm. queryKey = ["trips", from, to, date]
  const { data: trips, isPending, isError, error, refetch, isFetching } = useQuery(searchTripsQuery({ from, to, date }));

  const handleSearch = (next) => {
    const p = new URLSearchParams();
    if (next.from) p.set("from", next.from);
    if (next.to) p.set("to", next.to);
    if (next.date) p.set("date", next.date);
    setParams(p);
  };

  const title = from && to ? <RouteLabel from={cityLabel(from)} to={cityLabel(to)} /> : "Tất cả chuyến xe";

  return (
    <div className="container page">
      <div className="card search-bar">
        <SearchForm key={`${from}|${to}|${date}`} initial={{ from, to, date }} onSubmit={handleSearch} submitLabel="Tìm lại" />
      </div>

      <div className="page__head">
        <h1>{title}</h1>
        <span className="muted">{formatDate(`${date}T00:00:00`)}{isFetching && !isPending ? " · đang cập nhật..." : ""}</span>
      </div>

      {isPending && <Spinner label="Đang tìm chuyến..." />}
      {isError && <ErrorState error={error} onRetry={refetch} title="Không tìm được chuyến xe" />}
      {trips && (
        trips.length === 0 ? (
          <EmptyState title="Không có chuyến nào phù hợp">
            Hãy thử đổi ngày đi hoặc chọn tuyến khác.
          </EmptyState>
        ) : (
          // key: đổi tìm kiếm thì reset bộ lọc (client state)
          <TripResults key={`${from}|${to}|${date}`} trips={trips} />
        )
      )}
    </div>
  );
}

function TripResults({ trips }) {
  // Client/UI state: bộ lọc & sắp xếp (không phải server state)
  const [sort, setSort] = useState("time-asc");
  const [slots, setSlots] = useState([]);
  const [busTypes, setBusTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [hideSoldOut, setHideSoldOut] = useState(false);

  const allBusTypes = useMemo(() => [...new Set(trips.map((t) => t.bus.busType))].sort(), [trips]);
  const priceCeil = useMemo(() => Math.ceil(Math.max(...trips.map((t) => t.price)) / 10000) * 10000, [trips]);
  const priceLimit = maxPrice ?? priceCeil;

  const visible = useMemo(() => {
    const toggleSlots = slots.map((id) => TIME_SLOTS.find((s) => s.id === id));
    return trips
      .filter((t) => {
        if (toggleSlots.length) {
          const h = new Date(t.departureTime).getHours();
          if (!toggleSlots.some((s) => h >= s.from && h < s.to)) return false;
        }
        if (busTypes.length && !busTypes.includes(t.bus.busType)) return false;
        if (t.price > priceLimit) return false;
        if (hideSoldOut && t.availableSeats <= 0) return false;
        return true;
      })
      .sort(SORTS[sort].fn);
  }, [trips, slots, busTypes, priceLimit, hideSoldOut, sort]);

  const toggle = (setter) => (value) =>
    setter((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));

  const hasFilter = slots.length || busTypes.length || maxPrice !== null || hideSoldOut;
  const reset = () => { setSlots([]); setBusTypes([]); setMaxPrice(null); setHideSoldOut(false); };

  return (
    <div className="results">
      <aside className="card filters" aria-label="Bộ lọc">
        <div className="filters__head">
          <strong>Bộ lọc</strong>
          {hasFilter ? <button type="button" className="link-btn" onClick={reset}>Xóa lọc</button> : null}
        </div>

        <fieldset>
          <legend>Giờ đi</legend>
          {TIME_SLOTS.map((s) => (
            <label className="check" key={s.id}>
              <input type="checkbox" checked={slots.includes(s.id)} onChange={() => toggle(setSlots)(s.id)} /> {s.label}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Loại xe</legend>
          {allBusTypes.map((t) => (
            <label className="check" key={t}>
              <input type="checkbox" checked={busTypes.includes(t)} onChange={() => toggle(setBusTypes)(t)} /> {t}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Giá tối đa: {formatPrice(priceLimit)}</legend>
          <input
            type="range" min={0} max={priceCeil} step={10000} value={priceLimit}
            onChange={(e) => setMaxPrice(Number(e.target.value) >= priceCeil ? null : Number(e.target.value))}
            aria-label="Giá tối đa"
          />
        </fieldset>

        <label className="check">
          <input type="checkbox" checked={hideSoldOut} onChange={(e) => setHideSoldOut(e.target.checked)} /> Ẩn chuyến hết chỗ
        </label>
      </aside>

      <section className="results__list">
        <div className="results__bar">
          <span><strong>{visible.length}</strong> / {trips.length} chuyến</span>
          <label className="inline-field">
            Sắp xếp:
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="search" title="Không có chuyến khớp bộ lọc">
            <button type="button" className="btn btn--outline" onClick={reset}>Xóa bộ lọc</button>
          </EmptyState>
        ) : (
          visible.map((t) => <TripCard key={t.id} trip={t} />)
        )}
      </section>
    </div>
  );
}
