import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/common/Icon";

const ITEMS = [
  { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/admin/buses", icon: "bus", label: "Xe" },
  { to: "/admin/routes", icon: "route", label: "Tuyến" },
  { to: "/admin/trips", icon: "calendar", label: "Chuyến" },
  { to: "/admin/bookings", icon: "ticket", label: "Vé" },
  { to: "/admin/users", icon: "users", label: "Người dùng" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Link to="/admin/dashboard" className="brand brand--light"><Icon name="bus" size={24} /> <span>Admin</span></Link>
        <nav className="admin__nav">
          {ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? "admin__link is-active" : "admin__link")}>
              <Icon name={i.icon} size={18} />
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__footer">
          <div className="muted-light">{user?.fullName || user?.username}</div>
          <Link to="/" className="admin__link"><Icon name="arrow-left" size={16} /> Về trang khách</Link>
          <button type="button" className="admin__link admin__logout" onClick={() => { logout(); navigate("/login", { replace: true }); }}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin__content"><Outlet /></main>
    </div>
  );
}
