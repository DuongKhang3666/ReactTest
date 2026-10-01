import { useQuery } from "@tanstack/react-query";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import RouteLabel from "../../components/common/RouteLabel";
import { dashboardQuery } from "../../queries/adminQueries";
import { cityLabel } from "../../utils/cities";
import { formatDate, formatDateTime, formatPrice } from "../../utils/format";

const STATUS = {
  PENDING: { label: "Chờ xác nhận", cls: "badge--warn" },
  CONFIRMED: { label: "Đã xác nhận", cls: "badge--ok" },
  CANCELLED: { label: "Đã hủy", cls: "badge--danger" },
};

export default function Dashboard() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(dashboardQuery());

  return (
    <div className="admin__page">
      <div className="page__head">
        <h1>Dashboard</h1>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => refetch()} disabled={isFetching}>
          <Icon name="refresh" size={16} className={isFetching ? "icon--spin" : ""} />
          {isFetching ? "Đang làm mới..." : "Làm mới"}
        </button>
      </div>

      {isPending && <Spinner label="Đang tải thống kê..." />}
      {isError && <ErrorState error={error} onRetry={refetch} title="Không tải được thống kê" />}
      {data && <DashboardContent data={data} />}
    </div>
  );
}

function DashboardContent({ data }) {
  const cards = [
    { label: "Doanh thu", value: formatPrice(data.totalRevenue), icon: "wallet" },
    { label: "Tổng vé đặt", value: data.totalBookings, icon: "ticket" },
    { label: "Chuyến xe", value: data.totalTrips, icon: "calendar" },
    { label: "Người dùng", value: data.totalUsers, icon: "users" },
    { label: "Xe", value: data.totalBuses, icon: "bus" },
    { label: "Tuyến", value: data.totalRoutes, icon: "route" },
  ];
  const maxRevenue = Math.max(1, ...data.revenueLast7Days.map((d) => d.revenue));
  const statusTotal = Object.values(data.bookingsByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <div className="grid grid--6 stats">
        {cards.map((c) => (
          <div className="card stat" key={c.label}>
            <span className="stat__icon"><Icon name={c.icon} size={22} /></span>
            <span className="muted">{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid grid--2">
        <section className="card">
          <h2>Doanh thu 7 ngày gần nhất</h2>
          <div className="chart" role="img" aria-label="Biểu đồ doanh thu 7 ngày">
            {data.revenueLast7Days.map((d) => (
              <div className="chart__col" key={d.date} title={`${formatDate(d.date)}: ${formatPrice(d.revenue)} · ${d.bookings} vé`}>
                <span className="chart__value">{(d.revenue / 1_000_000).toFixed(1)}tr</span>
                <div className="chart__bar" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }} />
                <span className="chart__label">{new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Vé theo trạng thái</h2>
          <ul className="status-list">
            {Object.entries(STATUS).map(([key, s]) => {
              const count = data.bookingsByStatus[key] ?? 0;
              return (
                <li key={key}>
                  <div className="status-list__row">
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="progress"><div className={`progress__bar ${s.cls}`} style={{ width: `${(count / statusTotal) * 100}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid grid--2">
        <section className="card">
          <h2>Chuyến sắp khởi hành</h2>
          {data.upcomingTrips.length === 0 ? (
            <EmptyState icon="calendar" title="Không có chuyến sắp tới" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Tuyến</th><th>Khởi hành</th><th>Còn chỗ</th></tr></thead>
                <tbody>
                  {data.upcomingTrips.map((t) => (
                    <tr key={t.id}>
                      <td><RouteLabel from={cityLabel(t.route.departureCity)} to={cityLabel(t.route.destinationCity)} /></td>
                      <td>{formatDateTime(t.departureTime)}</td>
                      <td>{t.availableSeats}/{t.bus.seatCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Vé đặt gần đây</h2>
          {data.recentBookings.length === 0 ? (
            <EmptyState icon="ticket" title="Chưa có vé nào" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Mã vé</th><th>Khách</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {data.recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.bookingCode}</td>
                      <td>{b.customerName}</td>
                      <td>{formatPrice(b.totalAmount)}</td>
                      <td><span className={`badge ${STATUS[b.status]?.cls ?? ""}`}>{STATUS[b.status]?.label ?? b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
