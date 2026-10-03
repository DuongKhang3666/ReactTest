import StatusBadge from "../common/StatusBadge";
import "./BookingSummary.css";

function BookingSummary() {
  const handleViewTicket = () => {
    console.log("Xem vé điện tử");
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleCancelBooking = () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn hủy toàn bộ đặt vé không?"
    );

    if (!confirmed) {
      return;
    }

    console.log("Hủy toàn bộ đặt vé");
  };

  return (
    <aside className="booking-summary">
      <h2 className="booking-summary__title">
        Tóm tắt đặt vé
      </h2>

      {/* ================= INFO ================= */}

      <div className="booking-summary__info">
        <div className="booking-summary__row">
          <span>Mã đặt vé</span>

          <strong className="booking-summary__booking-code">
            BK20261012001
          </strong>
        </div>

        <div className="booking-summary__row">
          <span>Ngày đặt</span>

          <strong>10/10/2026 14:32</strong>
        </div>

        <div className="booking-summary__row">
          <span>Tổng số vé</span>

          <strong>4 vé</strong>
        </div>
      </div>

      <div className="booking-summary__divider" />

      {/* ================= TOTAL ================= */}

      <div className="booking-summary__total">
        <span>Tổng tiền</span>

        <strong>600.000đ</strong>
      </div>

      {/* ================= STATUS ================= */}

      <div className="booking-summary__status">
        <span>Trạng thái</span>

        <StatusBadge
          status="Đã xác nhận"
          variant="success"
        />
      </div>

      {/* ================= ACTIONS ================= */}

      <div className="booking-summary__actions">
        <button
          type="button"
          className="
            booking-summary__button
            booking-summary__button--primary
          "
          onClick={handleViewTicket}
        >
          <span className="booking-summary__button-icon">
            ⊙
          </span>

          Xem vé điện tử
        </button>

        <button
          type="button"
          className="booking-summary__button"
          onClick={handleExportPdf}
        >
          <span className="booking-summary__button-icon">
            ⇩
          </span>

          Xuất vé PDF
        </button>

        <button
          type="button"
          className="
            booking-summary__button
            booking-summary__button--danger
          "
          onClick={handleCancelBooking}
        >
          <span className="booking-summary__button-icon">
            ♧
          </span>

          Hủy toàn bộ đặt vé
        </button>
      </div>
    </aside>
  );
}

export default BookingSummary;
