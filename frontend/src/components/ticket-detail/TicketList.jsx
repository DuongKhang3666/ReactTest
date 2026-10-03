import StatusBadge from "../common/StatusBadge";
import "./TicketList.css";

function TicketList() {
  const tickets = [
    {
      id: "A01",
      price: "150.000đ",
      status: "Đã xác nhận",
      statusVariant: "success",
    },
    {
      id: "A02",
      price: "150.000đ",
      status: "Đã xác nhận",
      statusVariant: "success",
    },
    {
      id: "B01",
      price: "150.000đ",
      status: "Đã xác nhận",
      statusVariant: "success",
    },
    {
      id: "B02",
      price: "150.000đ",
      status: "Đã xác nhận",
      statusVariant: "success",
    },
  ];

  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "Đã hủy"
  );

  const handleTicketAction = (ticket) => {
    console.log("Ticket action:", ticket);
  };

  return (
    <section className="ticket-list">
      <div className="ticket-list__header">
        <h2>Vé đã đặt</h2>

        <span className="ticket-list__count">
          <strong>
            {activeTickets.length}/{tickets.length}
          </strong>{" "}
          vé còn hiệu lực
        </span>
      </div>

      <div className="ticket-list__table">
        <div className="ticket-list__table-header">
          <div>GHẾ</div>
          <div>GIÁ VÉ</div>
          <div>TRẠNG THÁI</div>
          <div>THAO TÁC</div>
        </div>

        {tickets.map((ticket) => (
          <div
            className="ticket-list__row"
            key={ticket.id}
          >
            <div className="ticket-list__seat">
              GHẾ {ticket.id}
            </div>

            <div className="ticket-list__price">
              {ticket.price}
            </div>

            <div>
              <StatusBadge
                status={ticket.status}
                variant={ticket.statusVariant}
              />
            </div>

            <div className="ticket-list__action">
              <button
                type="button"
                onClick={() =>
                  handleTicketAction(ticket)
                }
                aria-label={`Thao tác ghế ${ticket.id}`}
              >
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TicketList;
