import Icon from "./Icon";

export default function EmptyState({ icon = "bus", title, children }) {
  return (
    <div className="state state--empty">
      <div className="state__icon"><Icon name={icon} size={40} /></div>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}
