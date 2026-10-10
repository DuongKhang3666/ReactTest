function BookingStats({ bookings }) {
  const total = bookings.length;

  const pending = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const confirmed = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  const cancelled = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  const tickets = bookings.reduce(
    (sum, booking) =>
      sum + (booking.tickets?.length ?? 0),
    0,
  );

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon stat-icon-blue">▣</div>
        <div>
          <span className="stat-label">Tổng booking</span>
          <strong className="stat-value">{total}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-yellow">◷</div>
        <div>
          <span className="stat-label">Chờ xác nhận</span>
          <strong className="stat-value">{pending}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-green">✓</div>
        <div>
          <span className="stat-label">Đã xác nhận</span>
          <strong className="stat-value">{confirmed}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-red">❌</div>
        <div>
          <span className="stat-label">Đã hủy</span>
          <strong className="stat-value">{cancelled}</strong>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-purple">♙</div>
        <div>
          <span className="stat-label">Tổng số vé</span>
          <strong className="stat-value">{tickets}</strong>
        </div>
      </div>
    </section>
  );
}

export default BookingStats;