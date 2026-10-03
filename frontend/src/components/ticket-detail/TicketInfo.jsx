import "./TicketInfo.css";

function TicketInfo() {
  return (
    <section className="ticket-info">
      {/* ================= HEADER ================= */}
      <div className="ticket-info__header">
        <div>
          <div className="ticket-info__trip-label">
            Hành trình
          </div>

          <div className="ticket-info__route">
            <span>TP.HCM</span>
            <span className="ticket-info__route-arrow">→</span>
            <span>Đà Lạt</span>
          </div>
        </div>

        <div className="ticket-info__departure">
          <div className="ticket-info__departure-label">
            Khởi hành
          </div>

          <div className="ticket-info__departure-time">
            18:30
          </div>

          <div className="ticket-info__departure-date">
            12/10/2026
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="ticket-info__body">
        <div className="ticket-info__timeline">
          <div className="ticket-info__timeline-item">
            <span className="ticket-info__timeline-dot ticket-info__timeline-dot--blue" />

            <div className="ticket-info__timeline-content">
              <strong>TP.HCM</strong>

              <span>
                Điểm khởi hành · 18:30 · 12/10/2026
              </span>
            </div>
          </div>

          <div className="ticket-info__timeline-line" />

          <div className="ticket-info__timeline-item">
            <span className="ticket-info__timeline-dot ticket-info__timeline-dot--green" />

            <div className="ticket-info__timeline-content">
              <strong>Đà Lạt</strong>

              <span>
                Điểm đến · Dự kiến đến nơi
              </span>
            </div>
          </div>
        </div>

        <div className="ticket-info__divider" />

        {/* ================= DETAILS ================= */}
        <div className="ticket-info__details">
          <div className="ticket-info__detail-column">
            <div className="ticket-info__detail">
              <span>LOẠI XE</span>
              <strong>Xe giường nằm</strong>
            </div>

            <div className="ticket-info__detail">
              <span>THỜI GIAN ĐẶT</span>
              <strong>10/10/2026 14:32</strong>
            </div>
          </div>

          <div className="ticket-info__detail-column">
            <div className="ticket-info__detail">
              <span>BIỂN SỐ XE</span>
              <strong>51B-123.45</strong>
            </div>

            <div className="ticket-info__detail">
              <span>MÃ ĐẶT VÉ</span>
              <strong className="ticket-info__booking-code">
                BK20261012001
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TicketInfo;
