

export default function StatusBadge({ active }) {
    return (
        <span
            className={`status-badge ${
                active ? "status-badge-active" : "status-badge-inactive"
            }`}
        >
      <span className="status-dot" />
            {active ? "Hoạt động" : "Ngừng hoạt động"}
    </span>
    );
}
