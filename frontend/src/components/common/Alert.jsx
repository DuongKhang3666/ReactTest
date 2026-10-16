export default function Alert({ type = "error", children }) {
  if (!children) return null;
  return <div className={type === "success" ? "alert alert--success" : "alert"}>{children}</div>;
}
