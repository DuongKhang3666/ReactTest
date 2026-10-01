export default function EmptyState({ icon = "🚌", title, children }) {
  return (
    <div className="state state--empty">
      <div className="state__icon" aria-hidden="true">{icon}</div>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}
