import Icon from "./Icon";

export default function EmptyState({ icon = "bus", title, children }) {
  return (
    <div className="state">
      <Icon name={icon} size={40} />
      <p><strong>{title}</strong></p>
      {children}
    </div>
  );
}
