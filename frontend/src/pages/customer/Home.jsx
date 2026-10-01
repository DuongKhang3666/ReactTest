import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "../../components/common/SearchForm";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import RouteLabel from "../../components/common/RouteLabel";
import { popularRoutesQuery } from "../../queries/tripQueries";
import { formatDuration, formatPrice, toDateInputValue } from "../../utils/format";

const FEATURES = [
  { icon: "search", title: "Tìm chuyến nhanh", text: "Lọc theo giờ đi, giá, loại xe chỉ trong vài giây." },
  { icon: "seat", title: "Chọn ghế trực quan", text: "Xem sơ đồ ghế và chọn đúng chỗ bạn thích." },
  { icon: "ticket", title: "Quản lý vé dễ dàng", text: "Xem lại và hủy vé ngay trong mục Vé của tôi." },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: routes, isPending, isError, error, refetch } = useQuery(popularRoutesQuery());

  const goSearch = ({ from, to, date }) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Đặt vé xe đường dài<br />dễ dàng, nhanh chóng</h1>
          <p>Hàng trăm chuyến mỗi ngày trên các tuyến phổ biến toàn quốc.</p>
          <div className="card hero__search"><SearchForm onSubmit={goSearch} /></div>
        </div>
      </section>

      <section className="container page">
        <h2>Tuyến phổ biến</h2>
        {isPending && <Spinner />}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {routes?.length === 0 && <EmptyState title="Chưa có tuyến phổ biến" />}
        {routes?.length > 0 && (
          <div className="grid grid--4">
            {routes.map((r) => (
              <Link
                key={`${r.from}-${r.to}`}
                className="card route-card"
                to={`/trips?from=${r.from}&to=${r.to}&date=${toDateInputValue()}`}
              >
                <strong><RouteLabel from={r.fromLabel} to={r.toLabel} stacked /></strong>
                <span className="muted">{formatDuration(r.durationMinutes)} · từ {formatPrice(r.fromPrice)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container page">
        <div className="grid grid--3">
          {FEATURES.map((f) => (
            <div className="card feature" key={f.title}>
              <div className="feature__icon"><Icon name={f.icon} size={32} /></div>
              <strong>{f.title}</strong>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
