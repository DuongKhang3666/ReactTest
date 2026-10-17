import "../../styles/fe1.css";
import Spinner from "../../components/common/Spinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import RouteLabel from "../../components/common/RouteLabel";
import { useDashboard } from "../../queries/adminQueries";
import { cityLabel } from "../../utils/cities";
import { formatDate, formatDateTime, formatPrice } from "../../utils/format";

const STATUS = {
  PENDING: { label: "Chờ xác nhận", cls: "badge--warn" },
  CONFIRMED: { label: "Đã xác nhận", cls: "badge--ok" },
  CANCELLED: { label: "Đã hủy", cls: "badge--danger" },
};

export default function Dashboard() {
  const { data, isPending, isError, error, refetch, isFetching } = useDashboard();

  return (
    <div className="fe1">
      <div className="row">
        <h1>Dashboard</h1>
        <button type="button" className="btn btn-outline" onClick={() => refetch()} disabled={isFetching}>
          <Icon name="refresh" size={16} /> {isFetching ? "Đang làm mới..." : "Làm mới"}
        </button>
      </div>

      {isPending && <Spinner label="Đang tải thống kê..." />}
      {isError && <ErrorState error={error} onRetry={refetch} title="Không tải được thống kê" />}
      {data && <DashboardContent data={data} />}
    </div>
  );
}

function DashboardContent({ data }) {
  // Backend hiện chỉ trả 4 số tổng; các trường còn lại có thể không có -> kiểm tra trước khi hiển thị
  const cards = [
    { label: "Doanh thu", value: data.totalRevenue == null ? null : formatPrice(data.totalRevenue), icon: "wallet" },
    { label: "Tổng vé đặt", value: data.totalBookings, icon: "ticket" },
    { label: "Chuyến xe", value: data.totalTrips, icon: "calendar" },
    { label: "Người dùng", value: data.totalUsers, icon: "users" },
    { label: "Xe", value: data.totalBuses, icon: "bus" },
    { label: "Tuyến", value: data.totalRoutes, icon: "route" },
  ].filter((card) => card.value != null);

  const revenueLast7Days = data.revenueLast7Days ?? [];
  const maxRevenue = Math.max(1, ...revenueLast7Days.map((d) => d.revenue));
  const bookingsByStatus = data.bookingsByStatus;
  const upcomingTrips = data.upcomingTrips;
  const recentBookings = data.recentBookings;

  return (
    <>
      <div className="grid">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <Icon name={card.icon} size={22} className="blue" />
            <p className="muted">{card.label}</p>
            <strong className="big">{card.value}</strong>
          </div>
        ))}
      </div>

      {(revenueLast7Days.length > 0 || bookingsByStatus) && (
      <div className="grid-2">
        {revenueLast7Days.length > 0 && (
        <section className="card">
          <h2>Doanh thu 7 ngày gần nhất</h2>
          <div className="bars">
            {revenueLast7Days.map((day) => (
              <div key={day.date} title={`${formatDate(day.date)}: ${formatPrice(day.revenue)} · ${day.bookings} vé`}>
                <small>{(day.revenue / 1000000).toFixed(1)}tr</small>
                <span style={{ height: `${(day.revenue / maxRevenue) * 80}%` }} />
                <small>{formatDate(day.date).slice(0, 5)}</small>
              </div>
            ))}
          </div>
        </section>
        )}

        {bookingsByStatus && (
        <section className="card">
          <h2>Vé theo trạng thái</h2>
          {Object.entries(STATUS).map(([key, status]) => (
            <p className="row" key={key}>
              <span className={`badge ${status.cls}`}>{status.label}</span>
              <strong>{bookingsByStatus[key] ?? 0}</strong>
            </p>
          ))}
        </section>
        )}
      </div>
      )}

      {(upcomingTrips || recentBookings) && (
      <div className="grid-2">
        {upcomingTrips && (
        <section className="card">
          <h2>Chuyến sắp khởi hành</h2>
          {upcomingTrips.length === 0 ? (
            <EmptyState icon="calendar" title="Không có chuyến sắp tới" />
          ) : (
            <table>
              <thead><tr><th>Tuyến</th><th>Khởi hành</th><th>Còn chỗ</th></tr></thead>
              <tbody>
                {upcomingTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td><RouteLabel from={cityLabel(trip.route.departureCity)} to={cityLabel(trip.route.destinationCity)} /></td>
                    <td>{formatDateTime(trip.departureTime)}</td>
                    <td>{trip.availableSeats ?? "-"}/{trip.bus.seatCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        )}

        {recentBookings && (
        <section className="card">
          <h2>Vé đặt gần đây</h2>
          {recentBookings.length === 0 ? (
            <EmptyState icon="ticket" title="Chưa có vé nào" />
          ) : (
            <table>
              <thead><tr><th>Mã vé</th><th>Khách</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.bookingCode}</td>
                    <td>{booking.customerName}</td>
                    <td>{formatPrice(booking.totalAmount)}</td>
                    <td><span className={`badge ${STATUS[booking.status]?.cls}`}>{STATUS[booking.status]?.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        )}
      </div>
      )}
    </>
  );
}
