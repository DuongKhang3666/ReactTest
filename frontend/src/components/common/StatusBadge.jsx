import "./StatusBadge.css";

function StatusBadge({
  status = "Đã xác nhận",
  variant = "success",
}) {
  return (
    <span
      className={`status-badge status-badge--${variant}`}
    >
      <span className="status-badge__dot" />
      {status}
    </span>
  );
}

export default StatusBadge;
