import HeaderTicketDetail from "../../../components/HeaderTicketDetail/HeaderTicketDetail";
import TicketInfo from "../../../components/ticket-detail/TicketInfo";
import TicketList from "../../../components/ticket-detail/TicketList";
import BookingSummary from "../../../components/ticket-detail/BookingSummary";

import "./TicketsDetailPage.css";

function TicketsDetailPage() {
  return (
    <div className="tickets-detail-page">
      <HeaderTicketDetail />

      <main className="tickets-detail-page__container">
        <div className="tickets-detail-page__main">
          <TicketInfo />

          <TicketList />
        </div>

        <BookingSummary />
      </main>
    </div>
  );
}

export default TicketsDetailPage;
