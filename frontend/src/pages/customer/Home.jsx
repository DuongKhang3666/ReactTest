import { Link, useNavigate } from "react-router-dom";
import SearchForm from "../../components/common/SearchForm";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import Icon from "../../components/common/Icon";
import RouteLabel from "../../components/common/RouteLabel";
import { usePopularRoutes } from "../../queries/tripQueries";
import { cityLabel } from "../../utils/cities";
import { formatDuration, formatPrice, toDateInputValue } from "../../utils/format";

const FEATURES = [
  { icon: "search", title: "Tìm chuyến nhanh", text: "Lọc theo giờ đi, giá, loại xe chỉ trong vài giây." },
  { icon: "seat", title: "Chọn ghế trực quan", text: "Xem sơ đồ ghế và chọn đúng chỗ bạn thích." },
  { icon: "ticket", title: "Quản lý vé dễ dàng", text: "Xem lại và hủy vé ngay trong mục Vé của tôi." },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: routes, isPending, isError, error, refetch } = usePopularRoutes();

  // Bấm "Tìm chuyến": chuyển sang trang /trips, điều kiện tìm đặt trên URL
  const handleSearch = ({ from, to, date }) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("date", date);
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Đặt vé xe đường dài dễ dàng, nhanh chóng</h1>
          <p>Hàng trăm chuyến mỗi ngày trên các tuyến phổ biến toàn quốc.</p>
          <div className="card"><SearchForm onSubmit={handleSearch} /></div>
        </div>
      </section>

      <section className="container">
        {routes?.length > 0 && <h2>Tuyến phổ biến</h2>}
        {isPending && <Spinner />}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {routes?.length > 0 && (
          <div className="grid">
            {routes.map((route) => (
              <Link key={`${route.from}-${route.to}`} className="card" to={`/trips?${new URLSearchParams({ from: route.from, to: route.to, date: toDateInputValue() })}`}>
                <p><strong><RouteLabel from={cityLabel(route.from)} to={cityLabel(route.to)} /></strong></p>
                <p className="muted">{formatDuration(route.durationMinutes)} · từ {formatPrice(route.fromPrice)}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="grid">
          {FEATURES.map((feature) => (
            <div className="card" key={feature.title}>
              <Icon name={feature.icon} size={32} className="blue" />
              <p><strong>{feature.title}</strong></p>
              <p className="muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
