import "./HeaderTicketDetail.css";

function HeaderTicketDetail() {
  return (
    <header className="ticket-detail-header">
      <div className="ticket-detail-header__left">
        <button
          type="button"
          className="ticket-detail-header__back"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <div className="ticket-detail-header__title-wrapper">
          <div className="ticket-detail-header__breadcrumb">
            Vé của tôi
            <span>/</span>
            Chi tiết đặt vé
          </div>

          <div className="ticket-detail-header__title-row">
            <h1>Chi tiết đặt vé</h1>

            <span className="ticket-status ticket-status--confirmed">
              <span className="ticket-status__dot" />
              Đã xác nhận
            </span>
          </div>
        </div>
      </div>

      <div className="ticket-detail-header__passenger">
        <span className="ticket-detail-header__passenger-label">
          Hành khách
        </span>

        <div className="ticket-detail-header__passenger-info">
          <div className="ticket-detail-header__avatar">
            NA
          </div>

          <span className="ticket-detail-header__passenger-name">
            Nguyễn Văn A
          </span>
        </div>
      </div>
    </header>
  );
}

export default HeaderTicketDetail;
